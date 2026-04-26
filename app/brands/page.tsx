'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { StickyNavbar, Footer } from '@/app/components'

type BrandDesigner = {
  id: string
  slug: string
  name: string
  tier: string | null
  founded: number | null
  short_bio: string | null
  profile_image: string | null
  cover_image: string | null
}

const brandImageFallback =
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop'

export default function BrandsPage() {
  const [designers, setDesigners] = useState<BrandDesigner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadDesigners() {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data, error } = await supabase
          .from('designers')
          .select('id, slug, name, tier, founded, short_bio, profile_image, cover_image')
          .order('name')

        if (error) throw error
        if (!active) return
        setDesigners((data || []) as BrandDesigner[])
      } catch {
        if (!active) return
        setDesigners([])
      } finally {
        if (!active) return
        setLoading(false)
      }
    }

    loadDesigners()

    return () => {
      active = false
    }
  }, [])

  const highEnd = useMemo(() => designers.filter((d) => d.tier === 'high-end'), [designers])
  const contemporary = useMemo(() => designers.filter((d) => d.tier === 'contemporary'), [designers])
  const emerging = useMemo(() => designers.filter((d) => d.tier === 'emerging'), [designers])

  return (
    <div className="flex flex-col min-h-screen justify-between bg-[#F5F2ED]">
      <StickyNavbar />

      <main className="flex-grow">
        {/* Hero */}
        <section className="relative w-full bg-[#0A0A0A] flex items-center justify-center" style={{ height: '50vh' }}>
          <div className="w-full max-w-5xl mx-auto px-8 text-center">
            <span className="font-sans text-xs tracking-[4.95px] uppercase text-[#B7AEA9] block mb-6">Mongolian Fashion</span>
            <h1 className="font-serif text-white text-5xl md:text-6xl lg:text-7xl leading-[1.1] mb-6">The Brands</h1>
            <p className="font-sans text-[#B7AEA9] text-lg max-w-xl mx-auto">
              From heritage cashmere houses to the voices of a new generation
            </p>
          </div>
        </section>

        {/* High-End Section */}
        <section className="py-16 bg-white flex items-center justify-center">
          <div className="w-full max-w-5xl mx-auto px-8">
            <div className="flex items-center justify-center gap-6 mb-12">
              <div className="h-px w-16 bg-[rgba(0,0,0,0.08)]" />
              <span className="font-sans text-xs tracking-[4px] uppercase text-[#9B9590]">High-End</span>
              <div className="h-px w-16 bg-[rgba(0,0,0,0.08)]" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {!loading && highEnd.length === 0 && (
                <p className="font-sans text-[#9B9590]">No high-end brands found.</p>
              )}
              {highEnd.map((designer, i) => (
                <Link key={designer.id} href={`/designers/${designer.slug}`}>
                  <motion.article
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="grid grid-cols-1 lg:grid-cols-[55%_45%] bg-[#F5F2ED] border border-[rgba(0,0,0,0.06)] overflow-hidden group"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image src={designer.cover_image || designer.profile_image || brandImageFallback} alt={designer.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                    <div className="p-8 flex flex-col justify-center text-center">
                      <span className="font-sans text-xs tracking-[3px] uppercase text-[#9B9590] mb-2 block">High-End</span>
                      <h3 className="font-serif text-2xl text-[#2A2522] mb-2">{designer.name}</h3>
                      <span className="font-sans text-xs tracking-[3px] uppercase text-[#9B9590] mb-3 block">Est. {designer.founded}</span>
                      <p className="font-sans text-sm text-[#7A7470] leading-relaxed line-clamp-2 mb-4">{designer.short_bio}</p>
                      <span className="font-sans text-xs tracking-[3px] uppercase text-[#2A2522] group-hover:text-[#393931] transition-colors">Explore →</span>
                    </div>
                  </motion.article>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Contemporary Section */}
        <section className="py-16 bg-[#F5F2ED] flex items-center justify-center">
          <div className="w-full max-w-5xl mx-auto px-8">
            <div className="flex items-center justify-center gap-6 mb-12">
              <div className="h-px w-16 bg-[rgba(0,0,0,0.08)]" />
              <span className="font-sans text-xs tracking-[4px] uppercase text-[#9B9590]">Contemporary</span>
              <div className="h-px w-16 bg-[rgba(0,0,0,0.08)]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {!loading && contemporary.length === 0 && (
                <p className="font-sans text-[#9B9590]">No contemporary brands found.</p>
              )}
              {contemporary.map((designer, i) => (
                <Link key={designer.id} href={`/designers/${designer.slug}`}>
                  <motion.article
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="bg-white border border-[rgba(0,0,0,0.06)] overflow-hidden group text-center"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image src={designer.cover_image || designer.profile_image || brandImageFallback} alt={designer.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                    <div className="p-6">
                      <h3 className="font-serif text-xl text-[#2A2522] mb-1">{designer.name}</h3>
                      <span className="font-sans text-xs tracking-[3px] uppercase text-[#9B9590]">Est. {designer.founded}</span>
                      <p className="font-sans text-sm text-[#7A7470] mt-3 leading-relaxed">{designer.short_bio}</p>
                    </div>
                  </motion.article>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Emerging Section */}
        <section className="py-16 pb-24 bg-white flex items-center justify-center">
          <div className="w-full max-w-5xl mx-auto px-8">
            <div className="flex items-center justify-center gap-6 mb-12">
              <div className="h-px w-16 bg-[rgba(0,0,0,0.08)]" />
              <span className="font-sans text-xs tracking-[4px] uppercase text-[#9B9590]">Emerging Talent</span>
              <div className="h-px w-16 bg-[rgba(0,0,0,0.08)]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {!loading && emerging.length === 0 && (
                <p className="font-sans text-[#9B9590]">No emerging brands found.</p>
              )}
              {emerging.map((designer, i) => (
                <Link key={designer.id} href={`/designers/${designer.slug}`}>
                  <motion.article
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="border border-[rgba(0,0,0,0.08)] overflow-hidden group text-center"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <Image src={designer.profile_image || designer.cover_image || brandImageFallback} alt={designer.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-serif text-lg text-[#2A2522] mb-1">{designer.name}</h3>
                      <span className="font-sans text-xs tracking-[3px] uppercase text-[#9B9590]">Est. {designer.founded}</span>
                    </div>
                  </motion.article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
