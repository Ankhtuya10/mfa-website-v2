'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { StickyNavbar, Footer } from '@/app/components'
import { designers } from '@/lib/mockData'

export default function BrandsPage() {
  const highEnd = designers.filter(d => d.tier === 'high-end')
  const contemporary = designers.filter(d => d.tier === 'contemporary')
  const emerging = designers.filter(d => d.tier === 'emerging')

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
                      <Image src={designer.coverImage} alt={designer.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                    <div className="p-8 flex flex-col justify-center text-center">
                      <span className="font-sans text-xs tracking-[3px] uppercase text-[#9B9590] mb-2 block">High-End</span>
                      <h3 className="font-serif text-2xl text-[#2A2522] mb-2">{designer.name}</h3>
                      <span className="font-sans text-xs tracking-[3px] uppercase text-[#9B9590] mb-3 block">Est. {designer.founded}</span>
                      <p className="font-sans text-sm text-[#7A7470] leading-relaxed line-clamp-2 mb-4">{designer.shortBio}</p>
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
                      <Image src={designer.coverImage} alt={designer.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                    <div className="p-6">
                      <h3 className="font-serif text-xl text-[#2A2522] mb-1">{designer.name}</h3>
                      <span className="font-sans text-xs tracking-[3px] uppercase text-[#9B9590]">Est. {designer.founded}</span>
                      <p className="font-sans text-sm text-[#7A7470] mt-3 leading-relaxed">{designer.shortBio}</p>
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
                      <Image src={designer.profileImage} alt={designer.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
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
