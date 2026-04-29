'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, Check, Loader2, Upload, AlertCircle } from 'lucide-react'
import { fetchJson, postJson, uploadContentAsset } from '@/lib/content/client'

type Tier = 'high-end' | 'contemporary' | 'emerging'

const TIERS: { value: Tier; label: string }[] = [
  { value: 'high-end', label: 'High-End' },
  { value: 'contemporary', label: 'Contemporary' },
  { value: 'emerging', label: 'Emerging' },
]

export default function EditDesignerPage() {
  const router = useRouter()
  const params = useParams()
  const profilePreviewRef = useRef<string | null>(null)
  const coverPreviewRef = useRef<string | null>(null)

  const [loadingDesigner, setLoadingDesigner] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [profileUploading, setProfileUploading] = useState(false)
  const [coverUploading, setCoverUploading] = useState(false)
  const [profilePreview, setProfilePreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saveError, setSaveError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    tier: '' as Tier | '',
    bio: '',
    short_bio: '',
    founded: '' as number | '',
    profile_image: '',
    cover_image: '',
  })

  // Load existing designer
  useEffect(() => {
    async function loadDesigner() {
      const data = await fetchJson<any>(
        `/api/admin/content/designers/${encodeURIComponent(String(params.id))}`
      ).catch(() => null)

      if (!data) {
        setNotFound(true)
        setLoadingDesigner(false)
        return
      }

      setFormData({
        name: data.name || '',
        slug: data.slug || '',
        tier: data.tier || '',
        bio: data.bio || '',
        short_bio: data.short_bio || '',
        founded: data.founded ?? '',
        profile_image: data.profile_image || '',
        cover_image: data.cover_image || '',
      })
      setProfilePreview(
        data.profile_image ? `${data.profile_image}?v=${Date.now()}` : null,
      )
      setCoverPreview(
        data.cover_image ? `${data.cover_image}?v=${Date.now()}` : null,
      )
      setLoadingDesigner(false)
    }

    if (params.id) loadDesigner()
  }, [params.id])

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (profilePreviewRef.current) URL.revokeObjectURL(profilePreviewRef.current)
      if (coverPreviewRef.current) URL.revokeObjectURL(coverPreviewRef.current)
    }
  }, [])

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (!formData.name.trim()) next.name = 'Name is required'
    if (!formData.slug.trim()) next.slug = 'Slug is required'
    if (!formData.tier) next.tier = 'Tier is required'
    if (!formData.short_bio.trim()) next.short_bio = 'Short bio is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSave() {
    setSaveError('')
    if (!validate()) return

    setLoading(true)
    try {
      const updateData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        tier: formData.tier as Tier,
        bio: formData.bio.trim() || null,
        short_bio: formData.short_bio.trim(),
        founded: formData.founded !== '' ? Number(formData.founded) : null,
        profile_image: formData.profile_image || null,
        cover_image: formData.cover_image || null,
      }

      await postJson(
        `/api/admin/content/designers/${encodeURIComponent(String(params.id))}`,
        updateData,
        'PUT'
      )

      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to update designer. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleProfileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const previewUrl = URL.createObjectURL(file)
    if (profilePreviewRef.current) URL.revokeObjectURL(profilePreviewRef.current)
    profilePreviewRef.current = previewUrl
    setProfilePreview(previewUrl)

    setProfileUploading(true)
    setErrors((prev) => ({ ...prev, profile_image: '' }))

    try {
      const asset = await uploadContentAsset(file, 'designers')
      setFormData((prev) => ({ ...prev, profile_image: asset.url }))
      setProfilePreview(`${asset.url}?v=${Date.now()}`)
      if (profilePreviewRef.current) {
        URL.revokeObjectURL(profilePreviewRef.current)
        profilePreviewRef.current = null
      }
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        profile_image: `Upload failed: ${err.message || 'Unknown error'}`,
      }))
      const existing = formData.profile_image
      setProfilePreview(existing ? `${existing}?v=${Date.now()}` : null)
    } finally {
      setProfileUploading(false)
      e.target.value = ''
    }
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const previewUrl = URL.createObjectURL(file)
    if (coverPreviewRef.current) URL.revokeObjectURL(coverPreviewRef.current)
    coverPreviewRef.current = previewUrl
    setCoverPreview(previewUrl)

    setCoverUploading(true)
    setErrors((prev) => ({ ...prev, cover_image: '' }))

    try {
      const asset = await uploadContentAsset(file, 'designers')
      setFormData((prev) => ({ ...prev, cover_image: asset.url }))
      setCoverPreview(`${asset.url}?v=${Date.now()}`)
      if (coverPreviewRef.current) {
        URL.revokeObjectURL(coverPreviewRef.current)
        coverPreviewRef.current = null
      }
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        cover_image: `Upload failed: ${err.message || 'Unknown error'}`,
      }))
      const existing = formData.cover_image
      setCoverPreview(existing ? `${existing}?v=${Date.now()}` : null)
    } finally {
      setCoverUploading(false)
      e.target.value = ''
    }
  }

  const profileSrc = profilePreview || formData.profile_image || null
  const coverSrc = coverPreview || formData.cover_image || null
  const isUploading = profileUploading || coverUploading

  // ── Loading state ──
  if (loadingDesigner) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#C0BCB5]" />
      </div>
    )
  }

  // ── Not found ──
  if (notFound) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="font-sans text-[13px] text-[#9B9590]">Designer not found.</p>
        <Link
          href="/admin/designers"
          className="font-sans text-[11px] uppercase tracking-[2px] text-[#2A2522] underline"
        >
          Back to Designers
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-[rgba(0,0,0,0.08)] bg-white px-0 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/designers"
            className="text-[#9B9590] transition-colors hover:text-[#2A2522]"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-sans text-[11px] uppercase tracking-[2px] text-[#2A2522]">
            Edit Designer
          </h1>
        </div>
        <button
          onClick={handleSave}
          disabled={loading || isUploading}
          className="flex items-center gap-2 bg-[#0E0E0D] px-6 py-2 font-sans text-[11px] font-bold uppercase tracking-[4px] text-white transition-colors hover:bg-[#2A2522] disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <>
              <Check className="h-4 w-4" /> Saved
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </header>

      {/* ── Two-panel layout ── */}
      <div className="flex min-h-[calc(100vh-73px)]">
        {/* Left panel */}
        <div className="flex-1 overflow-y-auto bg-[#F9F7F4] px-12 py-10">
          {/* Save error banner */}
          {saveError && (
            <div className="mb-6 flex items-start gap-3 rounded border border-red-200 bg-red-50 px-4 py-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <p className="font-sans text-[12px] text-red-700">{saveError}</p>
            </div>
          )}

          {/* Name */}
          <div className="mb-2">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, name: e.target.value }))
                if (e.target.value.trim()) setErrors((prev) => ({ ...prev, name: '' }))
              }}
              placeholder="Designer name..."
              className={`w-full bg-transparent font-serif text-4xl text-[#2A2522] outline-none placeholder:text-[#B7AEA9] ${
                errors.name ? 'border-b-2 border-red-400' : ''
              }`}
            />
            {errors.name && (
              <p className="mt-1.5 flex items-center gap-1 font-sans text-[11px] text-red-500">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Slug — editable in edit mode */}
          <div className="mb-8">
            <div className="flex items-center gap-1.5">
              <span className="font-sans text-[11px] text-[#9B9590]">anoce.mn/designers/</span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                  if (e.target.value.trim()) setErrors((prev) => ({ ...prev, slug: '' }))
                }}
                className={`min-w-0 flex-1 bg-transparent font-sans text-[11px] text-[#2A2522] outline-none border-b ${
                  errors.slug ? 'border-red-400' : 'border-[rgba(0,0,0,0.15)]'
                }`}
              />
            </div>
            {errors.slug && (
              <p className="mt-1 flex items-center gap-1 font-sans text-[11px] text-red-500">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {errors.slug}
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="mb-8 h-px w-full bg-[rgba(0,0,0,0.08)]" />

          {/* Short Bio */}
          <div className="mb-6">
            <label className="mb-2 block font-sans text-[10px] uppercase tracking-[1px] text-[#9B9590]">
              Short Bio *
            </label>
            <textarea
              value={formData.short_bio}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, short_bio: e.target.value }))
                if (e.target.value.trim())
                  setErrors((prev) => ({ ...prev, short_bio: '' }))
              }}
              placeholder="A brief, punchy introduction for listings and cards..."
              className={`w-full min-h-[120px] resize-none bg-transparent font-sans text-[15px] leading-[1.8] text-[#3A3530] outline-none placeholder:text-[#B7AEA9] ${
                errors.short_bio ? 'border-b-2 border-red-400 pb-1' : ''
              }`}
            />
            {errors.short_bio && (
              <p className="mt-1 flex items-center gap-1 font-sans text-[11px] text-red-500">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {errors.short_bio}
              </p>
            )}
          </div>

          {/* Full Bio */}
          <div>
            <label className="mb-2 block font-sans text-[10px] uppercase tracking-[1px] text-[#9B9590]">
              Full Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
              placeholder="Full designer biography, history, and context..."
              className="w-full min-h-[300px] resize-none bg-transparent font-sans text-[15px] leading-[1.8] text-[#3A3530] outline-none placeholder:text-[#B7AEA9]"
            />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="sticky top-[73px] flex h-[calc(100vh-73px)] w-[268px] shrink-0 flex-col gap-6 overflow-y-auto border-l border-[#E8E4DD] bg-white px-6 py-6">
          {/* ── Tier ── */}
          <div>
            <h3 className="mb-4 font-sans text-[10px] uppercase tracking-[2px] text-[#9B9590]">
              Tier *
            </h3>
            <div className="space-y-2">
              {TIERS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, tier: t.value }))
                    setErrors((prev) => ({ ...prev, tier: '' }))
                  }}
                  className={`w-full border px-3 py-2.5 text-left font-sans text-[11px] uppercase tracking-[1.5px] transition-colors ${
                    formData.tier === t.value
                      ? 'border-[#0E0E0D] bg-[#0E0E0D] text-white'
                      : 'border-[rgba(0,0,0,0.15)] bg-transparent text-[#2A2522] hover:border-[#2A2522]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {errors.tier && (
              <p className="mt-2 flex items-center gap-1 font-sans text-[10px] text-red-500">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {errors.tier}
              </p>
            )}
          </div>

          {/* ── Founded ── */}
          <div>
            <h3 className="mb-4 font-sans text-[10px] uppercase tracking-[2px] text-[#9B9590]">
              Founded
            </h3>
            <input
              type="number"
              value={formData.founded}
              min={1900}
              max={2030}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  founded: e.target.value ? parseInt(e.target.value, 10) : '',
                }))
              }
              placeholder="e.g. 1995"
              className="w-full border border-[rgba(0,0,0,0.15)] bg-transparent px-3 py-2 font-sans text-[12px] outline-none placeholder:text-[#B7AEA9]"
            />
          </div>

          {/* ── Profile Image ── */}
          <div>
            <h3 className="mb-4 font-sans text-[10px] uppercase tracking-[2px] text-[#9B9590]">
              Profile Image
            </h3>
            {profileSrc ? (
              <div className="relative aspect-square overflow-hidden rounded-full bg-[#F0EDE8]">
                <img
                  src={profileSrc}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
                {profileUploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30">
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  </div>
                )}
                {!profileUploading && (
                  <button
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, profile_image: '' }))
                      setProfilePreview(null)
                      if (profilePreviewRef.current) {
                        URL.revokeObjectURL(profilePreviewRef.current)
                        profilePreviewRef.current = null
                      }
                    }}
                    className="absolute right-2 top-2 rounded bg-white/90 px-2 py-1 font-sans text-[10px] text-[#2A2522] transition-colors hover:bg-white"
                  >
                    Remove
                  </button>
                )}
              </div>
            ) : (
              <div>
                <label className="flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-[rgba(0,0,0,0.15)] p-6 text-center transition-colors hover:border-[#2A2522]">
                  {profileUploading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-[#9B9590]" />
                  ) : (
                    <>
                      <Upload className="mb-2 h-5 w-5 text-[#9B9590]" />
                      <span className="font-sans text-[11px] text-[#9B9590]">
                        Click to upload
                      </span>
                      <span className="mt-1 font-sans text-[10px] text-[#B7AEA9]">
                        Square recommended
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileUpload}
                    disabled={profileUploading}
                    className="hidden"
                  />
                </label>
                {errors.profile_image && (
                  <p className="mt-1.5 flex items-center gap-1 font-sans text-[10px] text-red-500">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {errors.profile_image}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── Cover Image ── */}
          <div>
            <h3 className="mb-4 font-sans text-[10px] uppercase tracking-[2px] text-[#9B9590]">
              Cover Image
            </h3>
            {coverSrc ? (
              <div className="relative aspect-video overflow-hidden bg-[#F0EDE8]">
                <img
                  src={coverSrc}
                  alt="Cover"
                  className="h-full w-full object-cover"
                />
                {coverUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  </div>
                )}
                {!coverUploading && (
                  <button
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, cover_image: '' }))
                      setCoverPreview(null)
                      if (coverPreviewRef.current) {
                        URL.revokeObjectURL(coverPreviewRef.current)
                        coverPreviewRef.current = null
                      }
                    }}
                    className="absolute right-2 top-2 bg-white/90 px-2 py-1 font-sans text-[10px] text-[#2A2522] transition-colors hover:bg-white"
                  >
                    Remove
                  </button>
                )}
              </div>
            ) : (
              <div>
                <label className="flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-[rgba(0,0,0,0.15)] p-6 text-center transition-colors hover:border-[#2A2522]">
                  {coverUploading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-[#9B9590]" />
                  ) : (
                    <>
                      <Upload className="mb-2 h-5 w-5 text-[#9B9590]" />
                      <span className="font-sans text-[11px] text-[#9B9590]">
                        Click to upload
                      </span>
                      <span className="mt-1 font-sans text-[10px] text-[#B7AEA9]">
                        16:9 recommended
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    disabled={coverUploading}
                    className="hidden"
                  />
                </label>
                {errors.cover_image && (
                  <p className="mt-1.5 flex items-center gap-1 font-sans text-[10px] text-red-500">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {errors.cover_image}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── Save button ── */}
          <button
            onClick={handleSave}
            disabled={loading || isUploading}
            className="flex w-full items-center justify-center gap-2 bg-[#0E0E0D] py-3 font-sans text-[11px] font-bold uppercase tracking-[4px] text-white transition-colors hover:bg-[#2A2522] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
