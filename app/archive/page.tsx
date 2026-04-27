'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { StickyNavbar, Footer } from '@/app/components'
import { EmptyState } from '@/app/components/shared/EmptyState'

const canonicalSeasons = ['SS', 'FW', 'Pre-Fall', 'Resort'] as const
const archiveFallbackImage =
  'https://feiffroacxipvonvmecs.supabase.co/storage/v1/object/public/videos/images/pexels-aagii-aagii-494659827-16010457.jpg'
const archiveBackupImage =
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&h=900&fit=crop&q=80'

const categoryKeywords: Record<string, string[]> = {
  Outerwear: ['outerwear', 'coat', 'jacket', 'parka', 'trench', 'bomber'],
  Knitwear: ['knit', 'knitwear', 'cardigan', 'sweater', 'turtleneck'],
  Accessories: ['accessory', 'bag', 'belt', 'scarf', 'hat', 'jewelry', 'jewellery'],
  Footwear: ['footwear', 'shoe', 'boot', 'sneaker', 'loafer', 'heel', 'sandals'],
}

const materialKeywords: Record<string, string[]> = {
  Cashmere: ['cashmere'],
  Silk: ['silk'],
  'Technical Nylon': ['nylon', 'technical'],
  'Distressed Denim': ['denim', 'distressed'],
  Wool: ['wool'],
  Leather: ['leather'],
}

const getDesignerName = (collection: any) =>
  String(collection.designer_name || collection.designerName || 'Unknown Brand')

const normalizeSeason = (value: string) => {
  const text = value.toLowerCase()
  if (text.includes('pre-fall') || text.includes('prefall')) return 'Pre-Fall'
  if (text.includes('resort') || text.includes('cruise')) return 'Resort'
  if (text.includes('spring') || text.includes('summer') || text.includes('ss')) return 'SS'
  if (text.includes('fall') || text.includes('autumn') || text.includes('winter') || text.includes('fw')) return 'FW'
  return ''
}

const getCollectionSeason = (collection: any) => {
  const explicitSeason = normalizeSeason(String(collection.season || ''))
  if (explicitSeason) return explicitSeason
  return normalizeSeason(String(collection.slug || ''))
}

const getCollectionYear = (collection: any) => {
  const directYear = Number(collection.year)
  if (Number.isFinite(directYear) && directYear > 0) return directYear
  const match = String(collection.slug || '').match(/(19|20)\d{2}/)
  return match ? Number(match[0]) : null
}

const getSearchText = (collection: any) =>
  `${collection.title || ''} ${collection.description || ''}`.toLowerCase()

const deriveCategories = (collection: any) => {
  const categories = new Set<string>()
  const searchText = getSearchText(collection)
  const looks = Array.isArray(collection.looks) ? collection.looks : []

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => searchText.includes(keyword))) categories.add(category)
  }

  for (const look of looks) {
    const tags = Array.isArray(look?.tags) ? look.tags : []
    for (const tag of tags) {
      const normalizedTag = String(tag).toLowerCase()
      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some((keyword) => normalizedTag.includes(keyword))) categories.add(category)
      }
    }
  }

  return Array.from(categories)
}

const deriveMaterials = (collection: any) => {
  const materials = new Set<string>()
  const searchText = getSearchText(collection)
  const looks = Array.isArray(collection.looks) ? collection.looks : []

  for (const [material, keywords] of Object.entries(materialKeywords)) {
    if (keywords.some((keyword) => searchText.includes(keyword))) materials.add(material)
  }

  for (const look of looks) {
    const lookMaterials = Array.isArray(look?.materials) ? look.materials : []
    for (const rawMaterial of lookMaterials) {
      const normalizedMaterial = String(rawMaterial).toLowerCase()
      for (const [material, keywords] of Object.entries(materialKeywords)) {
        if (keywords.some((keyword) => normalizedMaterial.includes(keyword))) materials.add(material)
      }
    }
  }

  return Array.from(materials)
}

type CollectionMeta = {
  key: string
  collection: any
  year: number | null
  season: string
  designer: string
  categories: string[]
  materials: string[]
}

