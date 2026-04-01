'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const VIDEO_URL = 'https://feiffroacxipvonvmecs.supabase.co/storage/v1/object/sign/videos/bgvideo.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9kNTdjZGJjYi0wNzRmLTQyMGMtOGJmMS1iY2MyZTI2NzkyODciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MvYmd2aWRlby5tcDQiLCJpYXQiOjE3NzUwNDMzMjgsImV4cCI6MTc3NzYzNTMyOH0.w7f3PfveB_IMtv5ye_Kth_jbuZ5CZEXHDUzCZGaavWU';

export const DiscoverSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
    >
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={VIDEO_URL} type="video/mp4" />
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/38" />

      {/* Content */}
      <div className="w-full max-w-4xl text-center px-8 py-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: false, amount: 0.3 }}
          className="flex flex-col items-center px-8 py-12 md:px-12"
        >
          {/* Top rule */}
          <motion.span
            style={{ y, opacity }}
            className="block w-8 h-px bg-white/40 mx-auto mb-8"
          />

          {/* Eyebrow */}
          <motion.span
            style={{ y }}
            className="font-sans text-[10px] tracking-[0.3em] uppercase text-white/70 mb-8 block"
          >
            Curated Collection
          </motion.span>

          {/* Heading */}
          <motion.h2
            style={{ y }}
            className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight [text-shadow:0_8px_30px_rgba(0,0,0,0.25)]"
          >
            Discover Modern Elegance
          </motion.h2>

          {/* Body */}
          <motion.p
            style={{ y, opacity }}
            className="font-sans text-base md:text-lg text-white/82 mb-14 font-normal leading-relaxed max-w-2xl mx-auto [text-shadow:0_6px_20px_rgba(0,0,0,0.22)]"
          >
            Our curated selection celebrates contemporary design rooted in the heritage of the
            Mongolian steppe. Each piece tells a story of innovation meeting tradition — timeless
            luxury for the modern world.
          </motion.p>

          {/* CTA links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: false, amount: 0.3 }}
            className="flex items-center gap-6"
          >
            <Link
              href="/collections"
              className="rounded-full border border-white/25 bg-black/22 px-6 py-3 font-sans text-[11px] tracking-[0.15em] uppercase text-white hover:bg-black/30 hover:text-white/80 transition-all duration-300"
            >
              Explore Collection
            </Link>
            <span className="text-white/40 text-xs">·</span>
            <Link
              href="/editorial"
              className="rounded-full border border-white/18 bg-black/18 px-6 py-3 font-sans text-[11px] tracking-[0.15em] uppercase text-white/68 hover:bg-black/26 hover:text-white transition-colors duration-300"
            >
              Read the Story
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
        <span className="font-sans text-[9px] tracking-[0.2em] uppercase text-white/40">
          Scroll
        </span>
        <div className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </section>
  );
};
