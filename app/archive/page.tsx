'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { StickyNavbar, Footer } from '@/app/components'
import { CollectionCard } from '@/app/components/shared/CollectionCard'
import { EmptyState } from '@/app/components/shared/EmptyState'
import { collections as mockCollections } from '@/lib/mockData'

const seasons = ['All', 'FW2024', 'SS2025', 'FW2025']
const designerOptions = ['All Designers', 'Gobi', 'Goyol', 'Michel&Amazonka', '93 Kidult', 'Nomin Design', 'Steppe Studio']

export default function ArchivePage() {
  const [activeSeason, setActiveSeason] = useState('All')
  const [activeDesigner, setActiveDesigner] = useState('All Designers')
  const [collections, setCollections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

  const filteredCollections = collections.filter((col: any) => {
    const seasonMatch = activeSeason === 'All' || 
      (col.slug || '').toLowerCase().includes(activeSeason.toLowerCase().replace(' ', ''))
    const designerMatch = activeDesigner === 'All Designers' || 
      (col.designer_name || col.designerName || '').toLowerCase().includes(activeDesigner.toLowerCase().replace(' ', '').replace('&', ''))
    return seasonMatch && designerMatch
  })

  return (
    <div className="flex flex-col min-h-screen justify-between bg-[#F5F2ED]">
      <StickyNavbar />

      <main className="flex-grow">
        {/* Hero */}
        <section className="relative w-full bg-[#F5F2ED] flex items-center justify-center" style={{ height: '55vh' }}>
          <div className="w-full max-w-5xl mx-auto px-8 text-center">
            <span className="font-sans text-xs tracking-[4.95px] uppercase text-[#9B9590] block mb-6">Mongolian Fashion Archive</span>
            <h1 className="font-serif text-[#2A2522] text-5xl md:text-6xl lg:text-7xl leading-[1.1] mb-6">The Archive</h1>
            <p className="font-sans text-[#7A7470] text-lg max-w-xl mx-auto">
              Every season. Every collection. Every look — preserved.
            </p>
          </div>
        </section>

        {/* Season tabs */}
        <section className="sticky top-20 z-40 bg-[#0A0A0A]/95 backdrop-blur border-b border-[rgba(255,255,255,0.08)] py-5 flex items-center justify-center">
          <div className="flex items-center gap-10">
            {seasons.map((season) => (
              <button
                key={season}
                onClick={() => setActiveSeason(season)}
                className={`font-sans text-sm tracking-[3px] uppercase pb-1 transition-colors ${
                  activeSeason === season
                    ? 'border-b-2 border-white text-white'
                    : 'text-[#7A7470] hover:text-white'
                }`}
              >
                {season}
              </button>
            ))}
          </div>
        </section>

        {/* Designer filter */}
        <section className="py-8 flex items-center justify-center">
          <div className="text-center">
            <span className="font-sans text-xs tracking-[4.95px] uppercase text-[#9B9590] block mb-4">Filter by Designer</span>
            <div className="flex flex-wrap justify-center gap-3">
              {designerOptions.map((designer) => (
                <button
                  key={designer}
                  onClick={() => setActiveDesigner(designer)}
                  className={`px-6 py-3 font-sans text-xs tracking-[2px] uppercase transition-all ${
                    activeDesigner === designer
                      ? 'bg-[#0A0A0A] text-white'
                      : 'border-2 border-[rgba(0,0,0,0.1)] text-[#7A7470] hover:border-[#2A2522] hover:text-[#2A2522]'
                  }`}
                >
                  {designer}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Collection grid */}
        <section className="py-12 pb-24 flex items-center justify-center">
          <div className="w-full max-w-6xl mx-auto px-8">
            {loading ? (
              <div className="text-center py-20">
                <span className="font-sans text-sm tracking-[2px] uppercase text-[#B7AEA9]">Loading...</span>
              </div>
            ) : filteredCollections.length === 0 ? (
              <EmptyState
                title="No collections found"
                subtitle="Try adjusting your filters to see more results."
                ghostText="EMPTY"
                action={{ label: 'Clear Filters', href: '/archive' }}
              />
            ) : (
              <motion.div
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
                }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredCollections.map((collection: any) => (
                  <CollectionCard key={collection.id} collection={collection} showDesigner />
                ))}
              </motion.div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