const getCollectionCoverImage = (collection: any) => {
  const coverImage = String(collection.cover_image || collection.coverImage || '').trim()
  return coverImage || archiveFallbackImage
}

const getSeasonAndYearLabel = (item: CollectionMeta) => {
  const seasonLabel = item.season || 'Season'
  return item.year ? `${seasonLabel} ${item.year}` : seasonLabel
}

const ArchiveCollectionCard = ({ item }: { item: CollectionMeta }) => {
  const collectionTitle = String(item.collection.title || item.designer || 'Collection')
  const coverImage = getCollectionCoverImage(item.collection)
  const [imageSrc, setImageSrc] = useState(coverImage)

  return (
    <Link href={`/archive/${item.collection.slug}`} className="group block h-full min-w-0">
      <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-[20px] border border-white/10 bg-[#100E0C]/95 transition-all duration-300 hover:-translate-y-1 hover:border-white/22 hover:bg-[#17130F]">
        <div className="relative aspect-[16/10] overflow-hidden bg-[#0D0B09]">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(20,17,14,0.82)_42%,rgba(0,0,0,0.96))]" />
          <Image
            src={imageSrc}
            alt={collectionTitle}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
            onError={() => setImageSrc((current) => (current === archiveBackupImage ? current : archiveBackupImage))}
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/34 via-transparent to-black/8" />
        </div>

        <div className="flex min-h-[6.5rem] flex-1 flex-col border-t border-white/[0.07] p-4">
          <p className="mb-2 truncate font-sans text-[10px] tracking-[0.16em] uppercase text-white/42">
            {item.designer} / {getSeasonAndYearLabel(item)}
          </p>
          <h3 className="line-clamp-2 font-serif text-[19px] leading-[1.08] text-white md:text-[21px]">
            {collectionTitle}
          </h3>
          <span className="mt-auto pt-3 font-sans text-[9px] tracking-[0.22em] uppercase text-white/34">
            View Collection
          </span>
        </div>
      </article>
    </Link>
  )
}

