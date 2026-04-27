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
    href: '/archive/gobi-ss2025',
  },
  {
    id: 2,
    frameId: '02',
    tag: 'Premium Cashmere',
    title: 'FW 2025 - Gobi',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=800&fit=crop&q=80',
    href: '/archive/gobi-fw2025',
  },
  {
    id: 3,
    frameId: '03',
    tag: 'Hand-Crafted Luxury',
    title: 'SS 2025 - Goyol',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop&q=80',
    href: '/archive/goyol-ss2025',
  },
  {
    id: 4,
    frameId: '04',
    tag: 'Timeless Meets Contemporary',
    title: 'Emerging - Michel&Amazonka',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=800&fit=crop&q=80',
    href: '/archive/michel-amazonka-ss2025',
  },
];

const CollectionTile = ({
  frame,
  featured = false,
  className = '',
  dimmed,
  onEnter,
  onLeave,
}: {
  frame: (typeof frames)[number];
  featured?: boolean;
  className?: string;
  dimmed: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) => (
  <Link
    href={frame.href}
    className={`group flex min-h-0 flex-col overflow-hidden rounded-[18px] border border-black/10 bg-[#111] transition-all duration-500 ${
      dimmed ? 'opacity-45' : 'opacity-100'
    } ${className}`}
    onMouseEnter={onEnter}
    onMouseLeave={onLeave}
  >
    <div className="relative min-h-0 flex-1 overflow-hidden bg-black">
      <Image
        src={frame.image}
        alt={frame.title}
        fill
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/22 via-transparent to-black/10" />
      <span className="absolute left-4 top-4 font-mono text-[9px] tracking-[0.18em] text-white/36">
        {frame.frameId}
      </span>
    </div>
    <div className="min-h-[6rem] border-t border-white/[0.08] bg-[#12100E] p-4 md:p-5">
      <p className="mb-2 truncate font-sans text-[8px] tracking-[0.2em] uppercase text-white/48">{frame.tag}</p>
      <h3 className={`line-clamp-2 font-serif leading-[1.08] text-white ${featured ? 'text-2xl' : 'text-xl'}`}>
        {frame.title}
      </h3>
    </div>
  </Link>
);

export const CollectionsGrid = () => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const isDimmed = (id: number) => hoveredId !== null && hoveredId !== id;

  return (
    <section className="relative flex h-full w-full flex-col overflow-hidden bg-[#EEE9E1] px-5 pb-6 pt-[128px] md:px-8 md:pt-[136px] lg:px-10">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.25 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6 flex shrink-0 flex-col gap-3 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <span className="mb-2 block font-sans text-[10px] tracking-[0.32em] uppercase text-[#7F756A]">
            Featured Collections
          </span>
          <h2 className="font-serif text-4xl leading-none text-[#1E1B18] md:text-5xl">
            Latest Collections
          </h2>
        </div>
        <Link
          href="/archive"
          className="inline-flex w-fit items-center gap-3 font-sans text-[10px] tracking-[0.24em] uppercase text-[#7F756A] transition-colors duration-300 hover:text-[#1E1B18]"
        >
          View All
          <span className="h-px w-8 bg-current" />
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="min-h-0 flex-1 overflow-hidden rounded-[22px] border border-black/10 bg-[#15120F] p-3 shadow-[0_28px_90px_rgba(19,14,11,0.22)] md:p-4"
      >
        <div className="grid h-full min-h-0 grid-cols-1 gap-3 md:grid-cols-4 md:grid-rows-2 md:gap-4">
          <CollectionTile
            frame={frames[0]}
            featured
            className="md:col-span-2 md:row-span-2"
            dimmed={isDimmed(frames[0].id)}
            onEnter={() => setHoveredId(frames[0].id)}
            onLeave={() => setHoveredId(null)}
          />

          {frames.slice(1).map((frame) => (
            <CollectionTile
              key={frame.id}
              frame={frame}
              dimmed={isDimmed(frame.id)}
              onEnter={() => setHoveredId(frame.id)}
              onLeave={() => setHoveredId(null)}
            />
          ))}

          <Link
            href="/archive"
            className={`group relative flex min-h-[14rem] items-center justify-center overflow-hidden rounded-[18px] border border-white/[0.08] bg-[#0D0B09] transition-all duration-500 ${
              hoveredId ? 'opacity-55' : 'opacity-100'
            }`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,201,184,0.13),transparent_62%)]" />
            <div className="relative z-10 text-center">
              <span className="mb-3 block font-sans text-[9px] tracking-[0.28em] uppercase text-white/32">
                New Season
              </span>
              <span className="block font-serif text-4xl font-bold leading-none text-[#EDE9E2] md:text-5xl">
                SS 2026
              </span>
              <span className="mx-auto mt-5 block h-px w-8 bg-white/18 transition-all duration-300 group-hover:w-12" />
            </div>
          </Link>
        </div>
      </motion.div>
    </section>
  );
};
