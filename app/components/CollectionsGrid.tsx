'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';

const frames = [
  {
    id: 1,
    frameId: '01',
    tag: 'Contemporary Interpretations',
    title: "Spring '26 Lookbook",
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=1200&fit=crop&q=80',
    href: '/collections/spring-26',
  },
  {
    id: 2,
    frameId: '02',
    tag: 'Premium Cashmere',
    title: 'FW 2025 — Gobi',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=800&fit=crop&q=80',
    href: '/collections/fw-2025-gobi',
  },
  {
    id: 3,
    frameId: '03',
    tag: 'Hand-Crafted Luxury',
    title: 'SS 2025 — Goyol',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop&q=80',
    href: '/collections/ss-2025-goyol',
  },
  {
    id: 4,
    frameId: '04',
    tag: 'Timeless Meets Contemporary',
    title: 'Emerging — Michel&Amazonka',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=800&fit=crop&q=80',
    href: '/collections/michel-amazonka',
  },
];

export const CollectionsGrid = () => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const getDimClass = (id: number) => {
    if (hoveredId === null) return '';
    if (hoveredId === id) return '';
    return 'opacity-35';
  };

  return (
    <section className="relative w-full h-screen bg-[#F5F0EA] flex flex-col overflow-hidden">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-end justify-between px-6 md:px-10 pt-8 pb-4 flex-shrink-0"
      >
        <div>
          <span className="font-sans text-[9px] tracking-[0.35em] uppercase text-[#A09890] block mb-2">
            Featured Collections
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-normal text-[#1E1B18] leading-none">
            Latest Collections
          </h2>
        </div>
        <Link
          href="/collections"
          className="hidden md:flex items-center gap-3 font-sans text-[9px] tracking-[0.25em] uppercase text-[#A09890] hover:text-[#1E1B18] transition-colors duration-300 group mb-1"
        >
          View All
          <span className="w-6 h-px bg-current transition-all duration-300 group-hover:w-10" />
        </Link>
      </motion.div>

      {/* Film strip — fills the rest */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 flex flex-col px-6 md:px-10 pb-6 min-h-0"
      >
        <div className="bg-[#161412] p-2 md:p-2.5 flex flex-col h-full">

          {/* Perforations top */}
          <div className="flex items-center gap-[5px] mb-2 flex-shrink-0 overflow-hidden">
            {Array.from({ length: 50 }).map((_, i) => (
              <div key={i} className="w-2.5 h-[5px] rounded-sm bg-white/[0.08] flex-shrink-0" />
            ))}
          </div>

          {/* Grid */}
          <div className="grid gap-[3px] flex-1 min-h-0"
            style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr', gridTemplateRows: '1fr 1fr' }}
          >
            {/* Frame 01 — spans 2 rows */}
            <Link
              href={frames[0].href}
              className={`relative overflow-hidden group row-span-2 transition-all duration-500 ${getDimClass(frames[0].id)}`}
              onMouseEnter={() => setHoveredId(frames[0].id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <Image src={frames[0].image} alt={frames[0].title} fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute inset-0 border border-white/[0.06]" />
              <span className="absolute top-3 left-3 font-mono text-[8px] tracking-[0.12em] text-white/20">{frames[0].frameId}</span>
              <div className="absolute bottom-0 left-0 p-4">
                <p className="font-sans text-[7px] tracking-[0.22em] uppercase text-white/45 mb-1.5">{frames[0].tag}</p>
                <h3 className="font-serif text-xl text-white font-normal leading-snug">{frames[0].title}</h3>
              </div>
            </Link>

            {/* Frame 02 */}
            <Link href={frames[1].href} className={`relative overflow-hidden group transition-all duration-500 ${getDimClass(frames[1].id)}`}
              onMouseEnter={() => setHoveredId(frames[1].id)} onMouseLeave={() => setHoveredId(null)}>
              <Image src={frames[1].image} alt={frames[1].title} fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              <div className="absolute inset-0 border border-white/[0.06]" />
              <span className="absolute top-2 left-2 font-mono text-[8px] tracking-[0.12em] text-white/20">{frames[1].frameId}</span>
              <div className="absolute bottom-0 left-0 p-3">
                <p className="font-sans text-[7px] tracking-[0.22em] uppercase text-white/45 mb-1">{frames[1].tag}</p>
                <h3 className="font-serif text-sm text-white font-normal">{frames[1].title}</h3>
              </div>
            </Link>

            {/* Frame 03 */}
            <Link href={frames[2].href} className={`relative overflow-hidden group transition-all duration-500 ${getDimClass(frames[2].id)}`}
              onMouseEnter={() => setHoveredId(frames[2].id)} onMouseLeave={() => setHoveredId(null)}>
              <Image src={frames[2].image} alt={frames[2].title} fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              <div className="absolute inset-0 border border-white/[0.06]" />
              <span className="absolute top-2 left-2 font-mono text-[8px] tracking-[0.12em] text-white/20">{frames[2].frameId}</span>
              <div className="absolute bottom-0 left-0 p-3">
                <p className="font-sans text-[7px] tracking-[0.22em] uppercase text-white/45 mb-1">{frames[2].tag}</p>
                <h3 className="font-serif text-sm text-white font-normal">{frames[2].title}</h3>
              </div>
            </Link>

            {/* Frame 04 */}
            <Link href={frames[3].href} className={`relative overflow-hidden group transition-all duration-500 ${getDimClass(frames[3].id)}`}
              onMouseEnter={() => setHoveredId(frames[3].id)} onMouseLeave={() => setHoveredId(null)}>
              <Image src={frames[3].image} alt={frames[3].title} fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              <div className="absolute inset-0 border border-white/[0.06]" />
              <span className="absolute top-2 left-2 font-mono text-[8px] tracking-[0.12em] text-white/20">{frames[3].frameId}</span>
              <div className="absolute bottom-0 left-0 p-3">
                <p className="font-sans text-[7px] tracking-[0.22em] uppercase text-white/45 mb-1">{frames[3].tag}</p>
                <h3 className="font-serif text-sm text-white font-normal">{frames[3].title}</h3>
              </div>
            </Link>

            {/* SS 2026 season block */}
            <Link href="/collections" className="relative overflow-hidden group flex items-center justify-center bg-[#0C0A08]">
              <div className="absolute inset-0 border border-white/[0.06]" />
              <div className="absolute inset-0 opacity-30"
                style={{ backgroundImage: 'radial-gradient(circle at 30% 70%, #2a2218, transparent 60%), radial-gradient(circle at 80% 20%, #1a150d, transparent 50%)' }} />
              <div className="text-center transition-transform duration-500 group-hover:scale-105 relative z-10">
                <span className="font-sans text-[7px] tracking-[0.3em] uppercase text-white/20 block mb-3">New Season</span>
                <span className="font-serif text-3xl lg:text-4xl font-bold text-[#EDE9E2] block">SS 2026</span>
                <span className="block w-4 h-px bg-white/15 mx-auto mt-4" />
              </div>
            </Link>
          </div>

          {/* Perforations bottom */}
          <div className="flex items-center gap-[5px] mt-2 flex-shrink-0 overflow-hidden">
            {Array.from({ length: 50 }).map((_, i) => (
              <div key={i} className="w-2.5 h-[5px] rounded-sm bg-white/[0.08] flex-shrink-0" />
            ))}
          </div>
          <p className="font-mono text-[7px] tracking-[0.35em] text-white/10 text-center mt-1.5 uppercase flex-shrink-0">
            Anoce Magazine · Spring 2026 · 35mm
          </p>
        </div>
      </motion.div>

    </section>
  );
};