export default function ArchivePage() {
  const [collections, setCollections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYears, setSelectedYears] = useState<number[]>([])
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([])
  const [selectedDesigners, setSelectedDesigners] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])

  useEffect(() => {
    async function fetchCollections() {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()

        const { data, error } = await supabase
          .from('collections')
          .select('*, looks(materials, tags)')
          .order('year', { ascending: false })

        if (error) throw error
        setCollections(data || [])
      } catch {
        setCollections([])
      } finally {
        setLoading(false)
      }
    }

    fetchCollections()
  }, [])

  const archiveCollections = useMemo(() => {
    const bySlug = new Map<string, any>()
    for (const collection of collections) {
      const key = String(collection.slug || collection.id)
      if (!bySlug.has(key)) bySlug.set(key, collection)
    }
    return Array.from(bySlug.values())
  }, [collections])

  const collectionMeta = useMemo<CollectionMeta[]>(
    () =>
      archiveCollections.map((collection) => ({
        key: String(collection.slug || collection.id),
        collection,
        year: getCollectionYear(collection),
        season: getCollectionSeason(collection),
        designer: getDesignerName(collection),
        categories: deriveCategories(collection),
        materials: deriveMaterials(collection),
      })),
    [archiveCollections]
  )

  const yearOptions = useMemo(
    () =>
      Array.from(new Set(collectionMeta.map((item) => item.year).filter((year): year is number => year !== null))).sort(
        (a, b) => b - a
      ),
    [collectionMeta]
  )

  const seasonOptions = useMemo(() => {
    const found = Array.from(new Set(collectionMeta.map((item) => item.season).filter(Boolean)))
    const extras = found.filter((season) => !canonicalSeasons.includes(season as (typeof canonicalSeasons)[number]))
    return [...canonicalSeasons, ...extras]
  }, [collectionMeta])

  const designerOptions = useMemo(
    () => Array.from(new Set(collectionMeta.map((item) => item.designer))).sort((a, b) => a.localeCompare(b)),
    [collectionMeta]
  )

  const categoryOptions = useMemo(
    () => Array.from(new Set(collectionMeta.flatMap((item) => item.categories))).sort((a, b) => a.localeCompare(b)),
    [collectionMeta]
  )

  const materialOptions = useMemo(
    () => Array.from(new Set(collectionMeta.flatMap((item) => item.materials))).sort((a, b) => a.localeCompare(b)),
    [collectionMeta]
  )

  const filteredMeta = useMemo(
    () =>
      collectionMeta.filter((item) => {
        const yearMatch = selectedYears.length === 0 || (item.year !== null && selectedYears.includes(item.year))
        const seasonMatch = selectedSeasons.length === 0 || selectedSeasons.includes(item.season)
        const designerMatch = selectedDesigners.length === 0 || selectedDesigners.includes(item.designer)
        const categoryMatch =
          selectedCategories.length === 0 || selectedCategories.some((category) => item.categories.includes(category))
        const materialMatch =
          selectedMaterials.length === 0 || selectedMaterials.some((material) => item.materials.includes(material))

        return yearMatch && seasonMatch && designerMatch && categoryMatch && materialMatch
      }),
    [collectionMeta, selectedYears, selectedSeasons, selectedDesigners, selectedCategories, selectedMaterials]
  )

  const activeFilterCount =
    selectedYears.length +
    selectedSeasons.length +
    selectedDesigners.length +
    selectedCategories.length +
    selectedMaterials.length

  const clearAllFilters = () => {
    setSelectedYears([])
    setSelectedSeasons([])
    setSelectedDesigners([])
    setSelectedCategories([])
    setSelectedMaterials([])
  }

  const toggleValue = <T,>(value: T, setter: (next: (previous: T[]) => T[]) => void) => {
    setter((previous) => (previous.includes(value) ? previous.filter((item) => item !== value) : [...previous, value]))
  }

  const FilterGroup = <T extends string | number>({
    label,
    values,
    selected,
    onToggle,
  }: {
    label: string
    values: T[]
    selected: T[]
    onToggle: (value: T) => void
  }) => (
    <div>
      <p className="mb-2.5 font-sans text-[11px] tracking-[0.18em] uppercase text-white/48">{label}</p>
      <div className="flex flex-wrap gap-2">
        {values.length === 0 ? (
          <span className="font-sans text-xs text-white/32">No options</span>
        ) : (
          values.map((value) => {
            const isSelected = selected.includes(value)
            return (
              <button
                key={String(value)}
                type="button"
                onClick={() => onToggle(value)}
                className={`rounded-full border px-3 py-2 font-sans text-[10px] leading-none tracking-[0.1em] uppercase transition-all ${
                  isSelected
                    ? 'border-transparent bg-white/90 text-black'
                    : 'border-white/10 bg-white/[0.04] text-white/55 hover:border-white/24 hover:bg-white/[0.07] hover:text-white/82'
                }`}
              >
                {String(value)}
              </button>
            )
          })
        )}
      </div>
    </div>
  )

  return (
    <div className="h-screen w-full overflow-hidden bg-[#090807]">
      <StickyNavbar />
      <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth snap-container">
        <section className="snap-start relative h-screen w-full overflow-hidden">
          <Image src={archiveFallbackImage} alt="Archive Background" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/58" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_62%,rgba(0,0,0,0.86)_100%)]" />

          <div className="relative z-10 flex h-full items-center justify-center px-6 pt-24 md:px-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto max-w-5xl text-center"
            >
              <span className="mb-5 block font-sans text-[10px] tracking-[0.36em] uppercase text-white/58">
                Mongolian Fashion Archive
              </span>
              <h1 className="mb-5 font-serif text-6xl leading-none text-white md:text-7xl lg:text-8xl">The Archive</h1>
              <p className="mx-auto max-w-2xl font-sans text-base leading-relaxed text-white/62 md:text-lg">
                Every season, every collection, every look preserved in one editorial index.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="snap-start relative h-screen w-full overflow-hidden bg-[#080706]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_74%_12%,rgba(212,201,184,0.055),transparent_30%),radial-gradient(circle_at_18%_88%,rgba(116,86,58,0.055),transparent_32%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.025),transparent_22%,rgba(0,0,0,0.28))]" />

          <div className="absolute bottom-4 left-8 right-8 top-[92px] z-10 grid min-h-0 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] gap-4 md:left-10 md:right-10 md:top-[104px] lg:left-12 lg:right-10 lg:top-[96px] lg:grid-cols-[17rem_minmax(0,1fr)] lg:grid-rows-1">
            <aside className="flex min-h-0 max-h-[30vh] flex-col overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.035] shadow-[0_24px_90px_rgba(0,0,0,0.3)] backdrop-blur-xl lg:max-h-none">
              <div className="shrink-0 border-b border-white/[0.07] px-8 py-5">
                <span className="mb-2 block pl-1 font-sans text-[10px] tracking-[0.24em] uppercase text-white/38">
                  Archive Index
                </span>
                <h2 className="pl-1 font-serif text-[24px] leading-none text-white">Filter Archive</h2>
                <p className="mt-2 font-sans text-[13px] leading-relaxed text-white/50">
                  Narrow by season, brand, and material.
                </p>
              </div>

              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-8 py-5">
                <FilterGroup
                  label="Year"
                  values={yearOptions}
                  selected={selectedYears}
                  onToggle={(year) => toggleValue(year, setSelectedYears)}
                />
                <FilterGroup
                  label="Season"
                  values={seasonOptions}
                  selected={selectedSeasons}
                  onToggle={(season) => toggleValue(season, setSelectedSeasons)}
                />
                <FilterGroup
                  label="Designer / Brand"
                  values={designerOptions}
                  selected={selectedDesigners}
                  onToggle={(designer) => toggleValue(designer, setSelectedDesigners)}
                />
                <FilterGroup
                  label="Category"
                  values={categoryOptions}
                  selected={selectedCategories}
                  onToggle={(category) => toggleValue(category, setSelectedCategories)}
                />
                <FilterGroup
                  label="Material"
                  values={materialOptions}
                  selected={selectedMaterials}
                  onToggle={(material) => toggleValue(material, setSelectedMaterials)}
                />
              </div>

              {activeFilterCount > 0 && (
                  <div className="shrink-0 border-t border-white/[0.07] px-6 py-3">
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="w-full rounded-full border border-white/14 bg-white/[0.04] px-4 py-2.5 font-sans text-[10px] tracking-[0.18em] uppercase text-white/68 transition-all hover:border-white/28 hover:bg-white/[0.08] hover:text-white"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </aside>

            <main className="min-h-0 overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(22,18,15,0.94)_0%,rgba(10,9,8,0.96)_100%)] shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl">
              <div className="flex h-full min-h-0 flex-col">
                <div className="flex shrink-0 flex-col gap-3 border-b border-white/[0.08] px-9 py-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <span className="mb-1.5 block pl-1 font-sans text-[10px] tracking-[0.28em] uppercase text-white/34">
                      Collection Snapshot
                    </span>
                    <h3 className="pl-1 font-serif text-[32px] leading-none text-white md:text-[38px]">Archive Results</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-2 font-sans text-[10px] leading-none tracking-[0.16em] uppercase text-white/68">
                      {filteredMeta.length} collections
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 font-sans text-[10px] leading-none tracking-[0.16em] uppercase text-white/46">
                      {activeFilterCount > 0 ? `${activeFilterCount} active` : 'Unfiltered'}
                    </span>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 md:px-6 md:py-5">
                  {loading ? (
                    <div className="flex h-full items-center justify-center">
                      <span className="font-sans text-sm tracking-[0.22em] uppercase text-[#B7AEA9]">Loading...</span>
                    </div>
                  ) : filteredMeta.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                      <EmptyState
                        title="No collections found"
                        subtitle="Try changing your filters to widen the archive search."
                        ghostText="EMPTY"
                        action={{ label: 'Clear Filters', href: '/archive' }}
                      />
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.08 }}
                      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                      className="grid min-h-full grid-cols-1 gap-4 auto-rows-[minmax(17rem,1fr)] sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                    >
                      {filteredMeta.map((item) => (
                        <ArchiveCollectionCard key={item.key} item={item} />
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>
            </main>
          </div>
        </section>

        <div className="snap-start h-screen w-full">
          <Footer />
        </div>
      </div>
    </div>
  )
}
