'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { StickyNavbar, Footer } from '@/app/components'
import { ChevronRight, Play, Pause, ArrowRight } from 'lucide-react'
import { articles as mockArticles } from '@/lib/mockData'

interface EditorialArticle {
  id: string
  slug: string
  title: string
  subtitle: string
  category: string
  author: string
  publishedAt: string
  published_at?: string
  coverImage: string
  cover_image?: string
  coverImageVertical?: string
  cover_image_vertical?: string
  designerSlug?: string
  designer_slug?: string
  designerName?: string
  designer_name?: string
  tags: string[]
  readTime: number
  read_time?: number
  body: string
  credits?: {
    photographer?: string
    stylist?: string
    model?: string
    creativeDirector?: string
    location?: string
    date?: string
    equipment?: string
  }
  relatedLooks?: Array<{
    lookId: string
    lookNumber: number
    image: string
    collectionSlug: string
    collectionName: string
  }>
  status: string
}

const categoryColors: Record<string, string> = {
  features: '#2A2522',
  interviews: '#4A4038',
  news: '#6B5D4D',
  trends: '#8B7A68'
}

const featuredPieces = [
  { id: 1, image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=900&fit=crop', title: 'Geometric Coat', designer: 'Gobi', price: '$2,400', collection: 'FW 2025' },
  { id: 2, image: 'https://images.unsplash.com/photo-1539533057392-a63e26c766c1?w=600&h=800&fit=crop', title: 'Architectural Blazer', designer: 'Goyol', price: '$1,850', collection: 'FW 2025' },
  { id: 3, image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=900&fit=crop', title: 'Embroidery Hoodie', designer: 'Michel&Amazonka', price: '$680', collection: 'SS 2025' },
  { id: 4, image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=900&fit=crop', title: 'Cashmere Knit', designer: 'Gobi', price: '$1,200', collection: 'SS 2025' },
  { id: 5, image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=900&fit=crop', title: 'Volume Puffer', designer: '93 Kidult', price: '$920', collection: 'FW 2025' },
]

const readNextStories = [
  { title: 'The Geometry of the Steppe', category: 'Features', image: 'https://images.unsplash.com/photo-1539533057392-a63e26c766c1?w=800&h=600&fit=crop' },
  { title: 'Street Code: Ulaanbaatar', category: 'Interviews', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=600&fit=crop' },
  { title: 'Mongolia Fashion Week 2025', category: 'News', image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&h=600&fit=crop' },
]

const editorialHeroFallbackImage =
  'https://feiffroacxipvonvmecs.supabase.co/storage/v1/object/sign/videos/images/pexels-ron-lach-7778890.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9kNTdjZGJjYi0wNzRmLTQyMGMtOGJmMS1iY2MyZTI2NzkyODciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MvaW1hZ2VzL3BleGVscy1yb24tbGFjaC03Nzc4ODkwLmpwZyIsImlhdCI6MTc3NTA2MzIwMiwiZXhwIjoxNzc3NjU1MjAyfQ.jk7lYLHUQXygEVLRhhtNTaJpGD0pB5MiSQOuGdpn59U'

const normalizeEditorialArticle = (article: Partial<EditorialArticle> & {
  [key: string]: unknown
}): EditorialArticle => ({
  id: String(article.id || ''),
  slug: String(article.slug || ''),
  title: String(article.title || ''),
  subtitle: String(article.subtitle || ''),
  category: String(article.category || 'features'),
  author: String(article.author || ''),
  publishedAt: String(article.publishedAt || article.published_at || ''),
  published_at: typeof article.published_at === 'string' ? article.published_at : undefined,
  coverImage: String(article.coverImage || article.cover_image || editorialHeroFallbackImage),
  cover_image: typeof article.cover_image === 'string' ? article.cover_image : undefined,
  coverImageVertical: typeof article.coverImageVertical === 'string'
    ? article.coverImageVertical
    : typeof article.cover_image_vertical === 'string'
      ? article.cover_image_vertical
      : undefined,
  cover_image_vertical: typeof article.cover_image_vertical === 'string' ? article.cover_image_vertical : undefined,
  designerSlug: typeof article.designerSlug === 'string'
    ? article.designerSlug
    : typeof article.designer_slug === 'string'
      ? article.designer_slug
      : undefined,
  designer_slug: typeof article.designer_slug === 'string' ? article.designer_slug : undefined,
  designerName: typeof article.designerName === 'string'
    ? article.designerName
    : typeof article.designer_name === 'string'
      ? article.designer_name
      : undefined,
  designer_name: typeof article.designer_name === 'string' ? article.designer_name : undefined,
  tags: Array.isArray(article.tags) ? article.tags.filter((tag): tag is string => typeof tag === 'string') : [],
  readTime: typeof article.readTime === 'number'
    ? article.readTime
    : typeof article.read_time === 'number'
      ? article.read_time
      : 5,
  read_time: typeof article.read_time === 'number' ? article.read_time : undefined,
  body: String(article.body || ''),
  credits: article.credits as EditorialArticle['credits'],
  relatedLooks: article.relatedLooks as EditorialArticle['relatedLooks'],
  status: String(article.status || 'published'),
})

export default function EditorialPage() {
  const [articles, setArticles] = useState<EditorialArticle[]>([])
  const [storageImages, setStorageImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    async function fetchEditorialData() {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const [{ data: articleData, error: articleError }, { data: imageData, error: imageError }] = await Promise.all([
          supabase
            .from('articles')
            .select('*')
            .eq('status', 'published')
            .order('published_at', { ascending: false }),
          supabase
            .storage
            .from('videos')
            .list('images', {
              limit: 100,
              offset: 0,
              sortBy: { column: 'name', order: 'asc' },
            }),
        ])

        if (!imageError && imageData) {
          const urls = imageData
            .filter((file) => (
              file.name !== '.emptyFolderPlaceholder' &&
              /\.(avif|gif|jpe?g|png|webp)$/i.test(file.name)
            ))
            .map((file) => {
              const { data } = supabase.storage.from('videos').getPublicUrl(`images/${file.name}`)
              return data.publicUrl
            })

          setStorageImages(urls)
        }

        if (articleError || !articleData || articleData.length === 0) {
          setArticles(mockArticles.filter((article) => article.status === 'published').map((article) => normalizeEditorialArticle(article as Partial<EditorialArticle> & { [key: string]: unknown })))
        } else {
          setArticles(articleData.map((article) => normalizeEditorialArticle(article as Record<string, unknown>)))
        }
      } catch {
        setArticles(mockArticles.filter((article) => article.status === 'published').map((article) => normalizeEditorialArticle(article as Partial<EditorialArticle> & { [key: string]: unknown })))
      } finally {
        setLoading(false)
      }
    }

    fetchEditorialData()
  }, [])

  useEffect(() => {
    if (!isAutoPlaying || articles.length === 0) return

    const interval = setInterval(() => {
      setCurrentFeatureIndex((previous) => (previous + 1) % articles.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, articles.length])

  const currentFeature = articles[currentFeatureIndex]
  const relatedArticles = articles.slice(0, 3)
  const supportingFeatures = articles.length > 1
    ? [1, 2].map((offset) => articles[(currentFeatureIndex + offset) % articles.length]).filter(Boolean)
    : []
  const getStorageImage = (offset = 0) => {
    if (storageImages.length === 0) return null
    return storageImages[(currentFeatureIndex + offset) % storageImages.length]
  }
  const currentHeroImage = getStorageImage(0) || currentFeature?.coverImage || editorialHeroFallbackImage
  const currentNarrativeImage = getStorageImage(1) || currentFeature?.coverImageVertical || currentFeature?.coverImage || editorialHeroFallbackImage

  if (loading) {
    return (
      <div className="h-screen w-full overflow-hidden bg-[#0A0A0A]">
        <StickyNavbar />
        <div className="flex h-full items-center justify-center">
          <div className="animate-pulse font-sans text-sm tracking-[0.22em] uppercase text-[#B7AEA9]">
            Loading...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-[#0A0A0A]">
      <StickyNavbar />

      <main className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth snap-container pt-[72px] md:pt-[88px]">
        <section className="snap-start relative h-screen w-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={`hero-image-${currentFeature?.id || currentFeatureIndex}`}
              initial={{ opacity: 0, scale: 1.08, filter: 'blur(18px)', clipPath: 'inset(8% 10% round 36px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', clipPath: 'inset(0% 0% round 0px)' }}
              exit={{ opacity: 0, scale: 0.96, filter: 'blur(14px)', clipPath: 'inset(6% 8% round 28px)' }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={currentHeroImage}
                alt={currentFeature?.title || 'Editorial'}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/80 via-transparent to-transparent" />
            </motion.div>
          </AnimatePresence>

          <div className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay">
            <div className="h-full w-full animate-pulse bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjUiLz48L3N2Zz4=')]" />
          </div>

          <div className="relative z-10 flex h-full items-end justify-center pb-16 md:pb-24">
            <div className="mx-auto w-full max-w-[95rem] px-6 md:px-10">
              <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
                <div className="lg:col-span-8">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`hero-copy-${currentFeature?.id || currentFeatureIndex}`}
                      initial={{ opacity: 0, y: 26 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -18 }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="mb-6 flex items-center gap-3">
                        <span
                          className="font-sans text-[10px] tracking-[0.25em] uppercase px-3 py-1.5"
                          style={{ backgroundColor: categoryColors[currentFeature?.category || 'features'], color: '#F5F2ED' }}
                        >
                          {currentFeature?.category || 'Feature'}
                        </span>
                        <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-white/50">
                          {currentFeature?.readTime} min read
                        </span>
                      </div>

                      <h1 className="mb-6 font-serif text-5xl leading-[0.95] text-white md:text-6xl lg:text-7xl xl:text-8xl">
                        {currentFeature?.title || 'The Quiet Revolution'}
                      </h1>

                      <p className="max-w-2xl font-sans text-lg leading-relaxed text-white/70 md:text-xl">
                        {currentFeature?.subtitle || 'How Mongolian designers are transforming the narrative of Asian fashion'}
                      </p>

                      <div className="mt-8 flex items-center gap-4">
                        <div className="flex items-center gap-2 font-sans text-[11px] tracking-[0.18em] uppercase text-white/60">
                          <span>By {currentFeature?.author || 'Editorial Staff'}</span>
                          <span className="h-1 w-1 rounded-full bg-white/40" />
                          <span>{currentFeature?.publishedAt || 'March 2026'}</span>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="lg:col-span-4 lg:text-right">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="mb-6 flex items-center gap-3 lg:justify-end"
                  >
                    <button
                      onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                      className="text-white/60 transition-colors hover:text-white"
                    >
                      {isAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                    <div className="flex gap-2">
                      {articles.slice(0, 5).map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setCurrentFeatureIndex(idx)
                            setIsAutoPlaying(false)
                          }}
                          className={`h-0.5 w-8 transition-all duration-300 ${
                            currentFeatureIndex === idx ? 'bg-white' : 'bg-white/30 hover:bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </motion.div>

                  {currentFeature && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.7 }}
                    >
                      <Link href={`/editorial/${currentFeature.slug}`} className="inline-flex items-center gap-3 group">
                        <span className="font-sans text-[11px] tracking-[0.22em] uppercase text-white/80 transition-colors group-hover:text-white">
                          Read Story
                        </span>
                        <ArrowRight className="h-4 w-4 text-white/60 transition-all group-hover:translate-x-1 group-hover:text-white" />
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="snap-start relative h-screen w-full overflow-hidden bg-[#0A0A0A]">
          <div className="grid h-full grid-cols-1 lg:grid-cols-12">
            <div className="relative min-h-[44vh] overflow-hidden lg:col-span-7 lg:min-h-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`narrative-image-${currentFeature?.id || currentFeatureIndex}`}
                  initial={{ opacity: 0, scale: 1.05, filter: 'blur(16px)', clipPath: 'inset(6% 8% round 28px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', clipPath: 'inset(0% 0% round 0px)' }}
                  exit={{ opacity: 0, scale: 0.97, filter: 'blur(12px)', clipPath: 'inset(4% 5% round 20px)' }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  <Image
                    src={currentNarrativeImage}
                    alt={currentFeature?.title || 'Editorial Feature'}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/70 via-[#0A0A0A]/10 to-transparent" />
                </motion.div>
              </AnimatePresence>
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-10">
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="max-w-xl"
                >
                  <p className="mb-3 font-sans text-[10px] tracking-[0.3em] uppercase text-white/45">
                    Narrative Frame
                  </p>
                  <div className="border-t border-white/20 pt-4">
                    <p className="mb-2 font-sans text-[10px] tracking-[0.2em] uppercase text-white/50">Credits</p>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 font-sans text-[11px] tracking-[0.08em] text-white/70">
                      <span>Photo: Batbayar</span>
                      <span>Stylist: Nomin</span>
                      <span>Model: Anu</span>
                      <span>Creative Dir: Bold</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            <div className="flex min-h-0 flex-col justify-between bg-[linear-gradient(180deg,#12100E_0%,#0A0A0A_100%)] px-6 py-8 md:px-10 md:py-12 lg:col-span-5 lg:px-12 lg:py-14">
              <div className="max-w-xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`narrative-copy-${currentFeature?.id || currentFeatureIndex}`}
                    initial={{ opacity: 0, y: 26 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span className="mb-6 block font-sans text-[10px] tracking-[0.3em] uppercase text-[#B7AEA9]">
                      In Focus
                    </span>

                    <h2 className="mb-8 font-serif text-3xl leading-[1.1] text-white md:text-4xl lg:text-5xl">
                      {currentFeature?.title || 'The Architecture of the Steppe'}
                    </h2>

                    <p className="mb-8 font-inter text-lg leading-relaxed text-white/60">
                      {currentFeature?.subtitle || 'Exploring the geometric foundations of Mongolian design where the vastness of the landscape meets the precision of contemporary craft.'}
                    </p>

                    <Link href={currentFeature ? `/editorial/${currentFeature.slug}` : '/editorial'} className="inline-flex items-center gap-3 group border-b border-white/20 pb-1">
                      <span className="font-sans text-[11px] tracking-[0.22em] uppercase text-white/70 transition-colors group-hover:text-white">
                        View Full Story
                      </span>
                      <ArrowRight className="h-4 w-4 text-white/50 transition-all group-hover:translate-x-1 group-hover:text-white" />
                    </Link>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 lg:pt-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`supporting-features-${currentFeature?.id || currentFeatureIndex}`}
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -18 }}
                    transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                    className="grid grid-cols-2 gap-4"
                  >
                    {supportingFeatures.map((article, idx) => (
                      <div key={article.id} className="relative aspect-[3/4] overflow-hidden rounded-sm">
                        <Image
                          src={article.coverImageVertical || article.coverImage || editorialHeroFallbackImage}
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-700 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/20" />
                        <span className="absolute bottom-3 left-3 font-sans text-[9px] tracking-[0.2em] uppercase text-white/70">
                          {idx === 0 ? 'Next Up' : 'Also Read'}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        <section className="snap-start relative flex h-screen w-full items-center justify-center overflow-hidden border-t border-white/[0.06] bg-[#0A0A0A] px-6 md:px-10">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(184,160,136,0.16),transparent_65%)]" />
          </div>
          <div className="relative max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              <span className="font-serif text-6xl leading-none text-[#B7AEA9]/40 md:text-8xl">"</span>
              <blockquote className="-mt-8 mb-8 font-serif text-2xl leading-[1.3] text-white md:text-3xl lg:text-4xl">
                We&apos;re not just making clothes. We&apos;re preserving a way of life. Every sweater carries the memory of the herd.
              </blockquote>
              <cite className="font-sans text-[11px] tracking-[0.25em] uppercase text-[#B7AEA9]/70 not-italic">
                Tsetseg, Cashmere Grader
              </cite>
            </motion.div>
          </div>
        </section>

        <section className="snap-start relative h-screen w-full overflow-hidden border-t border-white/[0.06] bg-[#0A0A0A] px-6 pb-10 pt-[108px] md:px-10 md:pb-12 md:pt-[132px]">
          <div className="mx-auto flex h-full min-h-0 w-full max-w-[95rem] flex-col">
            <div className="mb-8 flex items-end justify-between md:mb-10">
              <div>
                <span className="mb-4 block font-sans text-[10px] tracking-[0.3em] uppercase text-[#B7AEA9]">
                  Shop The Look
                </span>
                <h2 className="font-serif text-3xl leading-[1.1] text-white md:text-4xl lg:text-5xl">
                  Featured Pieces
                </h2>
              </div>
              <Link href="/archive" className="hidden items-center gap-2 group md:inline-flex">
                <span className="font-sans text-[11px] tracking-[0.22em] uppercase text-white/60 transition-colors group-hover:text-white">
                  View All
                </span>
                <ChevronRight className="h-4 w-4 text-white/40 transition-colors group-hover:text-white" />
              </Link>
            </div>

            <div className="flex-1 overflow-hidden">
              <div className="scrollbar-hide -mx-6 flex h-full gap-5 overflow-x-auto overflow-y-hidden px-6 pb-3 md:mx-0 md:px-0">
                {featuredPieces.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                    className="flex h-full w-[240px] shrink-0 flex-col md:w-[280px] xl:w-[300px]"
                  >
                    <Link href="/archive" className="group flex h-full flex-col">
                      <div className="relative mb-4 min-h-0 flex-1 overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                        <div className="absolute bottom-4 left-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
                          <button className="w-full bg-white/90 py-3 font-sans text-[10px] tracking-[0.2em] uppercase text-[#0A0A0A] transition-colors hover:bg-white">
                            View in Archive
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-white/40">
                          {item.collection}
                        </p>
                        <h3 className="font-serif text-lg leading-tight text-white transition-colors group-hover:text-white/80">
                          {item.title}
                        </h3>
                        <p className="font-sans text-[11px] tracking-[0.1em] text-white/60">
                          {item.designer} — {item.price}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-8 text-center md:hidden">
              <Link href="/archive" className="inline-flex items-center gap-2 group">
                <span className="font-sans text-[11px] tracking-[0.22em] uppercase text-white/60 transition-colors group-hover:text-white">
                  View All
                </span>
                <ChevronRight className="h-4 w-4 text-white/40 transition-colors group-hover:text-white" />
              </Link>
            </div>
          </div>
        </section>

        <section className="snap-start relative h-screen w-full overflow-hidden border-t border-white/[0.06] bg-[#0F0D0B] px-6 pb-10 pt-[108px] md:px-10 md:pb-12 md:pt-[132px]">
          <div className="mx-auto flex h-full min-h-0 w-full max-w-[95rem] flex-col">
            <div className="mb-8 flex items-end justify-between md:mb-10">
              <div>
                <span className="mb-4 block font-sans text-[10px] tracking-[0.3em] uppercase text-[#B7AEA9]">
                  Latest Stories
                </span>
                <h2 className="font-serif text-3xl leading-[1.1] text-white md:text-4xl lg:text-5xl">
                  Editorial
                </h2>
              </div>
              <Link href="/editorial" className="hidden items-center gap-2 group md:inline-flex">
                <span className="font-sans text-[11px] tracking-[0.22em] uppercase text-white/60 transition-colors group-hover:text-white">
                  View All
                </span>
                <ChevronRight className="h-4 w-4 text-white/40 transition-colors group-hover:text-white" />
              </Link>
            </div>

            <div className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {relatedArticles.map((article, idx) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="min-h-0"
                >
                  <Link href={`/editorial/${article.slug}`} className="group flex h-full flex-col">
                    <div className="relative mb-5 aspect-[3/2] overflow-hidden">
                      <Image
                        src={article.coverImage}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/60 via-transparent to-transparent" />
                      <div className="absolute left-4 top-4">
                        <span
                          className="px-2 py-1 font-sans text-[9px] tracking-[0.2em] uppercase"
                          style={{ backgroundColor: categoryColors[article.category], color: '#F5F2ED' }}
                        >
                          {article.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col space-y-3">
                      <div className="flex items-center gap-3 font-sans text-[10px] tracking-[0.15em] uppercase text-white/40">
                        <span>{article.author}</span>
                        <span className="h-1 w-1 rounded-full bg-white/30" />
                        <span>{article.readTime} min</span>
                      </div>
                      <h3 className="font-serif text-xl leading-[1.2] text-white transition-colors group-hover:text-white/80 md:text-2xl">
                        {article.title}
                      </h3>
                      <p className="line-clamp-3 font-inter text-sm leading-relaxed text-white/50">
                        {article.subtitle}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 text-center md:hidden">
              <Link href="/editorial" className="inline-flex items-center gap-2 group">
                <span className="font-sans text-[11px] tracking-[0.22em] uppercase text-white/60 transition-colors group-hover:text-white">
                  View All Stories
                </span>
                <ChevronRight className="h-4 w-4 text-white/40 transition-colors group-hover:text-white" />
              </Link>
            </div>
          </div>
        </section>

        <section className="snap-start relative h-screen w-full overflow-hidden border-t border-white/[0.06] bg-[#0A0A0A] px-6 pb-10 pt-[108px] md:px-10 md:pb-12 md:pt-[132px]">
          <div className="mx-auto flex h-full min-h-0 w-full max-w-[95rem] flex-col">
            <div className="mb-8 text-center md:mb-10">
              <span className="mb-4 block font-sans text-[10px] tracking-[0.3em] uppercase text-[#B7AEA9]">
                Continue Reading
              </span>
              <h2 className="font-serif text-3xl leading-[1.1] text-white md:text-4xl">
                Read Next
              </h2>
            </div>

            <div className="grid flex-1 grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
              {readNextStories.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="min-h-0"
                >
                  <Link href="/editorial" className="group relative block h-full overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/30 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      <span className="mb-2 font-sans text-[9px] tracking-[0.25em] uppercase text-white/50">
                        {item.category}
                      </span>
                      <h3 className="font-serif text-xl leading-tight text-white underline-offset-4 decoration-white/30 group-hover:underline">
                        {item.title}
                      </h3>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <div className="snap-start h-screen w-full">
          <Footer />
        </div>
      </main>
    </div>
  )
}
