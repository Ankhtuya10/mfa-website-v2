'use client'

import { use, useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Footer, StickyNavbar } from '@/app/components'
import { BookmarkButton } from '@/app/components/shared/BookmarkButton'
import { articles as mockArticles, designers as mockDesigners, collections as mockCollections } from '@/lib/mockData'
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
          setArticle(articleRes.data as Article)
          if (articleRes.data.designer_slug) {
            const designerRes = await supabase.from('designers').select('*').eq('slug', articleRes.data.designer_slug).single()
            if (designerRes.data) setDesigner(designerRes.data)
          }
        } else {
          const fallback = mockArticles.find(a => a.slug === slug)
          setArticle(fallback as Article || mockArticles[0] as Article)
          const ds = mockDesigners.find(d => d.slug === fallback?.designerSlug)
          setDesigner(ds)
        }

        if (relatedRes.data && relatedRes.data.length > 0) {
          setRelatedArticles(relatedRes.data as Article[])
        } else {
          setRelatedArticles(mockArticles.filter(a => a.slug !== slug).slice(0, 3) as Article[])
        }
      } catch {
        const fallback = mockArticles.find(a => a.slug === slug) || mockArticles[0]
        setArticle(fallback as Article)
        setRelatedArticles(mockArticles.filter(a => a.slug !== slug).slice(0, 3) as Article[])
        const ds = mockDesigners.find(d => d.slug === fallback?.designerSlug)
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

  const nextLook = () => {
    setCurrentLookIndex((prev) => (prev + 1) % featuredLooks.length)
  }

  const prevLook = () => {
    setCurrentLookIndex((prev) => (prev - 1 + featuredLooks.length) % featuredLooks.length)
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen justify-between bg-[#0A0A0A]">
        <StickyNavbar />
        <main className="flex-grow flex items-center justify-center">
          <span className="font-sans text-sm tracking-[0.22em] uppercase text-[#B7AEA9]">Loading...</span>
        </main>
        <Footer />
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

  const formattedDate = new Date(article.publishedAt || article.published_at || '2026-03-15').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A]">
      <StickyNavbar />

      <main>
        {/* Hero - Full Bleed */}
        <section className="relative w-full h-screen overflow-hidden">
          <Image
            src={article.coverImageVertical || article.coverImage || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1080&h=1920&fit=crop'}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/30 to-transparent" />
          
          {/* Film grain overlay */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.025] mix-blend-overlay">
            <div className="h-full w-full animate-pulse bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjUiLz48L3N2Zz4=')]" />
          </div>

          <div className="absolute inset-x-0 bottom-0 flex items-end justify-center pb-16 md:pb-24">
            <div className="w-full max-w-[95rem] mx-auto px-6 md:px-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end"
              >
                <div className="lg:col-span-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className="font-sans text-[10px] tracking-[0.25em] uppercase px-3 py-1.5"
                      style={{ backgroundColor: categoryColors[article.category] || '#2A2522', color: '#F5F2ED' }}
                    >
                      {article.category}
                    </span>
                    <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-white/50">
                      {article.readTime} min read
                    </span>
                  </div>
                  
                  <h1 className="font-serif text-white text-5xl md:text-6xl lg:text-7xl leading-[0.95] mb-6">
                    {article.title}
                  </h1>
                  
                  <p className="font-inter text-white/70 text-lg md:text-xl max-w-2xl leading-relaxed">
                    {article.subtitle}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-8">
                    <div className="flex items-center gap-2 text-white/60 font-sans text-[11px] tracking-[0.18em] uppercase">
                      <span>By {article.author}</span>
                      <span className="w-1 h-1 rounded-full bg-white/40" />
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

        {/* Credits Section */}
        <section className="relative w-full bg-[#0A0A0A] py-12 border-b border-white/[0.06]">
          <div className="max-w-[95rem] mx-auto px-6 md:px-10">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[
                { label: 'Photographer', value: article.credits?.photographer || 'Batbayar' },
                { label: 'Stylist', value: article.credits?.stylist || 'Nomin' },
                { label: 'Model', value: article.credits?.model || 'Anu' },
                { label: 'Creative Director', value: article.credits?.creativeDirector || 'Bold' },
                { label: 'Location', value: article.credits?.location || 'Ulaanbaatar' },
                { label: 'Equipment', value: article.credits?.equipment || '35mm Film' },
              ].map((credit, idx) => (
                <div key={idx}>
                  <p className="font-sans text-[9px] tracking-[0.25em] uppercase text-white/40 mb-1">
                    {credit.label}
                  </p>
                  <p className="font-sans text-[11px] tracking-[0.08em] text-white/70">
                    {credit.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Article Body - Narrative */}
        <section className="relative w-full bg-[#0A0A0A] py-20 md:py-28">
          <div className="max-w-3xl mx-auto px-6 md:px-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8 }}
              className="prose prose-lg prose-invert"
            >
              <p className="font-inter text-white/70 text-xl md:text-2xl leading-relaxed mb-12 text-center font-light">
                {article.subtitle}
              </p>
              
              <div className="space-y-8">
                {(article.body || '').split('\n\n').map((paragraph: string, idx: number) => (
                  <p key={idx} className="font-inter text-white/60 text-base md:text-lg leading-[1.85]">
                    {paragraph}
                  </p>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pull Quote */}
        <section className="relative w-full bg-[#0A0A0A] py-20 border-t border-b border-white/[0.06]">
          <div className="max-w-4xl mx-auto px-6 md:px-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <span className="font-serif text-white/20 text-7xl md:text-9xl leading-none">"</span>
              <blockquote className="font-serif text-white text-2xl md:text-3xl lg:text-4xl leading-[1.3] -mt-10 mb-8">
                {article.body?.split('\n')[0]?.slice(0, 120) || "Woven from the finest inner fleece of Mongolian goats, each piece carries the silence of the steppe."}...
              </blockquote>
              <cite className="font-sans text-[11px] tracking-[0.25em] uppercase text-[#B7AEA9]/70 not-italic">
                — {article.author}
              </cite>
            </motion.div>
          </div>
        </section>

        {/* Shop The Look - Carousel */}
        <section className="relative w-full bg-[#0A0A0A] py-20 md:py-28 border-t border-white/[0.06]">
          <div className="max-w-[95rem] mx-auto px-6 md:px-10">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-[#B7AEA9] block mb-4">
                  Shop The Look
                </span>
                <h2 className="font-serif text-white text-3xl md:text-4xl leading-[1.1]">
                  Featured Pieces
                </h2>
              </div>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
              {featuredLooks.map((look, idx) => (
                <motion.div
                  key={look.lookId}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="flex-shrink-0 w-[280px] md:w-[320px]"
                >
                  <div 
                    className="group cursor-pointer"
                    onClick={() => openLightbox(idx)}
                  >
                    <div className="relative aspect-[2/3] overflow-hidden mb-4">
                      <Image
                        src={look.image}
                        alt={`Look ${look.lookNumber}`}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      
                      <div className="absolute top-4 left-4">
                        <span className="font-sans text-[9px] tracking-[0.2em] uppercase px-2 py-1 bg-white/90 text-[#0A0A0A]">
                          Look {look.lookNumber}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-white/40">
                        {look.collectionName}
                      </p>
                      <h3 className="font-serif text-white text-lg leading-tight group-hover:text-white/80 transition-colors">
                        Look {look.lookNumber}
                      </h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/archive"
                className="inline-flex items-center gap-2 group"
              >
                <span className="font-sans text-[11px] tracking-[0.22em] uppercase text-white/60 group-hover:text-white transition-colors">
                  View All in Archive
                </span>
                <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </div>
        </section>

        {/* Related Designer */}
        {designer && (
          <section className="relative w-full bg-[#0F0D0B] py-20 border-t border-white/[0.06]">
            <div className="max-w-[95rem] mx-auto px-6 md:px-10">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8 }}
              >
                <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-[#B7AEA9] block mb-6">
                  Featured Designer
                </span>
                
                <Link href={`/designers/${designer.slug}`} className="group block">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-4">
                      <div className="relative aspect-[4/5] overflow-hidden">
                        <Image
                          src={designer.coverImage || designer.cover_image || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=1000&fit=crop'}
                          alt={designer.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                    </div>
                    
                    <div className="lg:col-span-8">
                      <h2 className="font-serif text-white text-3xl md:text-4xl lg:text-5xl leading-[1.1] mb-4 group-hover:text-white/80 transition-colors">
                        {designer.name}
                      </h2>
                      
                      <p className="font-inter text-white/50 text-lg leading-relaxed mb-6 max-w-2xl">
                        {designer.shortBio || designer.short_bio || designer.bio?.slice(0, 200)}
                      </p>
                      
                      <div className="flex items-center gap-2 group">
                        <span className="font-sans text-[11px] tracking-[0.22em] uppercase text-white/60 group-hover:text-white transition-colors">
                          View Designer Profile
                        </span>
                        <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </div>
          </section>
        )}

        {/* Read Next - Related Editorials */}
        <section className="relative w-full bg-[#0A0A0A] py-20 md:py-28 border-t border-white/[0.06]">
          <div className="max-w-[95rem] mx-auto px-6 md:px-10">
            <div className="text-center mb-12">
              <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-[#B7AEA9] block mb-4">
                Continue Reading
              </span>
              <h2 className="font-serif text-white text-3xl md:text-4xl leading-[1.1]">
                Read Next
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                >
                  <Link href={`/editorial/${item.slug}`} className="group relative block aspect-[4/3] overflow-hidden">
                    <Image
                      src={item.coverImage || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/30 to-transparent" />
                    
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      <span className="font-sans text-[9px] tracking-[0.25em] uppercase text-white/50 mb-2">
                        {item.category}
                      </span>
                      <h3 className="font-serif text-white text-xl leading-tight group-hover:underline decoration-white/30 underline-offset-4">
                        {item.title}
                      </h3>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && featuredLooks[currentLookIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-white p-3 hover:bg-white/10 transition-colors z-10"
            >
              <X className="w-8 h-8" />
            </button>

            <button
              onClick={prevLook}
              className="absolute left-6 text-white p-3 hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>

            <button
              onClick={nextLook}
              className="absolute right-6 text-white p-3 hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-10 h-10" />
            </button>

            <div className="flex max-w-6xl w-full mx-8 gap-8 items-center">
              <div className="flex-1 relative">
                <Image
                  src={featuredLooks[currentLookIndex].image}
                  alt={`Look ${featuredLooks[currentLookIndex].lookNumber}`}
                  width={800}
                  height={1200}
                  className="object-contain max-h-[80vh] mx-auto"
                />
              </div>

              <div className="w-72 bg-[#1a1a1a] p-6 text-white overflow-y-auto max-h-[80vh]">
                <span className="font-sans text-[10px] tracking-[2px] uppercase text-[#B7AEA9]">
                  Look {featuredLooks[currentLookIndex].lookNumber}
                </span>
                <h3 className="font-serif text-xl mt-2 mb-4">{featuredLooks[currentLookIndex].collectionName}</h3>
                
                <Link 
                  href={`/archive/${featuredLooks[currentLookIndex].collectionSlug}`}
                  className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mt-4"
                >
                  <span className="font-sans text-[10px] tracking-[2px] uppercase">
                    View Collection
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="mt-6">
                  <BookmarkButton id={`${featuredLooks[currentLookIndex].lookId}`} type="look" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}
