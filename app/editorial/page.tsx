'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
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
  coverImage: string
  coverImageVertical?: string
  designerSlug?: string
  designerName?: string
  tags: string[]
  readTime: number
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

export default function EditorialPage() {
  const [articles, setArticles] = useState<EditorialArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    async function fetchArticles() {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false })

        if (error || !data || data.length === 0) {
          setArticles(mockArticles.filter(a => a.status === 'published') as EditorialArticle[])
        } else {
          setArticles(data as EditorialArticle[])
        }
      } catch {
        setArticles(mockArticles.filter(a => a.status === 'published') as EditorialArticle[])
      } finally {
        setLoading(false)
      }
    }
    fetchArticles()
  }, [])

  useEffect(() => {
    if (!isAutoPlaying || articles.length === 0) return
    const interval = setInterval(() => {
      setCurrentFeatureIndex((prev) => (prev + 1) % articles.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, articles.length])

  const currentFeature = articles[currentFeatureIndex]
  const relatedArticles = articles.slice(0, 3)

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen justify-between bg-[#0A0A0A]">
        <StickyNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse font-sans text-sm tracking-[0.22em] uppercase text-[#B7AEA9]">
            Loading...
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A]">
      <StickyNavbar />

      <main>
        {/* Hero Section - Full Bleed with Featured Editorial */}
        <section className="relative h-screen w-full overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={currentFeature?.coverImage || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop'}
              alt={currentFeature?.title || 'Editorial'}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/80 via-transparent to-transparent" />
          </div>

          {/* Film grain overlay */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay">
            <div className="h-full w-full animate-pulse bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjUiLz48L3N2Zz4=')]" />
          </div>

          <div className="relative z-10 flex h-full items-end justify-center pb-16 md:pb-24">
            <div className="w-full max-w-[95rem] mx-auto px-6 md:px-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
                <div className="lg:col-span-8">
                  {/* Category tag */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="flex items-center gap-3 mb-6"
                  >
                    <span
                      className="font-sans text-[10px] tracking-[0.25em] uppercase px-3 py-1.5"
                      style={{ backgroundColor: categoryColors[currentFeature?.category || 'features'], color: '#F5F2ED' }}
                    >
                      {currentFeature?.category || 'Feature'}
                    </span>
                    <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-white/50">
                      {currentFeature?.readTime} min read
                    </span>
                  </motion.div>

                  {/* Title */}
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="font-serif text-white text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-[0.95] mb-6"
                  >
                    {currentFeature?.title || 'The Quiet Revolution'}
                  </motion.h1>

                  {/* Subtitle */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.35 }}
                    className="font-sans text-white/70 text-lg md:text-xl max-w-2xl leading-relaxed"
                  >
                    {currentFeature?.subtitle || 'How Mongolian designers are transforming the narrative of Asian fashion'}
                  </motion.p>

                  {/* Author and date */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="flex items-center gap-4 mt-8"
                  >
                    <div className="flex items-center gap-2 text-white/60 font-sans text-[11px] tracking-[0.18em] uppercase">
                      <span>By {currentFeature?.author || 'Editorial Staff'}</span>
                      <span className="w-1 h-1 rounded-full bg-white/40" />
                      <span>{currentFeature?.publishedAt || 'March 2026'}</span>
                    </div>
                  </motion.div>
                </div>

                {/* Navigation dots */}
                <div className="lg:col-span-4 lg:text-right">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="flex lg:justify-end items-center gap-3 mb-6"
                  >
                    <button
                      onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <div className="flex gap-2">
                      {articles.slice(0, 5).map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setCurrentFeatureIndex(idx)
                            setIsAutoPlaying(false)
                          }}
                          className={`w-8 h-0.5 transition-all duration-300 ${
                            currentFeatureIndex === idx ? 'bg-white' : 'bg-white/30 hover:bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </motion.div>

                  {/* Read Article CTA */}
                  {currentFeature && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.7 }}
                    >
                      <Link
                        href={`/editorial/${currentFeature.slug}`}
                        className="inline-flex items-center gap-3 group"
                      >
                        <span className="font-sans text-[11px] tracking-[0.22em] uppercase text-white/80 group-hover:text-white transition-colors">
                          Read Story
                        </span>
                        <ArrowRight className="w-4 h-4 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Narrative Section */}
        <section className="relative w-full bg-[#0A0A0A] py-24 md:py-32">
          <div className="max-w-[95rem] mx-auto px-6 md:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
              {/* Left - Large Feature Image */}
              <div className="lg:col-span-7">
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="relative aspect-[4/5] overflow-hidden"
                >
                  <Image
                    src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=1500&fit=crop"
                    alt="Editorial Feature"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/60 via-transparent to-transparent" />
                  
                  {/* Credits overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <div className="border-t border-white/20 pt-4">
                      <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-white/50 mb-2">Credits</p>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-white/70 font-sans text-[11px] tracking-[0.08em]">
                        <span>Photo: Batbayar</span>
                        <span>Stylist: Nomin</span>
                        <span>Model: Anu</span>
                        <span>Creative Dir: Bold</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Right - Content */}
              <div className="lg:col-span-5 flex flex-col justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-[#B7AEA9] block mb-6">
                    In Focus
                  </span>
                  
                  <h2 className="font-serif text-white text-3xl md:text-4xl lg:text-5xl leading-[1.1] mb-8">
                    The Architecture<br />of the Steppe
                  </h2>
                  
                  <p className="font-inter text-white/60 text-lg leading-relaxed mb-8">
                    Exploring the geometric foundations of Mongolian design — where the vastness of the landscape meets the precision of contemporary craft.
                  </p>

                  <Link
                    href="/editorial"
                    className="inline-flex items-center gap-3 group border-b border-white/20 pb-1"
                  >
                    <span className="font-sans text-[11px] tracking-[0.22em] uppercase text-white/70 group-hover:text-white transition-colors">
                      View Full Story
                    </span>
                    <ArrowRight className="w-4 h-4 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </Link>
                </motion.div>

                {/* Secondary Images */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="grid grid-cols-2 gap-4 mt-12"
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-sm">
                    <Image
                      src="https://images.unsplash.com/photo-1539533057392-a63e26c766c1?w=600&h=800&fit=crop"
                      alt="Texture Detail"
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    <span className="absolute bottom-3 left-3 font-sans text-[9px] tracking-[0.2em] uppercase text-white/70">
                      Fabric
                    </span>
                  </div>
                  <div className="relative aspect-[3/4] overflow-hidden rounded-sm">
                    <Image
                      src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=800&fit=crop"
                      alt="Mood Detail"
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    <span className="absolute bottom-3 left-3 font-sans text-[9px] tracking-[0.2em] uppercase text-white/70">
                      Mood
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Pull Quote Section */}
        <section className="relative w-full bg-[#0A0A0A] py-20 md:py-28 border-t border-white/[0.06]">
          <div className="max-w-[95rem] mx-auto px-6 md:px-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-center max-w-4xl mx-auto"
            >
              <span className="font-serif text-[#B7AEA9]/40 text-6xl md:text-8xl leading-none">"</span>
              <blockquote className="font-serif text-white text-2xl md:text-3xl lg:text-4xl leading-[1.3] -mt-8 mb-8">
                We're not just making clothes. We're preserving a way of life. Every sweater carries the memory of the herd.
              </blockquote>
              <cite className="font-sans text-[11px] tracking-[0.25em] uppercase text-[#B7AEA9]/70 not-italic">
                — Tsetseg, Cashmere Grader
              </cite>
            </motion.div>
          </div>
        </section>

        {/* Shop The Look */}
        <section className="relative w-full bg-[#0A0A0A] py-20 md:py-28 border-t border-white/[0.06]">
          <div className="max-w-[95rem] mx-auto px-6 md:px-10">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-[#B7AEA9] block mb-4">
                  Shop The Look
                </span>
                <h2 className="font-serif text-white text-3xl md:text-4xl lg:text-5xl leading-[1.1]">
                  Featured Pieces
                </h2>
              </div>
              <Link href="/archive" className="hidden md:inline-flex items-center gap-2 group">
                <span className="font-sans text-[11px] tracking-[0.22em] uppercase text-white/60 group-hover:text-white transition-colors">
                  View All
                </span>
                <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
              </Link>
            </div>

            {/* Carousel */}
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
              {[
                { id: 1, image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=900&fit=crop', title: 'Geometric Coat', designer: 'Gobi', price: '$2,400', collection: 'FW 2025' },
                { id: 2, image: 'https://images.unsplash.com/photo-1539533057392-a63e26c766c1?w=600&h=900&fit=crop', title: 'Architectural Blazer', designer: 'Goyol', price: '$1,850', collection: 'FW 2025' },
                { id: 3, image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=900&fit=crop', title: 'Embroidery Hoodie', designer: 'Michel&Amazonka', price: '$680', collection: 'SS 2025' },
                { id: 4, image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=900&fit=crop', title: 'Cashmere Knit', designer: 'Gobi', price: '$1,200', collection: 'SS 2025' },
                { id: 5, image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=900&fit=crop', title: 'Volume Puffer', designer: '93 Kidult', price: '$920', collection: 'FW 2025' },
              ].map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="flex-shrink-0 w-[280px] md:w-[320px]"
                >
                  <Link href={`/archive`} className="group block">
                    <div className="relative aspect-[2/3] overflow-hidden mb-4">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="w-full bg-white/90 hover:bg-white text-[#0A0A0A] py-3 font-sans text-[10px] tracking-[0.2em] uppercase transition-colors">
                          View in Archive
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-white/40">
                        {item.collection}
                      </p>
                      <h3 className="font-serif text-white text-lg leading-tight group-hover:text-white/80 transition-colors">
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

            <div className="mt-8 text-center md:hidden">
              <Link href="/archive" className="inline-flex items-center gap-2 group">
                <span className="font-sans text-[11px] tracking-[0.22em] uppercase text-white/60 group-hover:text-white transition-colors">
                  View All
                </span>
                <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
              </Link>
            </div>
          </div>
        </section>

        {/* Latest Stories Grid */}
        <section className="relative w-full bg-[#0F0D0B] py-20 md:py-28 border-t border-white/[0.06]">
          <div className="max-w-[95rem] mx-auto px-6 md:px-10">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-[#B7AEA9] block mb-4">
                  Latest Stories
                </span>
                <h2 className="font-serif text-white text-3xl md:text-4xl lg:text-5xl leading-[1.1]">
                  Editorial
                </h2>
              </div>
              <Link href="/editorial" className="hidden md:inline-flex items-center gap-2 group">
                <span className="font-sans text-[11px] tracking-[0.22em] uppercase text-white/60 group-hover:text-white transition-colors">
                  View All
                </span>
                <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedArticles.map((article, idx) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                >
                  <Link href={`/editorial/${article.slug}`} className="group block">
                    <div className="relative aspect-[3/2] overflow-hidden mb-5">
                      <Image
                        src={article.coverImage}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/60 via-transparent to-transparent" />
                      <div className="absolute top-4 left-4">
                        <span
                          className="font-sans text-[9px] tracking-[0.2em] uppercase px-2 py-1"
                          style={{ backgroundColor: categoryColors[article.category], color: '#F5F2ED' }}
                        >
                          {article.category}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-white/40 font-sans text-[10px] tracking-[0.15em] uppercase">
                        <span>{article.author}</span>
                        <span className="w-1 h-1 rounded-full bg-white/30" />
                        <span>{article.readTime} min</span>
                      </div>
                      <h3 className="font-serif text-white text-xl md:text-2xl leading-[1.2] group-hover:text-white/80 transition-colors">
                        {article.title}
                      </h3>
                      <p className="font-inter text-white/50 text-sm leading-relaxed line-clamp-2">
                        {article.subtitle}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 text-center md:hidden">
              <Link href="/editorial" className="inline-flex items-center gap-2 group">
                <span className="font-sans text-[11px] tracking-[0.22em] uppercase text-white/60 group-hover:text-white transition-colors">
                  View All Stories
                </span>
                <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
              </Link>
            </div>
          </div>
        </section>

        {/* Read Next */}
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
              {[
                { title: 'The Geometry of the Steppe', category: 'Features', image: 'https://images.unsplash.com/photo-1539533057392-a63e26c766c1?w=800&h=600&fit=crop' },
                { title: 'Street Code: Ulaanbaatar', category: 'Interviews', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=600&fit=crop' },
                { title: 'Mongolia Fashion Week 2025', category: 'News', image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&h=600&fit=crop' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                >
                  <Link href="/editorial" className="group relative block aspect-[4/3] overflow-hidden">
                    <Image
                      src={item.image}
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

      <Footer />
    </div>
  )
}
