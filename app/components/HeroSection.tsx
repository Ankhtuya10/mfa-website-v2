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
      transition: { duration: 0.7, delay: 0.4 + i * 0.15 },
    }),
  };

  return (
    <div ref={ref} className="relative h-screen w-full overflow-hidden">
      <div className="flex flex-col md:flex-row h-full w-full">

        {/* LEFT PANEL — 60% */}
        <div className="relative h-[50vh] w-full bg-[#0A0A0A] md:h-full md:w-[60%]">
          <div className="relative w-full h-full">
            <Image
              src="https://feiffroacxipvonvmecs.supabase.co/storage/v1/object/sign/videos/images/pexels-aagii-aagii-494659827-16010457.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9kNTdjZGJjYi0wNzRmLTQyMGMtOGJmMS1iY2MyZTI2NzkyODciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MvaW1hZ2VzL3BleGVscy1hYWdpaS1hYWdpaS00OTQ2NTk4MjctMTYwMTA0NTcuanBnIiwiaWF0IjoxNzc1MDUxNDk0LCJleHAiOjE3Nzc2NDM0OTR9.LKF0BalPkfNtet7pmvN0jMDvNWv6azlFPg5S-py5AiQ"
              alt="Mongolian Cashmere"
              fill
              priority
              className="object-cover object-center"
            />
          </div>

          {/* Rotated sidebar text — fixed to white/20 so it reads on dark photo */}
          <div className="absolute left-[3%] top-1/2 -translate-y-1/2 hidden md:block">
            <span
              className="font-sans font-extralight text-[10px] tracking-[3.5px] uppercase text-white/20"
              style={{ transform: 'rotate(-90deg)', display: 'block', whiteSpace: 'nowrap' }}
            >
              Mongolian Highlands — Spring Collection 2026
            </span>
          </div>
        </div>

        {/* RIGHT PANEL — 40% */}
        <div
          className="relative flex h-[50vh] w-full items-center md:h-full md:w-[40%]"
          style={{
            background: 'linear-gradient(210deg, #DCCEC1 15%, #F9F2EC 39%, #FFFBF8 56%, #EAEAEA 77%)',
          }}
        >
          {/* Main content */}
          <motion.div className="flex h-full w-full items-center justify-center px-8 md:px-10 lg:px-12">
            <div className="mx-auto flex w-full max-w-[30rem] flex-col justify-center text-center md:max-w-[32rem]">

            <motion.span
              custom={0}
              variants={childVariants}
              initial="hidden"
              animate="visible"
              className="mb-8 block font-sans text-[11px] font-bold tracking-[4.95px] uppercase text-[#8F837A]"
            >
              Spring Collection · 2026
            </motion.span>

            <motion.h1
              custom={1}
              variants={childVariants}
              initial="hidden"
              animate="visible"
              className="mb-5 font-serif text-[48px] font-normal leading-[1.1] tracking-[-0.0em] text-[#A4968D] md:text-[66px]"
            >
              <span className="block">Beauty</span>
              <span className="block">
                of <em className="text-[#2F2B27] italic">Mongolian</em>
              </span>
              <span className="block">Cashmere</span>
            </motion.h1>

            <motion.p
              custom={2}
              variants={childVariants}
              initial="hidden"
              animate="visible"
              className="mb-12  font-sans text-[15px] font-normal leading-[1.1] tracking-[0em] text-[#7F756F]"
            >
              Woven from the finest inner fleece of Mongolian goats, each piece carries the silence
              of the steppe — a warmth that endures, a softness that lasts a lifetime.
            </motion.p>

            <motion.div
              custom={3}
              variants={childVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-row flex-wrap items-center justify-center gap-4 md:gap-6"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-full bg-[#2F2B27] px-8 py-3 font-sans text-[11px] font-bold uppercase tracking-[3.5px] text-white shadow-[0_14px_34px_rgba(47,43,39,0.22)] transition-all duration-300 hover:bg-[#1F1C19]"
              >
                View Collection
              </motion.button>

              <motion.button
                whileHover={{ opacity: 0.8, x: 5 }}
                className="border-b border-[#8F837A]/35 pb-1 font-sans text-[11px] font-bold uppercase tracking-[3.5px] text-[#7F756F] transition-all duration-300 hover:border-[#2F2B27] hover:text-[#2F2B27]"
              >
                Read Story
              </motion.button>
            </motion.div>
            </div>
          </motion.div>

          {/* Location tag — fixed dot from #FF3CAC to #B7AEA9 */}
          <div className="absolute bottom-6 right-6 flex flex-row items-center gap-4">
            <span className="font-sans text-[10px] tracking-[3px] uppercase text-[#6E6660]">
              Ulaanbaatar, Mongolia
            </span>
            <div className="h-1 w-1 rounded-full bg-[#8F837A]" />
            <span className="font-sans text-[10px] tracking-[3px] uppercase text-[#6E6660]">
              Est. 1998
            </span>
          </div>
        </div>

      </div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="font-sans text-[9px] tracking-[3.6px] uppercase text-[#5D544E]">
          Scroll
        </span>
        <div className="h-[42px] w-px bg-gradient-to-b from-[#5D544E] to-[#5D544E]/30" />
      </motion.div>
    </div>
  );
};
