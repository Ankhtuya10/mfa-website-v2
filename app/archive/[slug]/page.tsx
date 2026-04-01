'use client'

import { use } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { getCollectionBySlug, getCollections } from '@/lib/supabase/queries'
import { StickyNavbar, Footer } from '@/app/components'
import { Breadcrumb } from '@/app/components/shared/Breadcrumb'
import { CollectionCard } from '@/app/components/shared/CollectionCard'
import { BookmarkButton } from '@/app/components/shared/BookmarkButton'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface Collection {
  id: string
  slug: string
  title: string
  designer_id: string
  designer_name: string
  designer_slug: string
  season: string
  year: number
  description: string
  cover_image: string
  looks: Array<{
    id: string
    number: number
    image: string
    description: string
    materials: string[]
  }>
}

export default function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [collection, setCollection] = useState<Collection | null>(null)
  const [otherCollections, setOtherCollections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentLookIndex, setCurrentLookIndex] = useState(0)

  useEffect(() => {
    async function loadData() {
      try {
        const [colData, allColsData] = await Promise.all([
          getCollectionBySlug(slug),
          getCollections()
        ])
        
        if (colData) {
          setCollection(colData as Collection)
          const others = (allColsData || []).filter(
            (c: any) => c.designer_slug === (colData as any).designer_slug && c.id !== (colData as any).id
          ).slice(0, 3)
          setOtherCollections(others)
        }
      } catch (err) {
        console.error('Error loading collection:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [slug])

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen justify-between bg-[#F5F2ED]">
        <StickyNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse font-sans text-[#B7AEA9]">Loading...</div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="flex flex-col min-h-screen justify-between bg-[#F5F2ED]">
        <StickyNavbar />
        <div className="flex-1 flex items-center justify-center">
          <h1 className="font-serif text-4xl text-[#2A2522]">Collection not found</h1>
        </div>
        <Footer />
      </div>
    )
  }

  const openLightbox = (index: number) => {
    setCurrentLookIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => setLightboxOpen(false)

  const nextLook = () => {
    setCurrentLookIndex((prev) => (prev + 1) % (collection.looks?.length || 1))
  }

  const prevLook = () => {
    setCurrentLookIndex((prev) => (prev - 1 + (collection.looks?.length || 1)) % (collection.looks?.length || 1))
  }

  return (
    <div className="flex flex-col min-h-screen justify-between bg-[#F5F2ED]">
      <StickyNavbar />

      <main className="flex-grow">
        {/* Hero */}
        <section className="relative w-full" style={{ height: '65vh' }}>
          <Image
            src={collection.cover_image}
            alt={collection.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          <div className="absolute inset-0 flex items-end justify-center" style={{ paddingBottom: '60px' }}>
            <div className="max-w-6xl mx-auto px-8 w-full">
              <div className="flex justify-between items-end">
                <div>
                  <span className="font-sans text-[10px] tracking-[4.95px] uppercase text-white/70 block mb-2">
                    {collection.season} {collection.year}
                  </span>
                  <h1 className="font-serif text-white text-5xl leading-[1.05]">
                    {collection.title}
                  </h1>
                  <Link href={`/designers/${collection.designer_slug}`} className="font-sans text-[13px] tracking-[3px] uppercase text-white/60 mt-2 block hover:text-white/80 transition-colors">
                    {collection.designer_name}
                  </Link>
                </div>
                <span className="font-sans text-[11px] tracking-[2px] uppercase text-white/60">
                  {collection.looks?.length || 0} Looks
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-8 w-full">
          <Breadcrumb
            items={[
              { label: 'Archive', href: '/archive' },
              { label: `${collection.season} ${collection.year}`, href: '/archive' },
              { label: collection.designer_name }
            ]}
          />

          {/* Info bar */}
          <div className="py-10 border-b border-[rgba(0,0,0,0.08)]">
            <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-12">
              <div>
                <p className="font-inter text-[17px] leading-[1.85] text-[#3A3530] line-clamp-2">
                  {collection.description}
                </p>
                <Link href={`/designers/${collection.designer_slug}`} className="font-sans text-[11px] tracking-[2px] uppercase text-[#B7AEA9] mt-4 inline-block hover:text-[#2A2522] transition-colors">
                  View Designer Profile →
                </Link>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <span className="font-sans text-[10px] tracking-[2px] uppercase text-[#9B9590] block mb-2">Year</span>
                  <span className="font-serif text-3xl text-[#2A2522]">{collection.year}</span>
                </div>
                <div>
                  <span className="font-sans text-[10px] tracking-[2px] uppercase text-[#9B9590] block mb-2">Season</span>
                  <span className="font-serif text-3xl text-[#2A2522]">{collection.season}</span>
                </div>
                <div>
                  <span className="font-sans text-[10px] tracking-[2px] uppercase text-[#9B9590] block mb-2">Looks</span>
                  <span className="font-serif text-3xl text-[#2A2522]">{collection.looks?.length || 0}</span>
                </div>
                <div>
                  <span className="font-sans text-[10px] tracking-[2px] uppercase text-[#9B9590] block mb-2">Material</span>
                  <span className="font-serif text-3xl text-[#2A2522]">Cashmere</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lookbook */}
          <section className="py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collection.looks?.map((look, index) => (
                <motion.div
                  key={look.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                  className="cursor-pointer group"
                  onClick={() => openLightbox(index)}
                >
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <Image
                      src={look.image}
                      alt={`Look ${look.number}`}
                      width={600}
                      height={900}
                      className="object-cover w-full transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <span className="font-sans text-[10px] tracking-[2px] uppercase text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        Look {look.number}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>

        {/* More from designer */}
        {otherCollections.length > 0 && (
          <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-8 w-full">
              <h2 className="font-display text-2xl text-[#2A2522] mb-10">More from {collection.designer_name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {otherCollections.map((col) => (
                  <CollectionCard key={col.id} collection={col} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && collection.looks?.[currentLookIndex] && (
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
                  src={collection.looks[currentLookIndex].image}
                  alt={`Look ${collection.looks[currentLookIndex].number}`}
                  width={800}
                  height={1200}
                  className="object-contain max-h-[80vh] mx-auto"
                />
              </div>

              <div className="w-72 bg-[#1a1a1a] p-6 text-white overflow-y-auto max-h-[80vh]">
                <span className="font-sans text-[10px] tracking-[2px] uppercase text-[#B7AEA9]">
                  Look {collection.looks[currentLookIndex].number}
                </span>
                <h3 className="font-serif text-xl mt-2 mb-4">{collection.title}</h3>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {collection.looks[currentLookIndex].materials.map((mat, i) => (
                    <span key={i} className="px-3 py-1 bg-white/10 font-sans text-[10px] tracking-[2px] uppercase">
                      {mat}
                    </span>
                  ))}
                </div>

                <p className="font-inter text-[13px] text-[#B7AEA9] leading-relaxed">
                  {collection.looks[currentLookIndex].description}
                </p>

                <div className="mt-6">
                  <BookmarkButton id={`${slug}-${currentLookIndex}`} type="look" />
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
