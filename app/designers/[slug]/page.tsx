'use client'

import { use } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { getDesignerBySlug, getCollections, getArticles } from '@/lib/supabase/queries'
import { StickyNavbar, Footer } from '@/app/components'
import { Breadcrumb } from '@/app/components/shared/Breadcrumb'
import { CollectionCard } from '@/app/components/shared/CollectionCard'
import { ArticleCard } from '@/app/components/shared/ArticleCard'

const tabs = ['Collections', 'Press', 'All Looks']

interface Designer {
  id: string
  slug: string
  name: string
  tier: 'high-end' | 'contemporary' | 'emerging'
  bio: string
  short_bio: string
  profile_image: string
  cover_image: string
  founded: number
}

export default function DesignerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [designer, setDesigner] = useState<Designer | null>(null)
  const [designerCollections, setDesignerCollections] = useState<any[]>([])
  const [designerArticles, setDesignerArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Collections')

  useEffect(() => {
    async function loadData() {
      try {
        const [designerData, collectionsData, articlesData] = await Promise.all([
          getDesignerBySlug(slug),
          getCollections({ designerSlug: slug }),
          getArticles({ status: 'published' })
        ])
        
        if (designerData) {
          setDesigner(designerData as Designer)
          setDesignerCollections(collectionsData || [])
          setDesignerArticles(
            (articlesData || []).filter((a: any) => a.designer_slug === slug)
          )
        }
      } catch (err) {
        console.error('Error loading designer:', err)
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

  if (!designer) {
    return (
      <div className="flex flex-col min-h-screen justify-between bg-[#F5F2ED]">
        <StickyNavbar />
        <div className="flex-1 flex items-center justify-center">
          <h1 className="font-serif text-4xl text-[#2A2522]">Designer not found</h1>
        </div>
        <Footer />
      </div>
    )
  }

  const activeSeasons = Array.from(new Set(designerCollections.map((c: any) => `${c.season} ${c.year}`))).length

  const tierStyles = {
    'high-end': 'bg-[#0A0A0A] text-white',
    'contemporary': 'bg-[#EAEAEA] text-[#2A2522]',
    'emerging': 'border border-[#B7AEA9] text-[#B7AEA9]'
  }

  const tierLabels = {
    'high-end': 'High-End',
    'contemporary': 'Contemporary',
    'emerging': 'Emerging'
  }

  return (
    <div className="flex flex-col min-h-screen justify-between bg-[#F5F2ED]">
      <StickyNavbar />

      <main className="flex-grow">
        {/* Hero */}
        <section className="relative w-full" style={{ height: '70vh' }}>
          <Image
            src={designer.cover_image}
            alt={designer.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          <div className="absolute inset-0 flex items-end justify-center" style={{ paddingBottom: '60px' }}>
            <div className="max-w-6xl mx-auto px-8 w-full">
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.15 } }
                }}
                initial="hidden"
                animate="visible"
                className="flex justify-between items-end"
              >
                <div>
                  <motion.span variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className={`inline-block px-3 py-1 font-sans text-[10px] tracking-[2px] uppercase mb-4 ${tierStyles[designer.tier]}`}>
                    {tierLabels[designer.tier]}
                  </motion.span>
                  <motion.h1 variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }} className="font-serif text-white text-6xl leading-tight">
                    {designer.name}
                  </motion.h1>
                  <motion.span variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="font-sans text-[11px] tracking-[2px] uppercase text-white/60 mt-4 block">
                    Est. {designer.founded}
                  </motion.span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-8 w-full">
          <Breadcrumb
            items={[
              { label: 'Designers', href: '/designers' },
              { label: designer.name }
            ]}
          />

          {/* Bio section */}
          <section className="py-16">
            <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-12">
              <div>
                <p className="font-inter text-[17px] leading-[1.85] text-[#3A3530]">
                  {designer.bio}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <span className="font-sans text-[10px] tracking-[2px] uppercase text-[#9B9590] block mb-2">Founded</span>
                  <span className="font-serif text-4xl text-[#2A2522]">{designer.founded}</span>
                </div>
                <div>
                  <span className="font-sans text-[10px] tracking-[2px] uppercase text-[#9B9590] block mb-2">Active Seasons</span>
                  <span className="font-serif text-4xl text-[#2A2522]">{activeSeasons}</span>
                </div>
                <div>
                  <span className="font-sans text-[10px] tracking-[2px] uppercase text-[#9B9590] block mb-2">Collections</span>
                  <span className="font-serif text-4xl text-[#2A2522]">{designerCollections.length}</span>
                </div>
                <div>
                  <span className="font-sans text-[10px] tracking-[2px] uppercase text-[#9B9590] block mb-2">Tier</span>
                  <span className="font-serif text-4xl text-[#2A2522]">{tierLabels[designer.tier].split('-')[0]}</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Tabs */}
        <div className="sticky top-20 z-40 bg-white border-b border-[rgba(0,0,0,0.08)]">
          <div className="max-w-6xl mx-auto px-8">
            <div className="flex gap-8">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`font-sans text-[11px] tracking-[2px] uppercase pb-4 transition-colors ${
                    activeTab === tab
                      ? 'border-b-2 border-[#2A2522] text-[#2A2522]'
                      : 'text-[#B7AEA9] hover:text-[#2A2522]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab content */}
        <div className="max-w-6xl mx-auto px-8 w-full py-16">
          {activeTab === 'Collections' && (
            <div className="space-y-16">
              {Array.from(new Set(designerCollections.map((c: any) => c.year))).sort((a: number, b: number) => b - a).map((year: number) => (
                <div key={year}>
                  <span className="font-serif text-[80px] text-[rgba(0,0,0,0.05)] leading-none">
                    {year}
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 -mt-8">
                    {designerCollections.filter((c: any) => c.year === year).map((collection: any) => (
                      <CollectionCard key={collection.id} collection={collection} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Press' && (
            designerArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {designerArticles.map((article: any) => (
                  <ArticleCard key={article.id} article={article} variant="grid" />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="font-sans text-[#B7AEA9]">No press coverage yet.</p>
              </div>
            )
          )}

          {activeTab === 'All Looks' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {designerCollections.flatMap((c: any) => c.looks || []).map((look: any) => (
                <div key={look.id}>
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <Image
                      src={look.image}
                      alt={`Look ${look.number}`}
                      width={600}
                      height={900}
                      className="object-cover w-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
