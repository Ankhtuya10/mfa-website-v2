'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { StickyNavbar, Footer } from '@/app/components'
import { EmptyState } from '@/app/components/shared/EmptyState'
import { collections as mockCollections } from '@/lib/mockData'

const canonicalSeasons = ['SS', 'FW', 'Pre-Fall', 'Resort'] as const
const baselineCategories = ['Outerwear', 'Knitwear', 'Accessories', 'Footwear']
const baselineMaterials = ['Cashmere', 'Silk', 'Technical Nylon', 'Distressed Denim']
const archiveFallbackImage =
  'https://feiffroacxipvonvmecs.supabase.co/storage/v1/object/sign/videos/images/pexels-aagii-aagii-494659827-16010457.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9kNTdjZGJjYi0wNzRmLTQyMGMtOGJmMS1iY2MyZTI2NzkyODciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MvaW1hZ2VzL3BleGVscy1hYWdpaS1hYWdpaS00OTQ2NTk4MjctMTYwMTA0NTcuanBnIiwiaWF0IjoxNzc1MDUxNDk0LCJleHAiOjE3Nzc2NDM0OTR9.LKF0BalPkfNtet7pmvN0jMDvNWv6azlFPg5S-py5AiQ'
const featureBreakInterval = 5
const featureBreakSize = 5

const categoryKeywords: Record<string, string[]> = {
  Outerwear: ['outerwear', 'coat', 'jacket', 'parka', 'trench', 'bomber'],
  Knitwear: ['knit', 'knitwear', 'cardigan', 'sweater', 'turtleneck'],
  Accessories: ['accessory', 'bag', 'belt', 'scarf', 'hat', 'jewelry', 'jewellery'],
  Footwear: ['footwear', 'shoe', 'boot', 'sneaker', 'loafer', 'heel', 'sandals']
}

const materialKeywords: Record<string, string[]> = {
  Cashmere: ['cashmere'],
  Silk: ['silk'],
  'Technical Nylon': ['nylon', 'technical'],
  'Distressed Denim': ['denim', 'distressed'],
  Wool: ['wool'],
  Leather: ['leather']
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
  const slug = String(collection.slug || '')
  const match = slug.match(/(19|20)\d{2}/)
  return match ? Number(match[0]) : null
}

const getSearchText = (collection: any) =>
  `${collection.title || ''} ${collection.description || ''}`.toLowerCase()

