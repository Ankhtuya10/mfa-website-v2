'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { ChevronLeft, Upload, Loader2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function EditArticlePage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

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

    if (params.id) loadArticle()
  }, [params.id])

  const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  async function handleSave(publish = false) {
    if (!formData.title.trim()) {
      alert('Please enter a title')
      return
    }
    setSaving(true)
    try {
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
      if (publish) updateData.published_at = new Date().toISOString()

      const { error } = await supabase
        .from('articles')
        .update(updateData)
        .eq('id', params.id)
        .select()
        .single()

      if (error) throw new Error(error.message)

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      if (publish) router.push('/admin/articles')
    } catch (err: any) {
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

      const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file)

      if (uploadError) {
        setCoverImage('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop')
        return
      }
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath)
      setCoverImage(publicUrl)
    } catch {
      setCoverImage('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop')
    } finally {
      setUploading(false)
    }
  }

  if (loadingArticle) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-[#C0BCB5]" />
      </div>
    )
  }

  if (!article) return null

  const isPublished = formData.status === 'published'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full -mx-10 -mt-8"
    >
      {/* Sticky top bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#E8E4DD] px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <Link
            href="/admin/articles"
            className="p-1.5 rounded-md text-[#B0ACA4] hover:text-[#1A1A18] hover:bg-[#F0EDE8] transition-all"
          >
            <ChevronLeft className="w-4.5 h-4.5" strokeWidth={1.8} />
          </Link>
          <div className="w-px h-4 bg-[#E8E4DD]" />
          <span className="font-sans text-[10.5px] tracking-[0.1em] uppercase text-[#9E9B94]">Edit Article</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex items-center gap-1.5 font-sans text-[10.5px] tracking-[0.09em] uppercase text-[#9E9B94] hover:text-[#1A1A18] transition-colors disabled:opacity-40 px-3 py-2 rounded-lg hover:bg-[#F0EDE8]"
          >
            {saved
              ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> <span className="text-emerald-600">Saved</span></>
              : 'Save draft'}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="flex items-center gap-2 bg-[#0E0E0D] text-white font-sans text-[10.5px] tracking-[0.1em] uppercase font-medium px-5 py-2.5 rounded-lg hover:bg-[#2a2a28] transition-colors disabled:opacity-50"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isPublished ? 'Update' : 'Publish'}
          </button>
        </div>
      </header>

      {/* Two-panel layout */}
      <div className="flex min-h-screen bg-[#F6F3EE]">

        {/* Editor */}
        <div className="flex-1 overflow-y-auto px-12 py-10 max-w-3xl">
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Article title…"
            className="w-full font-serif text-[38px] text-[#1A1A18] bg-transparent outline-none placeholder:text-[#C8C4BC] leading-tight mb-2"
          />
          <p className="font-sans text-[10.5px] text-[#B0ACA4] mb-7 tracking-[0.04em]">
            anoce.mn/editorial/{slug || 'your-slug'}
          </p>

          <div className="w-full h-px bg-[#E8E4DD] mb-7" />

          <input
            type="text"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            placeholder="Subtitle…"
            className="w-full font-serif text-[20px] italic text-[#7A776F] bg-transparent outline-none placeholder:text-[#C8C4BC] mb-7 leading-snug"
          />

          <textarea
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            placeholder="Start writing your story…"
            className="w-full min-h-[520px] font-sans text-[15px] leading-[1.85] text-[#3A3530] bg-transparent outline-none resize-none placeholder:text-[#C8C4BC]"
          />
        </div>

        {/* Sidebar */}
        <div className="w-[268px] shrink-0 bg-white border-l border-[#E8E4DD] sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto">
          <div className="px-6 py-6 space-y-7">

            {/* Status */}
            <section>
              <label className="block font-sans text-[9.5px] tracking-[0.14em] uppercase text-[#B0ACA4] mb-3 font-medium">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full border border-[#E8E4DD] rounded-lg px-3 py-2.5 font-sans text-[12px] text-[#1A1A18] bg-white outline-none focus:border-[#0E0E0D] transition-colors appearance-none"
              >
                <option value="draft">Draft</option>
                <option value="review">In Review</option>
                <option value="published">Published</option>
              </select>
              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="w-full mt-3 bg-[#0E0E0D] text-white py-2.5 rounded-lg font-sans text-[10.5px] tracking-[0.1em] uppercase font-medium hover:bg-[#2a2a28] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isPublished ? 'Update' : 'Publish'}
              </button>
              {isPublished && (
                <Link
                  href={`/editorial/${article.slug}`}
                  target="_blank"
                  className="w-full mt-2 border border-[#E8E4DD] rounded-lg py-2.5 font-sans text-[10.5px] tracking-[0.08em] uppercase text-[#6B6860] text-center block hover:bg-[#F5F2ED] transition-colors"
                >
                  View live →
                </Link>
              )}
            </section>

            <div className="border-t border-[#F0EDE8]" />

            {/* Taxonomy */}
            <section>
              <label className="block font-sans text-[9.5px] tracking-[0.14em] uppercase text-[#B0ACA4] mb-3 font-medium">Taxonomy</label>
              <div className="space-y-2.5">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-[#E8E4DD] rounded-lg px-3 py-2.5 font-sans text-[12px] text-[#1A1A18] bg-white outline-none focus:border-[#0E0E0D] transition-colors appearance-none"
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
                  className="w-full border border-[#E8E4DD] rounded-lg px-3 py-2.5 font-sans text-[12px] text-[#1A1A18] bg-white outline-none focus:border-[#0E0E0D] transition-colors placeholder:text-[#C8C4BC]"
                />
                <select
                  value={formData.designer_slug}
                  onChange={(e) => setFormData({ ...formData, designer_slug: e.target.value })}
                  className="w-full border border-[#E8E4DD] rounded-lg px-3 py-2.5 font-sans text-[12px] text-[#1A1A18] bg-white outline-none focus:border-[#0E0E0D] transition-colors appearance-none"
                >
                  <option value="">Designer (optional)</option>
                  <option value="gobi">Gobi</option>
                  <option value="goyol">Goyol</option>
                  <option value="michel-amazonka">Michel & Amazonka</option>
                </select>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.read_time}
                    onChange={(e) => setFormData({ ...formData, read_time: parseInt(e.target.value) || 5 })}
                    min={1}
                    className="w-full border border-[#E8E4DD] rounded-lg px-3 py-2.5 font-sans text-[12px] text-[#1A1A18] bg-white outline-none focus:border-[#0E0E0D] transition-colors pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-sans text-[11px] text-[#C0BCB5]">min</span>
                </div>
              </div>
            </section>

            <div className="border-t border-[#F0EDE8]" />

            {/* Cover image */}
            <section>
              <label className="block font-sans text-[9.5px] tracking-[0.14em] uppercase text-[#B0ACA4] mb-3 font-medium">Cover Image</label>
              {coverImage ? (
                <div className="relative rounded-lg overflow-hidden aspect-video bg-[#F0EDE8]">
                  <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setCoverImage(null)}
                    className="absolute top-2 right-2 bg-black/60 text-white font-sans text-[9.5px] tracking-[0.08em] uppercase px-2.5 py-1 rounded-md hover:bg-black/80 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#E8E4DD] rounded-lg py-8 cursor-pointer hover:border-[#C8C4BC] hover:bg-[#FAF8F5] transition-all">
                  {uploading ? (
                    <Loader2 className="w-5 h-5 text-[#C0BCB5] animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-[#C0BCB5]" strokeWidth={1.6} />
                      <span className="font-sans text-[11px] text-[#B0ACA4]">Click to upload</span>
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
            </section>

            <div className="border-t border-[#F0EDE8]" />

            {/* SEO preview */}
            <section>
              <label className="block font-sans text-[9.5px] tracking-[0.14em] uppercase text-[#B0ACA4] mb-3 font-medium">SEO Preview</label>
              <div className="bg-[#F5F2ED] rounded-lg p-4">
                <p className="font-sans text-[10px] text-[#B0ACA4] mb-1 truncate">anoce.mn/editorial/{slug || '…'}</p>
                <p className="font-sans text-[13px] text-blue-700 leading-snug mb-1 line-clamp-1">
                  {formData.title || 'Article Title'}
                </p>
                <p className="font-sans text-[11px] text-[#5A5A5A] line-clamp-2 leading-relaxed">
                  {formData.subtitle || 'Your article subtitle will appear here as the meta description…'}
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
