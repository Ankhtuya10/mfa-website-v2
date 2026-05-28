'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, Check, Loader2, AlertCircle } from 'lucide-react'
import { ASSET_FOLDERS } from '@/lib/content/assetFolders'
import { fetchJson, postJson } from '@/lib/content/client'
import { ImagePickerField } from '@/app/admin/components/ImagePickerField'

type Tier = 'high-end' | 'contemporary' | 'emerging'

const TIERS: { value: Tier; label: string }[] = [
  { value: 'high-end', label: 'Дээд зэрэглэл' },
  { value: 'contemporary', label: 'Орчин үеийн' },
  { value: 'emerging', label: 'Шинэ үе' },
]

export default function EditDesignerPage() {
  const router = useRouter()
  const params = useParams()

  const [loadingDesigner, setLoadingDesigner] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
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
      setLoadingDesigner(false)
    }

    if (params.id) loadDesigner()
  }, [params.id])

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (!formData.name.trim()) next.name = 'Нэр оруулна уу'
    if (!formData.slug.trim()) next.slug = 'Slug оруулна уу'
    if (!formData.tier) next.tier = 'Түвшин сонгоно уу'
    if (!formData.short_bio.trim()) next.short_bio = 'Товч танилцуулга оруулна уу'
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
      setSaveError(err?.message || 'Брэнд/дизайнерын мэдээллийг шинэчилж чадсангүй. Дахин оролдоно уу.')
    } finally {
      setLoading(false)
    }
  }

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
        <p className="font-sans text-[13px] text-[#9B9590]">Брэнд/дизайнер олдсонгүй.</p>
        <Link
          href="/admin/designers"
          className="font-sans text-[11px] uppercase tracking-[2px] text-[#2A2522] underline"
        >
          Брэнд/Дизайнерууд руу буцах
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
            Брэнд/Дизайнер засах
          </h1>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 bg-[#0E0E0D] px-6 py-2 font-sans text-[11px] font-bold uppercase tracking-[4px] text-white transition-colors hover:bg-[#2A2522] disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <>
              <Check className="h-4 w-4" /> Хадгалсан
            </>
          ) : (
            'Өөрчлөлт хадгалах'
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
              placeholder="Брэнд/дизайнерын нэр..."
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
              Товч танилцуулга *
            </label>
            <textarea
              value={formData.short_bio}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, short_bio: e.target.value }))
                if (e.target.value.trim())
                  setErrors((prev) => ({ ...prev, short_bio: '' }))
              }}
              placeholder="Жагсаалт болон карт дээр харагдах товч, тод танилцуулга..."
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
              Дэлгэрэнгүй танилцуулга
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
              placeholder="Брэнд/дизайнерын түүх, дэлгэрэнгүй агуулга..."
              className="w-full min-h-[300px] resize-none bg-transparent font-sans text-[15px] leading-[1.8] text-[#3A3530] outline-none placeholder:text-[#B7AEA9]"
            />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="sticky top-[73px] flex h-[calc(100vh-73px)] w-[268px] shrink-0 flex-col gap-6 overflow-y-auto border-l border-[#E8E4DD] bg-white px-6 py-6">
          {/* ── Tier ── */}
          <div>
            <h3 className="mb-4 font-sans text-[10px] uppercase tracking-[2px] text-[#9B9590]">
              Түвшин *
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
              Байгуулагдсан он
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
              placeholder="ж. 1995"
              className="w-full border border-[rgba(0,0,0,0.15)] bg-transparent px-3 py-2 font-sans text-[12px] outline-none placeholder:text-[#B7AEA9]"
            />
          </div>

          {/* ── Profile Image ── */}
          <div>
            <ImagePickerField
              value={formData.profile_image || null}
              onChange={(url) => setFormData((prev) => ({ ...prev, profile_image: url || '' }))}
              label="Профайл зураг"
              error={errors.profile_image}
              aspect="square"
              uploadFolder={ASSET_FOLDERS.designer as import('@/lib/content/assetFolders').AssetFolder}
              placeholder="Профайл зураг сонгох"
            />
          </div>

          {/* ── Cover Image ── */}
          <div>
            <ImagePickerField
              value={formData.cover_image || null}
              onChange={(url) => setFormData((prev) => ({ ...prev, cover_image: url || '' }))}
              label="Нүүр зураг"
              error={errors.cover_image}
              aspect="video"
              uploadFolder={ASSET_FOLDERS.designer as import('@/lib/content/assetFolders').AssetFolder}
            />
          </div>

          {/* ── Save button ── */}
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 bg-[#0E0E0D] py-3 font-sans text-[11px] font-bold uppercase tracking-[4px] text-white transition-colors hover:bg-[#2A2522] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Өөрчлөлт хадгалах'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