const deriveCategories = (collection: any) => {
  const categories = new Set<string>()
  const searchText = getSearchText(collection)
  const looks = Array.isArray(collection.looks) ? collection.looks : []

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => searchText.includes(keyword))) {
      categories.add(category)
    }
  }

  for (const look of looks) {
    const tags = Array.isArray(look?.tags) ? look.tags : []
    for (const tag of tags) {
      const normalizedTag = String(tag).toLowerCase()
      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some((keyword) => normalizedTag.includes(keyword))) {
          categories.add(category)
        }
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
    if (keywords.some((keyword) => searchText.includes(keyword))) {
      materials.add(material)
    }
  }

  for (const look of looks) {
    const lookMaterials = Array.isArray(look?.materials) ? look.materials : []
    for (const rawMaterial of lookMaterials) {
      const normalizedMaterial = String(rawMaterial).toLowerCase()
      for (const [material, keywords] of Object.entries(materialKeywords)) {
        if (keywords.some((keyword) => normalizedMaterial.includes(keyword))) {
          materials.add(material)
        }
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

type ArchiveBand =
  | {
      type: 'regular'
      key: string
      items: CollectionMeta[]
    }
  | {
      type: 'feature'
      key: string
      feature: CollectionMeta
      companions: CollectionMeta[]
      align: 'left' | 'right'
    }

const getCollectionCoverImage = (collection: any) =>
  collection.cover_image || collection.coverImage || archiveFallbackImage

const getSeasonAndYearLabel = (item: CollectionMeta) => {
  const seasonLabel = item.season || 'Season'
  return item.year ? `${seasonLabel} ${item.year}` : seasonLabel
}

const buildArchiveBands = (items: CollectionMeta[]) => {
  if (items.length >= featureBreakSize && items.length <= 8) {
    const featureBand: ArchiveBand = {
      type: 'feature',
      key: `feature-${items[0].key}-seed`,
      feature: items[0],
      companions: items.slice(1, featureBreakSize),
      align: 'left'
    }

    if (items.length === featureBreakSize) {
      return [featureBand]
    }

    const regularBand: ArchiveBand = {
      type: 'regular',
      key: `regular-${items[featureBreakSize].key}-${featureBreakSize}`,
      items: items.slice(featureBreakSize)
    }

    return [
      featureBand,
      regularBand
    ]
  }

  const bands: ArchiveBand[] = []
  let cursor = 0
  let nextFeatureIndex = featureBreakInterval - 1
  let featureCount = 0

  while (cursor < items.length) {
    while (nextFeatureIndex < cursor) {
      nextFeatureIndex += featureBreakInterval
    }

    const remainingItems = items.length - cursor
    const canCreateFeatureBand = cursor === nextFeatureIndex && remainingItems >= featureBreakSize

    if (canCreateFeatureBand) {
      const feature = items[cursor]
      const companions = items.slice(cursor + 1, cursor + featureBreakSize)

      bands.push({
        type: 'feature',
        key: `feature-${feature.key}-${cursor}`,
        feature,
        companions,
        align: featureCount % 2 === 0 ? 'left' : 'right'
      })

      cursor += featureBreakSize
      nextFeatureIndex += featureBreakInterval
      featureCount += 1
      continue
    }

    const regularChunkEnd =
      nextFeatureIndex > cursor ? Math.min(cursor + 4, nextFeatureIndex) : Math.min(cursor + 4, items.length)
    const regularItems = items.slice(cursor, regularChunkEnd)

    if (regularItems.length === 0) {
      nextFeatureIndex += featureBreakInterval
      continue
    }

    bands.push({
      type: 'regular',
      key: `regular-${regularItems[0].key}-${cursor}`,
      items: regularItems
    })

    cursor += regularItems.length
  }

  return bands
}

const getRegularBandGridClass = (count: number) => {
  if (count <= 1) return 'grid grid-cols-1 gap-4 md:gap-5'
  if (count === 2) return 'grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5'
  if (count === 3) return 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 md:gap-5'
  return 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 md:gap-5'
}

type ArchiveCollectionCardProps = {
  item: CollectionMeta
  featured?: boolean
}

const ArchiveCollectionCard = ({ item, featured = false }: ArchiveCollectionCardProps) => {
  const collectionTitle = String(item.collection.title || item.designer || 'Collection')
  const seasonAndYear = getSeasonAndYearLabel(item)
  const coverImage = getCollectionCoverImage(item.collection)

  return (
    <Link href={`/archive/${item.collection.slug}`} className="group block h-full">
      <article className="relative aspect-[3/4] h-full overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#0F0D0B] shadow-[0_24px_50px_rgba(0,0,0,0.22)]">
        <Image
          src={coverImage}
          alt={item.collection.title || 'Collection'}
          fill
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/38 to-black/8 transition-all duration-500 group-hover:from-black/96 group-hover:via-black/52" />
        <div className="absolute inset-0 border border-white/[0.04] transition-colors duration-500 group-hover:border-white/[0.18]" />
        <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
          <div className="max-w-[20rem] space-y-3">
            <p
              className={`font-serif leading-[1.05] text-white/90 transition-all duration-500 group-hover:text-white ${
                featured ? 'text-[1.7rem] md:text-[2.1rem]' : 'text-[1.18rem] md:text-[1.42rem]'
              }`}
            >
              {collectionTitle}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-white/68 transition-colors duration-500 group-hover:text-white/92">
              <p className="font-sans text-[10px] tracking-[0.28em] uppercase">{item.designer}</p>
              <span className="h-[3px] w-[3px] rounded-full bg-current" />
              <p className="font-sans text-[10px] tracking-[0.28em] uppercase">{seasonAndYear}</p>
            </div>
          </div>
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
  const [yearQuery, setYearQuery] = useState('')
  const [designerQuery, setDesignerQuery] = useState('')
  const [categoryQuery, setCategoryQuery] = useState('')
  const [materialQuery, setMaterialQuery] = useState('')

  useEffect(() => {
    async function fetchCollections() {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()

        const { data, error } = await supabase
          .from('collections')
          .select('*, looks(count)')
          .order('year', { ascending: false })

        if (error || !data || data.length === 0) {
          setCollections(mockCollections)
        } else {
          setCollections(data)
        }
      } catch {
        setCollections(mockCollections)
      } finally {
        setLoading(false)
      }
    }

    fetchCollections()
  }, [])

  const archiveCollections = useMemo(() => {
    const bySlug = new Map<string, any>()
    for (const collection of [...collections, ...mockCollections]) {
      const key = String(collection.slug || collection.id)
      if (!bySlug.has(key)) {
        bySlug.set(key, collection)
      }
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
        materials: deriveMaterials(collection)
      })),
    [archiveCollections]
  )

  const yearOptions = useMemo(() => {
    const years = Array.from(
      new Set(collectionMeta.map((item) => item.year).filter((year): year is number => year !== null))
    )
    return years.sort((a, b) => b - a)
  }, [collectionMeta])

  const seasonOptions = useMemo(() => {
    const foundSeasons = Array.from(new Set(collectionMeta.map((item) => item.season).filter(Boolean)))
    const extras = foundSeasons.filter(
      (season) => !canonicalSeasons.includes(season as (typeof canonicalSeasons)[number])
    )
    return [...canonicalSeasons, ...extras]
  }, [collectionMeta])

  const designerOptions = useMemo(
    () => Array.from(new Set(collectionMeta.map((item) => item.designer))).sort((a, b) => a.localeCompare(b)),
    [collectionMeta]
  )

  const categoryOptions = useMemo(() => {
    const foundCategories = Array.from(new Set(collectionMeta.flatMap((item) => item.categories)))
    return Array.from(new Set([...baselineCategories, ...foundCategories]))
  }, [collectionMeta])

  const materialOptions = useMemo(() => {
    const foundMaterials = Array.from(new Set(collectionMeta.flatMap((item) => item.materials)))
    return Array.from(new Set([...baselineMaterials, ...foundMaterials]))
  }, [collectionMeta])

  const filteredYearOptions = useMemo(() => {
    const query = yearQuery.trim()
    if (!query) return yearOptions
    return yearOptions.filter((year) => String(year).includes(query))
  }, [yearOptions, yearQuery])

  const filteredDesignerOptions = useMemo(() => {
    const query = designerQuery.trim().toLowerCase()
    if (!query) return designerOptions
    return designerOptions.filter((designer) => designer.toLowerCase().includes(query))
  }, [designerOptions, designerQuery])

  const filteredCategoryOptions = useMemo(() => {
    const query = categoryQuery.trim().toLowerCase()
    if (!query) return categoryOptions
    return categoryOptions.filter((category) => category.toLowerCase().includes(query))
  }, [categoryOptions, categoryQuery])

  const filteredMaterialOptions = useMemo(() => {
    const query = materialQuery.trim().toLowerCase()
    if (!query) return materialOptions
    return materialOptions.filter((material) => material.toLowerCase().includes(query))
  }, [materialOptions, materialQuery])

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

  const archiveBands = useMemo(() => buildArchiveBands(filteredMeta), [filteredMeta])

  const clearAllFilters = () => {
    setSelectedYears([])
    setSelectedSeasons([])
    setSelectedDesigners([])
    setSelectedCategories([])
    setSelectedMaterials([])
    setYearQuery('')
    setDesignerQuery('')
    setCategoryQuery('')
    setMaterialQuery('')
  }

  const activeFilterCount =
    selectedYears.length +
    selectedSeasons.length +
    selectedDesigners.length +
    selectedCategories.length +
    selectedMaterials.length

  const selectedYearLabel =
    selectedYears.length === 0
      ? 'All years'
      : selectedYears.length === 1
      ? `${selectedYears[0]}`
      : `${selectedYears.length} years selected`

  const selectedDesignerLabel =
    selectedDesigners.length === 0
      ? 'All designers'
      : selectedDesigners.length === 1
      ? selectedDesigners[0]
      : `${selectedDesigners.length} designers selected`

  const selectedCategoryLabel =
    selectedCategories.length === 0
      ? 'All categories'
      : selectedCategories.length === 1
      ? selectedCategories[0]
      : `${selectedCategories.length} categories selected`

  const selectedMaterialLabel =
    selectedMaterials.length === 0
      ? 'All materials'
      : selectedMaterials.length === 1
      ? selectedMaterials[0]
      : `${selectedMaterials.length} materials selected`

  return (
    <div className="h-screen w-full overflow-hidden">
      <StickyNavbar />
      <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth snap-container pt-[72px] md:pt-[88px]">
        <div className="snap-start h-screen w-full relative overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="https://feiffroacxipvonvmecs.supabase.co/storage/v1/object/sign/videos/images/pexels-aagii-aagii-494659827-16010457.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9kNTdjZGJjYi0wNzRmLTQyMGMtOGJmMS1iY2MyZTI2NzkyODciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MvaW1hZ2VzL3BleGVscy1hYWdpaS1hYWdpaS00OTQ2NTk4MjctMTYwMTA0NTcuanBnIiwiaWF0IjoxNzc1MDUxNDk0LCJleHAiOjE3Nzc2NDM0OTR9.LKF0BalPkfNtet7pmvN0jMDvNWv6azlFPg5S-py5AiQ"
              alt="Archive Background"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>

          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="w-full max-w-5xl mx-auto px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="font-sans text-xs tracking-[4.95px] uppercase text-white/60 block mb-4">
                  Mongolian Fashion Archive
                </span>
                <h1 className="font-serif text-white text-5xl md:text-6xl lg:text-7xl leading-[1.1] mb-4">The Archive</h1>
                <p className="font-sans text-white/60 text-lg">Every season. Every collection. Every look - preserved.</p>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="snap-start h-screen w-full bg-[linear-gradient(180deg,#F2ECE4_0%,#E6DDD0_100%)] pt-[182px] md:pt-[200px] pb-2 md:pb-4">
          <div className="h-full w-full px-0 md:px-4 lg:px-6">
            <div className="relative h-full overflow-hidden border border-black/10 bg-[#13100F] shadow-[0_28px_90px_rgba(19,14,11,0.24)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(214,191,159,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.04),transparent_24%)]" />

              <div className="relative grid h-full grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)] pt-[96px] md:pt-[112px] lg:pt-[128px]">
                <aside className="relative z-10 min-h-0 border-b border-white/[0.08] bg-[#11100F]/95 xl:border-b-0 xl:border-r xl:border-white/[0.08] pt-6 md:pt-8 lg:pt-10 pb-10">
                  <div className="flex h-full min-h-0 flex-col gap-8 max-w-[240px] w-full mx-auto">
                    <div className="border-b border-white/[0.08] px-4 py-6 md:px-5">
                      <span className="font-sans text-[10px] tracking-[0.32em] uppercase text-white/35">Archive Index</span>
                      <div className="mt-4 flex items-start justify-between gap-4">
                        <div>
                          <h2 className="font-serif text-[2.15rem] leading-none text-white">Filters</h2>
                          <p className="mt-3 max-w-[13rem] font-sans text-[10px] tracking-[0.26em] uppercase leading-5 text-white/38">
                            Build a precise view of the collections.
                          </p>
                        </div>
                        {activeFilterCount > 0 ? (
                          <button
                            onClick={clearAllFilters}
                            className="shrink-0 rounded-full border border-white/14 px-3 py-2 font-sans text-[9px] tracking-[0.26em] uppercase text-white/68 transition-colors hover:border-white/30 hover:text-white"
                          >
                            Clear all
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 md:px-6">
                      <div className="space-y-7">
                        <div>
                          <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-white/34">Year</p>
                          <details className="group mt-3 rounded-[14px] border border-white/10 bg-white/[0.03]">
                            <summary className="relative flex cursor-pointer list-none items-center justify-between gap-3 px-3.5 py-3">
                              <span className="font-sans text-[11px] tracking-[0.18em] uppercase text-white/86 truncate">
                                {selectedYearLabel}
                              </span>
                              <span className="font-sans text-[11px] text-white/50 transition-transform duration-200 group-open:rotate-180">
                                v
                              </span>
                            </summary>
                            <div className="border-t border-white/10 p-2 space-y-2">
                              <input
                                type="text"
                                value={yearQuery}
                                onChange={(event) => setYearQuery(event.target.value)}
                                placeholder="Search years..."
                                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-sans text-[11px] text-white placeholder:text-white/30 outline-none transition-colors focus:border-white/30"
                              />
                              <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
                                {filteredYearOptions.length === 0 ? (
                                  <p className="px-2 py-1 font-sans text-[10px] tracking-[0.18em] uppercase text-white/35">No years</p>
                                ) : (
                                  filteredYearOptions.map((year) => {
                                    const selected = selectedYears.includes(year)
                                    return (
                                      <button
                                        key={year}
                                        type="button"
                                        onClick={() =>
                                          setSelectedYears((previous) =>
                                            previous.includes(year)
                                              ? previous.filter((value) => value !== year)
                                              : [...previous, year]
                                          )
                                        }
                                        className={`w-full rounded-xl px-3 py-2 text-left font-sans text-[11px] tracking-[0.14em] uppercase border transition-colors ${
                                          selected
                                            ? 'text-white border-white/45 bg-white/10'
                                            : 'text-white/75 border-white/10 hover:border-white/25'
                                        }`}
                                      >
                                        {year}
                                      </button>
                                    )
                                  })
                                )}
                              </div>
                            </div>
                          </details>
                        </div>

                        <div>
                          <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-white/34">Season</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {seasonOptions.map((season) => {
                              const selected = selectedSeasons.includes(season)
                              return (
                                <button
                                  key={season}
                                  type="button"
                                  onClick={() =>
                                    setSelectedSeasons((previous) =>
                                      previous.includes(season)
                                        ? previous.filter((value) => value !== season)
                                        : [...previous, season]
                                    )
                                  }
                                  className={`rounded-full px-3.5 py-2 font-sans text-[10px] tracking-[0.24em] uppercase border transition-colors ${
                                    selected
                                      ? 'text-white border-white/45 bg-white/10'
                                      : 'text-white/65 border-white/12 hover:text-white hover:border-white/28'
                                  }`}
                                >
                                  {season}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        <div>
                          <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-white/34">Designer / Brand</p>
                          <details className="group mt-3 rounded-[14px] border border-white/10 bg-white/[0.03]">
                            <summary className="relative flex cursor-pointer list-none items-center justify-between gap-3 px-3.5 py-3">
                              <span className="font-sans text-[11px] tracking-[0.18em] uppercase text-white/86 truncate">
                                {selectedDesignerLabel}
                              </span>
                              <span className="font-sans text-[11px] text-white/50 transition-transform duration-200 group-open:rotate-180">
                                v
                              </span>
                            </summary>
                            <div className="border-t border-white/10 p-2 space-y-2">
                              <input
                                type="text"
                                value={designerQuery}
                                onChange={(event) => setDesignerQuery(event.target.value)}
                                placeholder="Search designers..."
                                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-sans text-[11px] text-white placeholder:text-white/30 outline-none transition-colors focus:border-white/30"
                              />
                              <div className="max-h-44 space-y-1 overflow-y-auto pr-1">
                                {filteredDesignerOptions.length === 0 ? (
                                  <p className="px-2 py-1 font-sans text-[10px] tracking-[0.18em] uppercase text-white/35">No designers</p>
                                ) : (
                                  filteredDesignerOptions.map((designer) => {
                                    const selected = selectedDesigners.includes(designer)
                                    return (
                                      <button
                                        key={designer}
                                        type="button"
                                        onClick={() =>
                                          setSelectedDesigners((previous) =>
                                            previous.includes(designer)
                                              ? previous.filter((value) => value !== designer)
                                              : [...previous, designer]
                                          )
                                        }
                                        className={`w-full rounded-xl px-3 py-2 text-left font-sans text-[11px] tracking-[0.14em] uppercase border transition-colors ${
                                          selected
                                            ? 'text-white border-white/45 bg-white/10'
                                            : 'text-white/75 border-white/10 hover:border-white/25'
                                        }`}
                                      >
                                        {designer}
                                      </button>
                                    )
                                  })
                                )}
                              </div>
                            </div>
                          </details>
                        </div>

                        <div>
                          <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-white/34">Category</p>
                          <details className="group mt-3 rounded-[14px] border border-white/10 bg-white/[0.03]">
                            <summary className="relative flex cursor-pointer list-none items-center justify-between gap-3 px-3.5 py-3">
                              <span className="font-sans text-[11px] tracking-[0.18em] uppercase text-white/86 truncate">
                                {selectedCategoryLabel}
                              </span>
                              <span className="font-sans text-[11px] text-white/50 transition-transform duration-200 group-open:rotate-180">
                                v
                              </span>
                            </summary>
                            <div className="border-t border-white/10 p-2 space-y-2">
                              <input
                                type="text"
                                value={categoryQuery}
                                onChange={(event) => setCategoryQuery(event.target.value)}
                                placeholder="Search categories..."
                                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-sans text-[11px] text-white placeholder:text-white/30 outline-none transition-colors focus:border-white/30"
                              />
                              <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
                                {filteredCategoryOptions.length === 0 ? (
                                  <p className="px-2 py-1 font-sans text-[10px] tracking-[0.18em] uppercase text-white/35">No categories</p>
                                ) : (
                                  filteredCategoryOptions.map((category) => {
                                    const selected = selectedCategories.includes(category)
                                    return (
                                      <button
                                        key={category}
                                        type="button"
                                        onClick={() =>
                                          setSelectedCategories((previous) =>
                                            previous.includes(category)
                                              ? previous.filter((value) => value !== category)
                                              : [...previous, category]
                                          )
                                        }
                                        className={`w-full rounded-xl px-3 py-2 text-left font-sans text-[11px] tracking-[0.14em] uppercase border transition-colors ${
                                          selected
                                            ? 'text-white border-white/45 bg-white/10'
                                            : 'text-white/75 border-white/10 hover:border-white/25'
                                        }`}
                                      >
                                        {category}
                                      </button>
                                    )
                                  })
                                )}
                              </div>
                            </div>
                          </details>
                        </div>

                        <div>
                          <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-white/34">Material / Fabric</p>
                          <details className="group mt-3 rounded-[14px] border border-white/10 bg-white/[0.03]">
                            <summary className="relative flex cursor-pointer list-none items-center justify-between gap-3 px-3.5 py-3">
                              <span className="font-sans text-[11px] tracking-[0.18em] uppercase text-white/86 truncate">
                                {selectedMaterialLabel}
                              </span>
                              <span className="font-sans text-[11px] text-white/50 transition-transform duration-200 group-open:rotate-180">
                                v
                              </span>
                            </summary>
                            <div className="border-t border-white/10 p-2 space-y-2">
                              <input
                                type="text"
                                value={materialQuery}
                                onChange={(event) => setMaterialQuery(event.target.value)}
                                placeholder="Search materials..."
                                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-sans text-[11px] text-white placeholder:text-white/30 outline-none transition-colors focus:border-white/30"
                              />
                              <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
                                {filteredMaterialOptions.length === 0 ? (
                                  <p className="px-2 py-1 font-sans text-[10px] tracking-[0.18em] uppercase text-white/35">No materials</p>
                                ) : (
                                  filteredMaterialOptions.map((material) => {
                                    const selected = selectedMaterials.includes(material)
                                    return (
                                      <button
                                        key={material}
                                        type="button"
                                        onClick={() =>
                                          setSelectedMaterials((previous) =>
                                            previous.includes(material)
                                              ? previous.filter((value) => value !== material)
                                              : [...previous, material]
                                          )
                                        }
                                        className={`w-full rounded-xl px-3 py-2 text-left font-sans text-[11px] tracking-[0.14em] uppercase border transition-colors ${
                                          selected
                                            ? 'text-white border-white/45 bg-white/10'
                                            : 'text-white/75 border-white/10 hover:border-white/25'
                                        }`}
                                      >
                                        {material}
                                      </button>
                                    )
                                  })
                                )}
                              </div>
                            </div>
                          </details>
                        </div>
                      </div>
                    </div>
                  </div>
                </aside>

                <section className="min-h-0 bg-[linear-gradient(180deg,#171311_0%,#100D0C_100%)]">
                  <div className="flex h-full min-h-0 flex-col">
                    <div className="border-b border-white/[0.08] px-5 py-5 md:px-6 lg:px-8">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                          <span className="font-sans text-[10px] tracking-[0.32em] uppercase text-white/35">
                            Collection Snapshot
                          </span>
                          <h3 className="mt-3 font-serif text-[2rem] leading-none text-white md:text-[2.4rem]">
                            Archive Results
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 font-sans text-[9px] tracking-[0.26em] uppercase text-white/72">
                            {filteredMeta.length} collections
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 font-sans text-[9px] tracking-[0.26em] uppercase text-white/48">
                            {activeFilterCount > 0 ? `${activeFilterCount} active filters` : 'Unfiltered view'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-6 md:py-6 lg:px-8">
                      {loading ? (
                        <div className="flex h-full min-h-[20rem] items-center justify-center">
                          <span className="font-sans text-sm tracking-[0.22em] uppercase text-[#B7AEA9]">Loading...</span>
                        </div>
                      ) : filteredMeta.length === 0 ? (
                        <div className="flex h-full min-h-[20rem] items-center justify-center">
                          <EmptyState
                            title="No collections found"
                            subtitle="Try changing your filters to widen the archive search."
                            ghostText="EMPTY"
                            action={{ label: 'Clear Filters', href: '/archive' }}
                          />
                        </div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: false, amount: 0.1 }}
                          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                          className="space-y-5"
                        >
                          {archiveBands.map((band) => {
                            if (band.type === 'regular') {
                              return (
                                <div key={band.key} className={getRegularBandGridClass(band.items.length)}>
                                  {band.items.map((item) => (
                                    <ArchiveCollectionCard key={item.key} item={item} />
                                  ))}
                                </div>
                              )
                            }

                            const featureCard = <ArchiveCollectionCard item={band.feature} featured />
                            const companionGrid = (
                              <div className="grid grid-cols-2 gap-4 md:gap-5">
                                {band.companions.map((item) => (
                                  <ArchiveCollectionCard key={item.key} item={item} />
                                ))}
                              </div>
                            )

                            return (
                              <div key={band.key} className="space-y-4 md:space-y-5">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 xl:hidden">
                                  <ArchiveCollectionCard item={band.feature} featured />
                                  {band.companions.map((item) => (
                                    <ArchiveCollectionCard key={item.key} item={item} />
                                  ))}
                                </div>
                                <div className="hidden xl:grid xl:grid-cols-[minmax(0,2.05fr)_minmax(0,2fr)] xl:items-start xl:gap-5">
                                  {band.align === 'left' ? (
                                    <>
                                      {featureCard}
                                      {companionGrid}
                                    </>
                                  ) : (
                                    <>
                                      {companionGrid}
                                      {featureCard}
                                    </>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </motion.div>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>

        <div className="snap-start h-screen w-full">
          <Footer />
        </div>
      </div>
    </div>
  )
}
