'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { StickyNavbar, Footer } from '@/app/components'
import { DesignerCard } from '@/app/components/shared/DesignerCard'

const tiers = ['All', 'High-End', 'Contemporary', 'Emerging']

export default function DesignersPage() {
  const [activeTier, setActiveTier] = useState('All')
  const [designers, setDesigners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDesigners() {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        
        const { data, error } = await supabase
          .from('designers')
          .select('*')
          .order('name')
        
        if (error) throw error
        setDesigners(data || [])
      } catch {
        setDesigners([])
      } finally {
        setLoading(false)
      }
    }
    fetchDesigners()
  }, [])

  const filteredDesigners = activeTier === 'All'
    ? designers
    : designers.filter((d: any) => (d.tier || '').toLowerCase().replace('-', ' ') === activeTier.toLowerCase())

  const groupedDesigners = {
    'high-end': filteredDesigners.filter((d: any) => d.tier === 'high-end'),
    'contemporary': filteredDesigners.filter((d: any) => d.tier === 'contemporary'),
    'emerging': filteredDesigners.filter((d: any) => d.tier === 'emerging')
  }

  return (
    <div className="flex flex-col min-h-screen justify-between bg-[#F5F2ED]">
      <StickyNavbar />

      <main className="flex-grow">
        {/* Hero */}
        <section className="relative w-full bg-[#0A0A0A] flex items-center justify-center pt-24 pb-12">
          <div className="w-full max-w-5xl mx-auto px-8 text-center">
            <span className="font-sans text-xs tracking-[0.32em] uppercase text-[#B7AEA9] block mb-6">Mongolian Fashion Archive</span>
            <h1 className="font-serif text-white text-5xl md:text-6xl lg:text-7xl leading-[1.1] mb-6 [overflow-wrap:anywhere]">The Designers</h1>
            <p className="font-sans text-[#B7AEA9] text-lg max-w-xl mx-auto">
              Six houses shaping the future of Mongolian fashion
            </p>
          </div>
        </section>

        {/* Tier tabs */}
        <section className="sticky top-20 z-40 bg-[#0A0A0A]/95 backdrop-blur border-b border-[rgba(255,255,255,0.08)] py-5 flex items-center justify-center">
          <div className="flex items-center gap-10">
            {tiers.map((tier) => (
              <button
                key={tier}
                onClick={() => setActiveTier(tier)}
                className={`font-sans text-sm tracking-[3px] uppercase pb-1 transition-colors ${
                  activeTier === tier
                    ? 'border-b-2 border-white text-white'
                    : 'text-[#7A7470] hover:text-white'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </section>

        {/* Designers grid */}
        <section className="py-16 pb-24 flex items-center justify-center">
          <div className="w-full max-w-6xl mx-auto px-8">
            {loading ? (
              <div className="text-center py-20">
                <span className="font-sans text-sm tracking-[2px] uppercase text-[#B7AEA9]">Loading...</span>
              </div>
            ) : activeTier === 'All' ? (
              <>
                {groupedDesigners['high-end'].length > 0 && (
                  <div className="mb-16 text-center">
                    <span className="font-display text-[60px] md:text-[80px] text-[rgba(0,0,0,0.04)] leading-none mb-10 block">HIGH-END</span>
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
                      {groupedDesigners['high-end'].map((designer: any) => (
                        <DesignerCard key={designer.id} designer={designer} variant="grid" />
                      ))}
                    </motion.div>
                  </div>
                )}

                {groupedDesigners['contemporary'].length > 0 && (
                  <div className="mb-16 text-center">
                    <span className="font-display text-[60px] md:text-[80px] text-[rgba(0,0,0,0.04)] leading-none mb-10 block">CONTEMPORARY</span>
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
                      {groupedDesigners['contemporary'].map((designer: any) => (
                        <DesignerCard key={designer.id} designer={designer} variant="grid" />
                      ))}
                    </motion.div>
                  </div>
                )}

                {groupedDesigners['emerging'].length > 0 && (
                  <div className="text-center">
                    <span className="font-display text-[60px] md:text-[80px] text-[rgba(0,0,0,0.04)] leading-none mb-10 block">EMERGING</span>
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
                      {groupedDesigners['emerging'].map((designer: any) => (
                        <DesignerCard key={designer.id} designer={designer} variant="grid" />
                      ))}
                    </motion.div>
                  </div>
                )}
              </>
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
                {filteredDesigners.map((designer: any) => (
                  <DesignerCard key={designer.id} designer={designer} variant="grid" />
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
