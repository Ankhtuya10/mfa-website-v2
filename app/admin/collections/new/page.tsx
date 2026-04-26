'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Upload, Loader2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function NewCollectionPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    designer_name: '',
    designer_slug: '',
    season: 'SS',
    year: new Date().getFullYear(),
    description: ''
  })

  const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  async function handleSave(publish = false) {
    if (!formData.title.trim() || !formData.designer_name.trim()) {
      alert('Please fill in required fields (title and designer)')
      return
    }

    setLoading(true)
    try {
      const collectionData = {
        slug: slug || `collection-${Date.now()}`,
        title: formData.title,
        designer_name: formData.designer_name,
        designer_slug: formData.designer_slug || formData.designer_name.toLowerCase().replace(/\s+/g, '-'),
        season: formData.season,
        year: formData.year,
        description: formData.description,
        cover_image: coverImage
      }

      const { data, error } = await supabase
        .from('collections')
        .insert(collectionData)
        .select()
        .single()

      if (error) throw error

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      
      router.push('/admin/collections')
    } catch (err: any) {
      console.error('Error saving collection:', err)
      alert(err.message || 'Failed to save collection')
    } finally {
      setLoading(false)
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
      const filePath = `collections/${fileName}`
      const uploadBuckets = ['media', 'covers']

      let publicUrl: string | null = null
      let lastErrorMessage = 'Unknown upload error'

      for (const bucket of uploadBuckets) {
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file)

        if (!uploadError) {
          publicUrl = supabase.storage.from(bucket).getPublicUrl(filePath).data.publicUrl
          break
        }

        lastErrorMessage = uploadError.message
      }

      if (!publicUrl) {
        alert(`Image upload failed: ${lastErrorMessage}`)
        return
      }

      setCoverImage(publicUrl)
    } catch (err: any) {
      console.error('Upload error:', err)
      alert('Image upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
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
          <Link href="/admin/collections" className="text-[#9B9590] hover:text-[#2A2522] transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-sans text-[11px] tracking-[2px] uppercase text-[#2A2522]">New Collection</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => handleSave(false)}
            disabled={loading}
            className="font-sans text-[11px] tracking-[2px] uppercase text-[#9B9590] hover:text-[#2A2522] transition-colors disabled:opacity-50"
          >
            {saved ? <span className="flex items-center gap-2"><Check className="w-4 h-4" /> Saved</span> : 'Save Draft'}
          </button>
          <button 
            onClick={() => handleSave(true)}
            disabled={loading}
            className="bg-[#393931] text-white px-6 py-2 font-sans font-bold text-[11px] tracking-[4px] uppercase hover:bg-[#2A2522] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Create
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
            placeholder="Collection title..."
            className="w-full font-serif text-4xl text-[#2A2522] bg-transparent outline-none placeholder:text-[#B7AEA9] mb-2"
          />
          <p className="font-sans text-[11px] text-[#9B9590] mb-8">
            anoce.mn/archive/{slug || 'your-slug'}
          </p>
          <div className="w-full h-px bg-[rgba(0,0,0,0.08)] mb-8" />
          
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Collection description..."
            className="w-full min-h-[200px] font-inter text-[16px] leading-[1.8] text-[#3A3530] bg-transparent outline-none resize-none placeholder:text-[#B7AEA9]"
          />
        </div>

        {/* Right - Sidebar */}
        <div className="w-72 bg-white border-l border-[rgba(0,0,0,0.08)] sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto px-6 py-8">
          {/* Details */}
          <div className="mb-8">
            <h3 className="font-sans text-[10px] tracking-[2px] uppercase text-[#9B9590] mb-4">Details</h3>
            <div className="space-y-3">
              <div>
                <label className="font-sans text-[10px] text-[#9B9590] block mb-1">Designer Name *</label>
                <input
                  type="text"
                  value={formData.designer_name}
                  onChange={(e) => setFormData({ ...formData, designer_name: e.target.value })}
                  placeholder="e.g. Gobi Cashmere"
                  className="w-full border border-[rgba(0,0,0,0.15)] px-3 py-2 font-sans text-[12px] bg-transparent outline-none"
                />
              </div>
              <div>
                <label className="font-sans text-[10px] text-[#9B9590] block mb-1">Designer Slug</label>
                <input
                  type="text"
                  value={formData.designer_slug}
                  onChange={(e) => setFormData({ ...formData, designer_slug: e.target.value })}
                  placeholder="auto-generated from name"
                  className="w-full border border-[rgba(0,0,0,0.15)] px-3 py-2 font-sans text-[12px] bg-transparent outline-none"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="font-sans text-[10px] text-[#9B9590] block mb-1">Season</label>
                  <select 
                    value={formData.season}
                    onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                    className="w-full border border-[rgba(0,0,0,0.15)] px-3 py-2 font-sans text-[12px] bg-transparent outline-none"
                  >
                    <option value="SS">SS (Spring/Summer)</option>
                    <option value="FW">FW (Fall/Winter)</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="font-sans text-[10px] text-[#9B9590] block mb-1">Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                    className="w-full border border-[rgba(0,0,0,0.15)] px-3 py-2 font-sans text-[12px] bg-transparent outline-none"
                  />
                </div>
              </div>
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
                  className="absolute top-2 right-2 bg-white p-1 text-xs"
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
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Actions */}
          <div>
            <button 
              onClick={() => handleSave(false)}
              disabled={loading}
              className="w-full border border-[rgba(0,0,0,0.15)] text-[#2A2522] py-3 font-sans font-bold text-[11px] tracking-[4px] uppercase mb-2 disabled:opacity-50"
            >
              Save Draft
            </button>
            <button 
              onClick={() => handleSave(true)}
              disabled={loading}
              className="w-full bg-[#393931] text-white py-3 font-sans font-bold text-[11px] tracking-[4px] uppercase disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Create Collection'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
