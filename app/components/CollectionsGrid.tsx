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
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=1000&fit=crop&q=80',
    href: '/collections/spring-26',
    type: 'hero',
  },
  {
    id: 2,
    frameId: '02',
    tag: 'Premium Cashmere',
    title: 'FW 2025 — Gobi',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=600&fit=crop&q=80',
    href: '/collections/fw-2025-gobi',
    type: 'normal',
  },
  {
    id: 3,
    frameId: '03',
    tag: 'Hand-Crafted Luxury',
    title: 'SS 2025 — Goyol',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop&q=80',
    href: '/collections/ss-2025-goyol',
    type: 'normal',
  },
  {
    id: 4,
    frameId: '04',
    tag: 'Timeless Meets Contemporary',
    title: 'Emerging — Michel&Amazonka',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=600&fit=crop&q=80',
    href: '/collections/michel-amazonka',
    type: 'normal',
  },
  {
    id: 5,
    frameId: '05',
    tag: null,
    title: null,
    image: null,
    href: '/collections',
    type: 'season',
  },
];

export const CollectionsGrid = () => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const heroFrame = frames[0];
  const midTop = frames[1];
  const midBottom = frames[2];
  const rightTop = frames[3];
  const seasonBlock = frames[4];

  const getFrameClass = (id: number) => {
    if (hoveredId === null) return '';
    if (hoveredId === id) return 'brightness-110';
    return 'brightness-75 saturate-50';
  };

  return (
    <section className="relative w-full bg-[#F5F2ED] py-16 overflow-hidden">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-baseline justify-between mb-6"
      >
        <div>
          <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-[#9B9590] block mb-2">
            Featured Collections
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-[#2A2522] leading-tight">
            Latest Collections
          </h2>
        </div>
        <Link
          href="/collections"
          className="hidden md:flex items-center gap-3 font-sans text-[10px] tracking-[0.2em] uppercase text-[#9B9590] hover:text-[#2A2522] transition-colors duration-300 group"
        >
          <span className="w-8 h-px bg-[#9B9590] group-hover:bg-[#2A2522] group-hover:w-12 transition-all duration-300" />
          View All Collections
          <span className="w-8 h-px bg-[#9B9590] group-hover:bg-[#2A2522] group-hover:w-12 transition-all duration-300" />
        </Link>
      </motion.div>

      {/* Film wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.15 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="bg-[#1a1815] p-3 w-full"
      >
        {/* Grid: 3 cols, 2 rows */}
        <div
          className="grid gap-[3px] w-full"
          style={{
            gridTemplateColumns: '1.8fr 1fr 1fr',
            gridTemplateRows: 'repeat(2, minmax(200px, 1fr))',
          }}
        >
          {/* LEFT — hero spans 2 rows */}
          <Link
            href={heroFrame.href}
            className={`relative overflow-hidden group transition-all duration-500 ${getFrameClass(heroFrame.id)}`}
            style={{ gridRow: 'span 2' }}
            onMouseEnter={() => setHoveredId(heroFrame.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="relative w-full h-full">
              <Image
                src={heroFrame.image!}
                alt={heroFrame.title!}
                fill
                className="object-cover transition-transform duration-600 group-hover:scale-[1.03]"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
            <span className="absolute top-2 left-2 z-10 font-mono text-[9px] tracking-[0.1em] text-white/30">
              {heroFrame.frameId}
            </span>
            <div className="absolute inset-0 border border-white/[0.07] z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 p-4 z-10">
              <p className="font-sans text-[9px] tracking-[0.18em] uppercase text-white/55 mb-1">
                {heroFrame.tag}
              </p>
              <h3 className="font-serif text-xl lg:text-2xl text-white font-normal">
                {heroFrame.title}
              </h3>
            </div>
          </Link>

          {/* MIDDLE TOP */}
          <Link
            href={midTop.href}
            className={`relative overflow-hidden group transition-all duration-500 ${getFrameClass(midTop.id)}`}
            onMouseEnter={() => setHoveredId(midTop.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="relative w-full h-full">
              <Image
                src={midTop.image!}
                alt={midTop.title!}
                fill
                className="object-cover transition-transform duration-600 group-hover:scale-[1.03]"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
            <span className="absolute top-2 left-2 z-10 font-mono text-[9px] tracking-[0.1em] text-white/30">
              {midTop.frameId}
            </span>
            <div className="absolute inset-0 border border-white/[0.07] z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 p-3 z-10">
              <p className="font-sans text-[9px] tracking-[0.18em] uppercase text-white/55 mb-1">
                {midTop.tag}
              </p>
              <h3 className="font-serif text-base text-white font-normal">
                {midTop.title}
              </h3>
            </div>
          </Link>

          {/* RIGHT TOP */}
          <Link
            href={rightTop.href}
            className={`relative overflow-hidden group transition-all duration-500 ${getFrameClass(rightTop.id)}`}
            onMouseEnter={() => setHoveredId(rightTop.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="relative w-full h-full">
              <Image
                src={rightTop.image!}
                alt={rightTop.title!}
                fill
                className="object-cover transition-transform duration-600 group-hover:scale-[1.03]"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
            <span className="absolute top-2 left-2 z-10 font-mono text-[9px] tracking-[0.1em] text-white/30">
              {rightTop.frameId}
            </span>
            <div className="absolute inset-0 border border-white/[0.07] z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 p-3 z-10">
              <p className="font-sans text-[9px] tracking-[0.18em] uppercase text-white/55 mb-1">
                {rightTop.tag}
              </p>
              <h3 className="font-serif text-base text-white font-normal">
                {rightTop.title}
              </h3>
            </div>
          </Link>

          {/* MIDDLE BOTTOM */}
          <Link
            href={midBottom.href}
            className={`relative overflow-hidden group transition-all duration-500 ${getFrameClass(midBottom.id)}`}
            onMouseEnter={() => setHoveredId(midBottom.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="relative w-full h-full">
              <Image
                src={midBottom.image!}
                alt={midBottom.title!}
                fill
                className="object-cover transition-transform duration-600 group-hover:scale-[1.03]"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
            <span className="absolute top-2 left-2 z-10 font-mono text-[9px] tracking-[0.1em] text-white/30">
              {midBottom.frameId}
            </span>
            <div className="absolute inset-0 border border-white/[0.07] z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 p-3 z-10">
              <p className="font-sans text-[9px] tracking-[0.18em] uppercase text-white/55 mb-1">
                {midBottom.tag}
              </p>
              <h3 className="font-serif text-base text-white font-normal">
                {midBottom.title}
              </h3>
            </div>
          </Link>

          {/* BOTTOM RIGHT — SS 2026 season block */}
          <Link
            href={seasonBlock.href}
            className={`relative overflow-hidden group transition-all duration-500 bg-[#111] flex flex-col items-center justify-center gap-2 ${getFrameClass(seasonBlock.id)}`}
            onMouseEnter={() => setHoveredId(seasonBlock.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <span className="absolute top-2 left-2 z-10 font-mono text-[9px] tracking-[0.1em] text-white/30">
              {seasonBlock.frameId}
            </span>
            <div className="absolute inset-0 border border-white/[0.07] z-10 pointer-events-none" />
            <div className="text-center transition-transform duration-500 group-hover:scale-105">
              <span className="font-sans text-[9px] tracking-[0.22em] uppercase text-[#555] block mb-2">
                New Season
              </span>
              <span className="font-serif text-3xl lg:text-4xl font-bold text-[#f0ede6] block">
                SS 2026
              </span>
              <span className="block w-5 h-px bg-[#444] mx-auto mt-3" />
            </div>
          </Link>
        </div>

        {/* Film caption */}
        <p className="font-mono text-[8px] tracking-[0.3em] text-white/20 text-center mt-2 uppercase">
          Anoce Magazine · Spring 2026 · 35mm
        </p>
      </motion.div>

      {/* Mobile view all */}
      <div className="flex md:hidden justify-center mt-8">
        <Link
          href="/collections"
          className="flex items-center gap-4 font-sans text-[11px] tracking-[0.2em] uppercase text-[#2A2522] hover:text-[#9B9590] transition-colors duration-300 group"
        >
          <span className="w-8 h-px bg-current group-hover:w-12 transition-all duration-300" />
          View All Collections
          <span className="w-8 h-px bg-current group-hover:w-12 transition-all duration-300" />
        </Link>
      </div>

    </section>
  );
};
