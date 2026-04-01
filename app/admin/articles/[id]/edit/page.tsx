'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { ChevronLeft, Upload, Loader2, Check, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function EditArticlePage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [article, setArticle] = useState<any>(null)
  const [loadingArticle, setLoadingArticle] = useState(true)
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    body: '',
    category: 'features',
    tags: '',
    designer_slug: '',
    status: 'draft',
    read_time: 5
  })

  useEffect(() => {
    async function loadArticle() {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error || !data) {
        alert('Article not found')
        router.push('/admin/articles')
        return
      }

      setArticle(data)
      setFormData({
        title: data.title || '',
        subtitle: data.subtitle || '',
        body: data.body || '',
        category: data.category || 'features',
        tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
        designer_slug: data.designer_slug || '',
        status: data.status || 'draft',
        read_time: data.read_time || 5
      })
      setCoverImage(data.cover_image)
      setLoadingArticle(false)
    }

    if (params.id) {
      loadArticle()
    }
  }, [params.id])

  const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  async function handleSave(publish = false) {
    if (!formData.title.trim()) {
      alert('Please enter a title')
      return
    }

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const updateData: any = {
        title: formData.title,
        subtitle: formData.subtitle,
        body: formData.body,
        category: formData.category,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        designer_slug: formData.designer_slug || null,
        status: publish ? 'published' : formData.status,
        cover_image: coverImage,
        read_time: formData.read_time,
        updated_at: new Date().toISOString()
      }

      if (publish) {
        updateData.published_at = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('articles')
        .update(updateData)
        .eq('id', params.id)
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw new Error(error.message)
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      
      if (publish) {
        router.push('/admin/articles')
      }
    } catch (err: any) {
      console.error('Error saving article:', err)
      alert(err.message || 'Failed to save article')
    } finally {
      setSaving(false)
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
      const filePath = `articles/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file)

      if (uploadError) {
        console.log('Storage bucket not found. Using placeholder.')
        setCoverImage('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop')
        setUploading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath)

      setCoverImage(publicUrl)
    } catch (err: any) {
      console.error('Upload error:', err)
      setCoverImage('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop')
    } finally {
      setUploading(false)
    }
  }

  if (loadingArticle) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F5F2ED]">
        <Loader2 className="w-8 h-8 animate-spin text-[#9B9590]" />
      </div>
    )
  }

  if (!article) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      {/* Sticky top bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-[rgba(0,0,0,0.08)] px-0 py-4 flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <Link href="/admin/articles" className="text-[#9B9590] hover:text-[#2A2522] transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-sans text-[11px] tracking-[2px] uppercase text-[#2A2522]">Edit Article</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => handleSave(false)}
            disabled={saving}
            className="font-sans text-[11px] tracking-[2px] uppercase text-[#9B9590] hover:text-[#2A2522] transition-colors disabled:opacity-50"
          >
            {saved ? <span className="flex items-center gap-2"><Check className="w-4 h-4" /> Saved</span> : 'Save'}
          </button>
          <button 
            onClick={() => handleSave(true)}
            disabled={saving}
            className="bg-[#393931] text-white px-6 py-2 font-sans font-bold text-[11px] tracking-[4px] uppercase hover:bg-[#2A2522] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {formData.status === 'published' ? 'Update' : 'Publish'}
          </button>
        </div>
      </header>

      {/* Two panel main */}
      <div className="flex min-h-screen">
        {/* Left - Editor */}
        <div className="flex-1 overflow-y-auto px-10 py-10">
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Article title..."
            className="w-full font-serif text-4xl text-[#2A2522] bg-transparent outline-none placeholder:text-[#B7AEA9] mb-2"
          />
          <p className="font-sans text-[11px] text-[#9B9590] mb-8">
            anoce.mn/editorial/{slug || 'your-slug'}
          </p>
          <div className="w-full h-px bg-[rgba(0,0,0,0.08)] mb-8" />
          
          <input
            type="text"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            placeholder="Subtitle..."
            className="w-full font-serif text-xl text-[#7A7470] bg-transparent outline-none placeholder:text-[#B7AEA9] mb-6"
          />

          <textarea
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            placeholder="Start writing your story..."
            className="w-full min-h-[500px] font-inter text-[16px] leading-[1.8] text-[#3A3530] bg-transparent outline-none resize-none placeholder:text-[#B7AEA9]"
          />
        </div>

        {/* Right - Sidebar */}
        <div className="w-72 bg-white border-l border-[rgba(0,0,0,0.08)] sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto px-6 py-8">
          {/* Publish section */}
          <div className="mb-8">
            <h3 className="font-sans text-[10px] tracking-[2px] uppercase text-[#9B9590] mb-4">Status</h3>
            <div className="space-y-3">
              <select 
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full border border-[rgba(0,0,0,0.15)] px-3 py-2 font-sans text-[12px] bg-transparent outline-none"
              >
                <option value="draft">Draft</option>
                <option value="review">Review</option>
                <option value="published">Published</option>
              </select>
              <button 
                onClick={() => handleSave(true)}
                disabled={saving}
                className="w-full bg-[#393931] text-white py-3 font-sans font-bold text-[11px] tracking-[4px] uppercase disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : formData.status === 'published' ? 'Update' : 'Publish'}
              </button>
              {formData.status === 'published' && (
                <Link 
                  href={`/editorial/${article.slug}`}
                  target="_blank"
                  className="w-full border border-[rgba(0,0,0,0.15)] py-3 font-sans text-[11px] tracking-[2px] uppercase text-center block hover:bg-[#F5F2ED]"
                >
                  View Live →
                </Link>
              )}
            </div>
          </div>

          {/* Taxonomy */}
          <div className="mb-8">
            <h3 className="font-sans text-[10px] tracking-[2px] uppercase text-[#9B9590] mb-4">Taxonomy</h3>
            <div className="space-y-3">
              <select 
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border border-[rgba(0,0,0,0.15)] px-3 py-2 font-sans text-[12px] bg-transparent outline-none"
              >
                <option value="features">Features</option>
                <option value="interviews">Interviews</option>
                <option value="news">News</option>
                <option value="trends">Trends</option>
              </select>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Tags (comma separated)"
                className="w-full border border-[rgba(0,0,0,0.15)] px-3 py-2 font-sans text-[12px] bg-transparent outline-none placeholder:text-[#B7AEA9]"
              />
              <select 
                value={formData.designer_slug}
                onChange={(e) => setFormData({ ...formData, designer_slug: e.target.value })}
                className="w-full border border-[rgba(0,0,0,0.15)] px-3 py-2 font-sans text-[12px] bg-transparent outline-none"
              >
                <option value="">Select Designer (optional)</option>
                <option value="gobi">Gobi</option>
                <option value="goyol">Goyol</option>
                <option value="michel-amazonka">Michel&Amazonka</option>
              </select>
              <input
                type="number"
                value={formData.read_time}
                onChange={(e) => setFormData({ ...formData, read_time: parseInt(e.target.value) || 5 })}
                placeholder="Read time (min)"
                min={1}
                className="w-full border border-[rgba(0,0,0,0.15)] px-3 py-2 font-sans text-[12px] bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Cover Image */}
          <div className="mb-8">
            <h3 className="font-sans text-[10px] tracking-[2px] uppercase text-[#9B9590] mb-4">Cover Image</h3>
            {coverImage ? (
              <div className="relative aspect-video bg-gray-100">
                <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                <button 
                  onClick={() => setCoverImage(null)}
                  className="absolute top-2 right-2 bg-white px-2 py-1 text-xs"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-[rgba(0,0,0,0.15)] p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#2A2522] transition-colors">
                {uploading ? (
                  <Loader2 className="w-6 h-6 text-[#9B9590] animate-spin" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-[#9B9590] mb-2" />
                    <span className="font-sans text-[11px] text-[#9B9590]">Click to upload</span>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*,video/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* SEO Preview */}
          <div>
            <h3 className="font-sans text-[10px] tracking-[2px] uppercase text-[#9B9590] mb-4">SEO Preview</h3>
            <div className="bg-[#F5F2ED] p-4">
              <p className="font-sans text-[11px] text-[#9B9590] mb-1">anoce.mn/editorial/...</p>
              <p className="font-sans text-[14px] text-[#1a0dab] leading-tight mb-1">{formData.title || 'Article Title'}</p>
              <p className="font-sans text-[11px] text-[#545454] line-clamp-2">
                {formData.subtitle || 'Preview of your article meta description will appear here...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}