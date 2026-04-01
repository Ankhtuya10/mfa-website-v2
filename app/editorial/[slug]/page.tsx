'use client'

import { use, useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Footer, StickyNavbar } from '@/app/components'
import { BookmarkButton } from '@/app/components/shared/BookmarkButton'
import { articles as mockArticles, designers as mockDesigners } from '@/lib/mockData'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, X, ArrowRight } from 'lucide-react'

interface Article {
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

const articleFallbackImage = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=1600&fit=crop'

const normalizeArticle = (article: Partial<Article> & { [key: string]: unknown }): Article => ({
  id: String(article.id || ''),
  slug: String(article.slug || ''),
  title: String(article.title || ''),
  subtitle: String(article.subtitle || ''),
  category: String(article.category || 'features'),
  author: String(article.author || ''),
  publishedAt: String(article.publishedAt || article.published_at || ''),
  published_at: typeof article.published_at === 'string' ? article.published_at : undefined,
  coverImage: String(article.coverImage || article.cover_image || articleFallbackImage),
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
  tags: Array.isArray(article.tags) ? article.tags.filter((tag): tag is string => typeof tag === 'string') : [],
  readTime: typeof article.readTime === 'number'
    ? article.readTime
    : typeof article.read_time === 'number'
      ? article.read_time
      : 5,
  read_time: typeof article.read_time === 'number' ? article.read_time : undefined,
  body: String(article.body || ''),
  credits: article.credits as Article['credits'],
  relatedLooks: article.relatedLooks as Article['relatedLooks'],
  status: String(article.status || 'published'),
})

export default function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [article, setArticle] = useState<Article | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([])
  const [designer, setDesigner] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentLookIndex, setCurrentLookIndex] = useState(0)

  useEffect(() => {
    async function fetchData() {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()

        const [articleRes, relatedRes] = await Promise.all([
          supabase.from('articles').select('*').eq('slug', slug).eq('status', 'published').single(),
          supabase.from('articles').select('*').eq('status', 'published').neq('slug', slug).limit(3),
        ])

        if (articleRes.data) {
          const normalizedArticle = normalizeArticle(articleRes.data as Record<string, unknown>)
          setArticle(normalizedArticle)

          const resolvedDesignerSlug = normalizedArticle.designerSlug || normalizedArticle.designer_slug
          if (resolvedDesignerSlug) {
            const designerRes = await supabase.from('designers').select('*').eq('slug', resolvedDesignerSlug).single()
            if (designerRes.data) setDesigner(designerRes.data)
          }
        } else {
          const fallback = mockArticles.find((item) => item.slug === slug) || mockArticles[0]
          setArticle(normalizeArticle(fallback as Partial<Article> & { [key: string]: unknown }))
          const ds = mockDesigners.find((item) => item.slug === fallback?.designerSlug)
          setDesigner(ds)
        }

        if (relatedRes.data && relatedRes.data.length > 0) {
          setRelatedArticles(relatedRes.data.map((item) => normalizeArticle(item as Record<string, unknown>)))
        } else {
          setRelatedArticles(
            mockArticles
              .filter((item) => item.slug !== slug)
              .slice(0, 3)
              .map((item) => normalizeArticle(item as Partial<Article> & { [key: string]: unknown }))
          )
        }
      } catch {
        const fallback = mockArticles.find((item) => item.slug === slug) || mockArticles[0]
        setArticle(normalizeArticle(fallback as Partial<Article> & { [key: string]: unknown }))
        setRelatedArticles(
          mockArticles
            .filter((item) => item.slug !== slug)
            .slice(0, 3)
            .map((item) => normalizeArticle(item as Partial<Article> & { [key: string]: unknown }))
        )
        const ds = mockDesigners.find((item) => item.slug === fallback?.designerSlug)
        setDesigner(ds)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug])

  const featuredLooks = article?.relatedLooks || [
    { lookId: 'l1', lookNumber: 1, image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=900&fit=crop', collectionSlug: 'gobi-fw2025', collectionName: 'Gobi FW 2025' },
    { lookId: 'l2', lookNumber: 2, image: 'https://images.unsplash.com/photo-1539533057392-a63e26c766c1?w=600&h=900&fit=crop', collectionSlug: 'goyol-fw2025', collectionName: 'Goyol FW 2025' },
    { lookId: 'l3', lookNumber: 3, image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=900&fit=crop', collectionSlug: 'michel-amazonka-ss2025', collectionName: 'Michel&Amazonka SS 2025' },
  ]

  const openLightbox = (index: number) => {
    setCurrentLookIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => setLightboxOpen(false)
  const nextLook = () => setCurrentLookIndex((previous) => (previous + 1) % featuredLooks.length)
  const prevLook = () => setCurrentLookIndex((previous) => (previous - 1 + featuredLooks.length) % featuredLooks.length)

  if (loading) {
    return (
      <div className="h-screen w-full overflow-hidden bg-[#0A0A0A]">
        <StickyNavbar />
        <main className="flex h-full items-center justify-center">
          <span className="font-sans text-sm tracking-[0.22em] uppercase text-[#B7AEA9]">Loading...</span>
        </main>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <h1 className="font-serif text-4xl text-white">Article not found</h1>
      </div>
    )
  }

  const formattedDate = new Date(article.publishedAt || article.published_at || '2026-03-15').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  const articleParagraphs = (article.body || '').split('\n\n').filter(Boolean)
  const pullQuote = articleParagraphs[0]?.slice(0, 140) || 'Woven from the finest inner fleece of Mongolian goats, each piece carries the silence of the steppe.'

  return (
    <div className="h-screen w-full overflow-hidden bg-[#0A0A0A]">
      <StickyNavbar />

      <main className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth snap-container pt-[72px] md:pt-[88px]">
        <section className="snap-start relative h-screen w-full overflow-hidden">
          <Image
            src={article.coverImageVertical || article.coverImage || articleFallbackImage}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/35 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/78 via-[#0A0A0A]/10 to-transparent" />

          <div className="pointer-events-none absolute inset-0 opacity-[0.025] mix-blend-overlay">
            <div className="h-full w-full animate-pulse bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjUiLz48L3N2Zz4=')]" />
          </div>

          <div className="absolute inset-x-0 bottom-0 flex items-end justify-center pb-16 md:pb-24">
            <div className="mx-auto w-full max-w-[95rem] px-6 md:px-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12"
              >
                <div className="lg:col-span-8">
                  <div className="mb-4 flex items-center gap-3">
                    <span
                      className="px-3 py-1.5 font-sans text-[10px] tracking-[0.25em] uppercase"
                      style={{ backgroundColor: categoryColors[article.category] || '#2A2522', color: '#F5F2ED' }}
                    >
                      {article.category}
                    </span>
                    <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-white/50">
                      {article.readTime} min read
                    </span>
                  </div>

                  <h1 className="mb-6 max-w-5xl font-serif text-5xl leading-[0.95] text-white md:text-6xl lg:text-7xl">
                    {article.title}
                  </h1>

                  <p className="max-w-2xl font-inter text-lg leading-relaxed text-white/72 md:text-xl">
                    {article.subtitle}
                  </p>

                  <div className="mt-8 flex items-center gap-4">
                    <div className="flex items-center gap-2 font-sans text-[11px] tracking-[0.18em] uppercase text-white/60">
                      <span>By {article.author}</span>
                      <span className="h-1 w-1 rounded-full bg-white/40" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 lg:text-right">
                  <BookmarkButton id={article.id} type="article" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="snap-start relative h-screen w-full overflow-hidden bg-[#0A0A0A]">
          <div className="grid h-full grid-cols-1 lg:grid-cols-12">
            <div className="relative min-h-[45vh] overflow-hidden lg:col-span-6 lg:min-h-0">
              <Image
                src={article.coverImage || article.coverImageVertical || articleFallbackImage}
                alt={article.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/78 via-[#0A0A0A]/12 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-10">
                <div className="max-w-xl border-t border-white/20 pt-4">
                  <p className="mb-2 font-sans text-[10px] tracking-[0.2em] uppercase text-white/50">Credits</p>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 font-sans text-[11px] tracking-[0.08em] text-white/72">
                    <span>Photo: {article.credits?.photographer || 'Batbayar'}</span>
                    <span>Stylist: {article.credits?.stylist || 'Nomin'}</span>
                    <span>Model: {article.credits?.model || 'Anu'}</span>
                    <span>Creative Dir: {article.credits?.creativeDirector || 'Bold'}</span>
                    <span>Location: {article.credits?.location || 'Ulaanbaatar'}</span>
                    <span>Equipment: {article.credits?.equipment || '35mm Film'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex min-h-0 flex-col justify-center bg-[linear-gradient(180deg,#12100E_0%,#0A0A0A_100%)] px-6 py-10 md:px-10 md:py-12 lg:col-span-6 lg:px-14">
              <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
                <span className="mb-6 block font-sans text-[10px] tracking-[0.3em] uppercase text-[#B7AEA9]">
                  Narrative Entry
                </span>
                <h2 className="mb-8 font-serif text-3xl leading-[1.08] text-white md:text-4xl lg:text-5xl">
                  {article.title}
                </h2>
                <p className="mb-10 font-inter text-lg leading-relaxed text-white/60 md:text-xl">
                  {article.subtitle}
                </p>
                <div className="grid w-full grid-cols-2 gap-3 md:grid-cols-4">
                  {article.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-3 text-center font-sans text-[10px] tracking-[0.22em] uppercase text-white/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="snap-start relative flex h-screen w-full items-center justify-center overflow-hidden border-t border-b border-white/[0.06] bg-[#0A0A0A] px-6 md:px-10">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(184,160,136,0.16),transparent_65%)]" />
          </div>
          <div className="relative mx-auto max-w-4xl text-center">
            <span className="font-serif text-7xl leading-none text-white/20 md:text-9xl">"</span>
            <blockquote className="-mt-10 mb-8 font-serif text-2xl leading-[1.3] text-white md:text-3xl lg:text-4xl">
              {pullQuote}...
            </blockquote>
            <cite className="font-sans text-[11px] tracking-[0.25em] uppercase text-[#B7AEA9]/70 not-italic">
              {article.author}
            </cite>
          </div>
        </section>

        <section className="snap-start relative h-screen w-full overflow-hidden border-t border-white/[0.06] bg-[#0A0A0A] px-6 pb-10 pt-[108px] md:px-10 md:pb-12 md:pt-[132px]">
          <div className="mx-auto flex h-full min-h-0 w-full max-w-[95rem] flex-col">
            <div className="mb-8 text-center md:mb-10">
              <span className="mb-4 block font-sans text-[10px] tracking-[0.3em] uppercase text-[#B7AEA9]">
                The Story
              </span>
              <h2 className="font-serif text-3xl leading-[1.1] text-white md:text-4xl">
                Editorial Text
              </h2>
            </div>

            <div className="mx-auto w-full max-w-4xl flex-1 overflow-y-auto pr-1">
              <div className="space-y-8 text-center md:text-left">
                {articleParagraphs.map((paragraph, idx) => (
                  <p key={idx} className="font-inter text-base leading-[1.9] text-white/64 md:text-lg">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="snap-start relative h-screen w-full overflow-hidden border-t border-white/[0.06] bg-[#0A0A0A] px-6 pb-10 pt-[108px] md:px-10 md:pb-12 md:pt-[132px]">
          <div className="mx-auto flex h-full min-h-0 w-full max-w-[95rem] flex-col">
            <div className="mb-8 flex items-end justify-between md:mb-10">
              <div>
                <span className="mb-4 block font-sans text-[10px] tracking-[0.3em] uppercase text-[#B7AEA9]">
                  Shop The Look
                </span>
                <h2 className="font-serif text-3xl leading-[1.1] text-white md:text-4xl">
                  Featured Pieces
                </h2>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <div className="scrollbar-hide -mx-6 flex h-full gap-5 overflow-x-auto overflow-y-hidden px-6 pb-3 md:mx-0 md:px-0">
                {featuredLooks.map((look, idx) => (
                  <motion.div
                    key={look.lookId}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6, delay: idx * 0.08 }}
                    className="flex h-full w-[260px] shrink-0 flex-col md:w-[300px]"
                  >
                    <div className="group flex h-full cursor-pointer flex-col" onClick={() => openLightbox(idx)}>
                      <div className="relative mb-4 min-h-0 flex-1 overflow-hidden">
                        <Image
                          src={look.image}
                          alt={`Look ${look.lookNumber}`}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                        <div className="absolute left-4 top-4">
                          <span className="bg-white/90 px-2 py-1 font-sans text-[9px] tracking-[0.2em] uppercase text-[#0A0A0A]">
                            Look {look.lookNumber}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-white/40">
                          {look.collectionName}
                        </p>
                        <h3 className="font-serif text-lg leading-tight text-white transition-colors group-hover:text-white/80">
                          Look {look.lookNumber}
                        </h3>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link href="/archive" className="inline-flex items-center gap-2 group">
                <span className="font-sans text-[11px] tracking-[0.22em] uppercase text-white/60 transition-colors group-hover:text-white">
                  View All in Archive
                </span>
                <ArrowRight className="h-4 w-4 text-white/40 transition-all group-hover:translate-x-1 group-hover:text-white" />
              </Link>
            </div>
          </div>
        </section>

        {designer && (
          <section className="snap-start relative h-screen w-full overflow-hidden border-t border-white/[0.06] bg-[#0F0D0B]">
            <div className="grid h-full grid-cols-1 lg:grid-cols-12">
              <div className="relative min-h-[42vh] overflow-hidden lg:col-span-5 lg:min-h-0">
                <Image
                  src={designer.coverImage || designer.cover_image || articleFallbackImage}
                  alt={designer.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F0D0B]/70 via-transparent to-transparent" />
              </div>

              <div className="flex min-h-0 items-center justify-center px-6 py-10 md:px-10 md:py-12 lg:col-span-7 lg:px-14">
                <div className="mx-auto max-w-2xl text-center lg:text-left">
                  <span className="mb-6 block font-sans text-[10px] tracking-[0.3em] uppercase text-[#B7AEA9]">
                    Featured Designer
                  </span>
                  <Link href={`/designers/${designer.slug}`} className="group block">
                    <h2 className="mb-5 font-serif text-3xl leading-[1.08] text-white transition-colors group-hover:text-white/80 md:text-4xl lg:text-5xl">
                      {designer.name}
                    </h2>
                    <p className="mb-6 font-inter text-lg leading-relaxed text-white/54">
                      {designer.shortBio || designer.short_bio || designer.bio?.slice(0, 200)}
                    </p>
                    <div className="inline-flex items-center gap-2">
                      <span className="font-sans text-[11px] tracking-[0.22em] uppercase text-white/60 transition-colors group-hover:text-white">
                        View Designer Profile
                      </span>
                      <ArrowRight className="h-4 w-4 text-white/40 transition-all group-hover:translate-x-1 group-hover:text-white" />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

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
              {relatedArticles.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="min-h-0"
                >
                  <Link href={`/editorial/${item.slug}`} className="group relative block h-full overflow-hidden">
                    <Image
                      src={item.coverImage || item.cover_image || articleFallbackImage}
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

      <AnimatePresence>
        {lightboxOpen && featuredLooks[currentLookIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          >
            <button
              onClick={closeLightbox}
              className="absolute right-6 top-6 z-10 p-3 text-white transition-colors hover:bg-white/10"
            >
              <X className="h-8 w-8" />
            </button>

            <button
              onClick={prevLook}
              className="absolute left-6 p-3 text-white transition-colors hover:bg-white/10"
            >
              <ChevronLeft className="h-10 w-10" />
            </button>

            <button
              onClick={nextLook}
              className="absolute right-6 p-3 text-white transition-colors hover:bg-white/10"
            >
              <ChevronRight className="h-10 w-10" />
            </button>

            <div className="mx-8 flex w-full max-w-6xl items-center gap-8">
              <div className="relative flex-1">
                <Image
                  src={featuredLooks[currentLookIndex].image}
                  alt={`Look ${featuredLooks[currentLookIndex].lookNumber}`}
                  width={800}
                  height={1200}
                  className="mx-auto max-h-[80vh] object-contain"
                />
              </div>

              <div className="max-h-[80vh] w-72 overflow-y-auto bg-[#1a1a1a] p-6 text-white">
                <span className="font-sans text-[10px] tracking-[2px] uppercase text-[#B7AEA9]">
                  Look {featuredLooks[currentLookIndex].lookNumber}
                </span>
                <h3 className="mt-2 mb-4 font-serif text-xl">{featuredLooks[currentLookIndex].collectionName}</h3>

                <Link
                  href={`/archive/${featuredLooks[currentLookIndex].collectionSlug}`}
                  className="mt-4 inline-flex items-center gap-2 text-white/60 transition-colors hover:text-white"
                >
                  <span className="font-sans text-[10px] tracking-[2px] uppercase">
                    View Collection
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <div className="mt-6">
                  <BookmarkButton id={featuredLooks[currentLookIndex].lookId} type="look" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
