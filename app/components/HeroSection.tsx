'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRef } from 'react';

export const HeroSection = () => {
  const ref = useRef(null);

  const childVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, delay: 0.4 + (i * 0.15) }
    })
  };

  return (
    <div ref={ref} className="relative h-screen w-full overflow-hidden">
      <div className="flex flex-col md:flex-row h-full w-full">
        
        {/* LEFT PANEL - 60% width */}
        <div className="relative w-full md:w-[60%] h-[50vh] md:h-full bg-[#0A0A0A]">
          <div className="relative w-full h-full">
            <Image
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=1200&fit=crop&q=90"
              alt="Mongolian Cashmere"
              fill
              priority
              className="object-cover"
            />
          </div>

          {/* Rotated sidebar text */}
          <div className="absolute left-[3%] top-1/2 -translate-y-1/2 hidden md:block">
            <span 
              className="font-sans font-extralight text-[10px] tracking-[3.5px] uppercase text-[#252525]"
              style={{ transform: 'rotate(-90deg)', display: 'block', whiteSpace: 'nowrap' }}
            >
              Mongolian Highlands — Spring Collection 2026
            </span>
          </div>
        </div>

        {/* RIGHT PANEL - 40% width */}
        <div
          className="relative w-full md:w-[40%] h-[50vh] md:h-full flex items-center"
          style={{
            background: 'linear-gradient(210deg, #DCCEC1 15%, #F9F2EC 39%, #FFFBF8 56%, #EAEAEA 77%)'
          }}
        >
          {/* Thin left accent bar */}
          <div 
            className="absolute left-0 top-[10%] h-[40%] w-[3px]"
            style={{
              background: 'linear-gradient(to bottom, rgba(3,2,19,0), rgba(112,112,112,0))'
            }}
          />

          {/* Main content */}
          <motion.div
            className="px-12 md:px-[70px] w-full text-center"
          >
            {/* Eyebrow */}
            <motion.span
              custom={0}
              variants={childVariants}
              initial="hidden"
              animate="visible"
              className="font-sans font-bold text-[11px] tracking-[4.95px] uppercase text-[#B7AEA9] mb-10"
            >
              Spring Collection  ·  2026
            </motion.span>

            {/* Heading */}
            <motion.h1
              custom={1}
              variants={childVariants}
              initial="hidden"
              animate="visible"
              className="font-serif font-normal text-[48px] md:text-[66px] leading-[1.05] tracking-[-0.01em] mb-4"
            >
              <span className="block text-[#B7AEA9]">Dadadu</span>
              <span className="block text-[#B7AEA9]">of <em className="text-[#393931] italic">Mongolian</em></span>
              <span className="block text-[#B7AEA9]">Cashmere</span>
            </motion.h1>

            {/* Body text */}
            <motion.p
              custom={2}
              variants={childVariants}
              initial="hidden"
              animate="visible"
              className="font-sans font-normal text-[15px] leading-[1.9] text-[#B7AEA9] max-w-[480px] text-center mb-12"
            >
              Woven from the finest inner fleece of Mongolian goats, each piece carries the silence of the steppe — a warmth that endures, a softness that lasts a lifetime.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              custom={3}
              variants={childVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-row gap-8 items-center justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#393931] px-10 py-3 text-white font-sans font-bold text-[11px] tracking-[4px] uppercase"
              >
                VIEW COLLECTION
              </motion.button>

              <motion.button
                whileHover={{ opacity: 0.7 }}
                className="font-sans font-bold text-[11px] tracking-[3.5px] uppercase text-[#B7AEA9] pb-0.5 border-b border-[#B7AEA9]"
              >
                READ STORY
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Scroll indicator - bottom center */}
          <div className="absolute bottom-8 left-[60%] -translate-x-1/2 hidden md:flex flex-col items-center gap-2">
            <div className="w-px h-[36px] bg-gradient-to-b from-[#C6F135] to-transparent" />
            <span className="font-sans text-[9px] tracking-[3.6px] uppercase text-[rgba(198,241,53,0.5)]">
              SCROLL
            </span>
          </div>

          {/* Location tag - bottom right */}
          <div className="absolute bottom-6 right-6 flex flex-row gap-4 items-center">
            <span className="font-sans text-[10px] tracking-[3px] uppercase text-[rgba(255,255,255,0.3)]">
              Ulaanbaatar, Mongolia
            </span>
            <div className="w-1 h-1 rounded-full bg-[#FF3CAC]" />
            <span className="font-sans text-[10px] tracking-[3px] uppercase text-[rgba(255,255,255,0.3)]">
              Est. 1998
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
