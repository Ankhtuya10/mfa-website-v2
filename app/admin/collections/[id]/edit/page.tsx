'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Check, ChevronLeft, Loader2, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function EditCollectionPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  const [loadingCollection, setLoadingCollection] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const localPreviewRef = useRef<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    designer_name: '',
    designer_slug: '',
    season: 'SS',
    year: new Date().getFullYear(),
    description: '',
    slug: '',
  })

  useEffect(() => {
    async function loadCollection() {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error || !data) {
        alert('Collection not found')
        router.push('/admin/collections')
        return
      }

      setFormData({
        title: data.title || '',
        designer_name: data.designer_name || '',
        designer_slug: data.designer_slug || '',
        season: data.season || 'SS',
        year: data.year || new Date().getFullYear(),
        description: data.description || '',
        slug: data.slug || '',
      })
      setCoverImage(data.cover_image || null)
      setCoverPreview(data.cover_image ? `${data.cover_image}?v=${Date.now()}` : null)
      setLoadingCollection(false)
    }

    if (params.id) loadCollection()
  }, [params.id, router, supabase])

  useEffect(() => {
    return () => {
      if (localPreviewRef.current) {
        URL.revokeObjectURL(localPreviewRef.current)
      }
    }
  }, [])

  const generatedSlug = formData.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  const finalSlug = formData.slug || generatedSlug || `collection-${Date.now()}`
  const coverImageSrc = coverPreview || coverImage

  async function handleSave() {
    if (!formData.title.trim() || !formData.designer_name.trim()) {
      alert('Please fill in required fields (title and designer)')
      return
    }

    setSaving(true)
    try {
      const updateData = {
        title: formData.title,
        slug: finalSlug,
        designer_name: formData.designer_name,
        designer_slug:
          formData.designer_slug ||
          formData.designer_name.toLowerCase().replace(/\s+/g, '-'),
        season: formData.season,
        year: formData.year,
        description: formData.description,
        cover_image: coverImage,
      }

      const { error } = await supabase
        .from('collections')
        .update(updateData)
        .eq('id', params.id)
        .select()
        .single()

      if (error) throw error

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err: any) {
      alert(err?.message || 'Failed to update collection')
    } finally {
      setSaving(false)
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const localPreviewUrl = URL.createObjectURL(file)
    if (localPreviewRef.current) {
      URL.revokeObjectURL(localPreviewRef.current)
    }
    localPreviewRef.current = localPreviewUrl
    setCoverPreview(localPreviewUrl)

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}.${fileExt}`
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
        setCoverPreview(coverImage ? `${coverImage}?v=${Date.now()}` : null)
        return
      }

      setCoverImage(publicUrl)
      setCoverPreview(`${publicUrl}?v=${Date.now()}`)

      if (localPreviewRef.current) {
        URL.revokeObjectURL(localPreviewRef.current)
        localPreviewRef.current = null
      }
    } catch (err) {
      console.error('Upload error:', err)
      alert('Image upload failed. Please try again.')
      setCoverPreview(coverImage ? `${coverImage}?v=${Date.now()}` : null)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  if (loadingCollection) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#C0BCB5]" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <header className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-[rgba(0,0,0,0.08)] bg-white px-0 py-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/collections" className="text-[#9B9590] transition-colors hover:text-[#2A2522]">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-sans text-[11px] uppercase tracking-[2px] text-[#2A2522]">Edit Collection</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="font-sans text-[11px] uppercase tracking-[2px] text-[#9B9590] transition-colors hover:text-[#2A2522] disabled:opacity-50"
          >
            {saved ? (
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Saved
              </span>
            ) : (
              'Save Changes'
            )}
          </button>
          <button
            onClick={() => router.push('/admin/collections')}
            className="bg-[#393931] px-6 py-2 font-sans text-[11px] font-bold uppercase tracking-[4px] text-white transition-colors hover:bg-[#2A2522]"
          >
            Back to List
          </button>
        </div>
      </header>

      <div className="flex min-h-screen">
        <div className="flex-1 overflow-y-auto px-10 py-10">
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Collection title..."
            className="mb-2 w-full bg-transparent font-serif text-4xl text-[#2A2522] outline-none placeholder:text-[#B7AEA9]"
          />
          <p className="mb-8 font-sans text-[11px] text-[#9B9590]">
            anoce.mn/archive/{finalSlug || 'your-slug'}
          </p>
          <div className="mb-8 h-px w-full bg-[rgba(0,0,0,0.08)]" />

          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Collection description..."
            className="min-h-[200px] w-full resize-none bg-transparent font-inter text-[16px] leading-[1.8] text-[#3A3530] outline-none placeholder:text-[#B7AEA9]"
          />
        </div>

        <div className="sticky top-[73px] h-[calc(100vh-73px)] w-72 overflow-y-auto border-l border-[rgba(0,0,0,0.08)] bg-white px-6 py-8">
          <div className="mb-8">
            <h3 className="mb-4 font-sans text-[10px] uppercase tracking-[2px] text-[#9B9590]">Details</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block font-sans text-[10px] text-[#9B9590]">Designer Name *</label>
                <input
                  type="text"
                  value={formData.designer_name}
                  onChange={(e) => setFormData({ ...formData, designer_name: e.target.value })}
                  className="w-full border border-[rgba(0,0,0,0.15)] bg-transparent px-3 py-2 font-sans text-[12px] outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block font-sans text-[10px] text-[#9B9590]">Designer Slug</label>
                <input
                  type="text"
                  value={formData.designer_slug}
                  onChange={(e) => setFormData({ ...formData, designer_slug: e.target.value })}
                  placeholder="auto-generated from name"
                  className="w-full border border-[rgba(0,0,0,0.15)] bg-transparent px-3 py-2 font-sans text-[12px] outline-none"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="mb-1 block font-sans text-[10px] text-[#9B9590]">Season</label>
                  <select
                    value={formData.season}
                    onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                    className="w-full border border-[rgba(0,0,0,0.15)] bg-transparent px-3 py-2 font-sans text-[12px] outline-none"
                  >
                    <option value="SS">SS (Spring/Summer)</option>
                    <option value="FW">FW (Fall/Winter)</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="mb-1 block font-sans text-[10px] text-[#9B9590]">Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        year: parseInt(e.target.value, 10) || new Date().getFullYear(),
                      })
                    }
                    className="w-full border border-[rgba(0,0,0,0.15)] bg-transparent px-3 py-2 font-sans text-[12px] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="mb-4 font-sans text-[10px] uppercase tracking-[2px] text-[#9B9590]">Cover Image</h3>
            {coverImageSrc ? (
              <div className="relative aspect-video bg-gray-100">
                <img src={coverImageSrc} alt="Cover" className="h-full w-full object-cover" />
                <button
                  onClick={() => {
                    setCoverImage(null)
                    setCoverPreview(null)
                    if (localPreviewRef.current) {
                      URL.revokeObjectURL(localPreviewRef.current)
                      localPreviewRef.current = null
                    }
                  }}
                  className="absolute right-2 top-2 bg-white p-1 text-xs"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-[rgba(0,0,0,0.15)] p-8 text-center transition-colors hover:border-[#2A2522]">
                {uploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-[#9B9590]" />
                ) : (
                  <>
                    <Upload className="mb-2 h-6 w-6 text-[#9B9590]" />
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

          <div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="mb-2 w-full border border-[rgba(0,0,0,0.15)] py-3 font-sans text-[11px] font-bold uppercase tracking-[4px] text-[#2A2522] disabled:opacity-50"
            >
              {saving ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : 'Save Changes'}
            </button>
            <button
              onClick={() => router.push('/admin/collections')}
              className="w-full bg-[#393931] py-3 font-sans text-[11px] font-bold uppercase tracking-[4px] text-white"
            >
              Back to Collections
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
