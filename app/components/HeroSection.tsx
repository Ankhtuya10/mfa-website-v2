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
        <div className="relative w-full md:w-[60%] h-[50vh] md:h-full bg-[#0A0A0A]">
          <div className="relative w-full h-full">
            <Image
              src="https://feiffroacxipvonvmecs.supabase.co/storage/v1/object/sign/videos/images/pexels-aagii-aagii-494659827-16010457.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9kNTdjZGJjYi0wNzRmLTQyMGMtOGJmMS1iY2MyZTI2NzkyODciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MvaW1hZ2VzL3BleGVscy1hYWdpaS1hYWdpaS00OTQ2NTk4MjctMTYwMTA0NTcuanBnIiwiaWF0IjoxNzc1MDUxNDk0LCJleHAiOjE3Nzc2NDM0OTR9.LKF0BalPkfNtet7pmvN0jMDvNWv6azlFPg5S-py5AiQ"
              alt="Mongolian Cashmere"
              fill
              priority
              className="object-cover"
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
          className="relative w-full md:w-[40%] h-[50vh] md:h-full flex items-center"
          style={{
            background: 'linear-gradient(210deg, #DCCEC1 15%, #F9F2EC 39%, #FFFBF8 56%, #EAEAEA 77%)',
          }}
        >
          {/* Main content */}
          <motion.div className="px-12 md:px-[70px] w-full text-center">

            <motion.span
              custom={0}
              variants={childVariants}
              initial="hidden"
              animate="visible"
              className="font-sans font-bold text-[11px] tracking-[4.95px] uppercase text-[#B7AEA9] mb-10 block"
            >
              Spring Collection · 2026
            </motion.span>

            <motion.h1
              custom={1}
              variants={childVariants}
              initial="hidden"
              animate="visible"
              className="font-serif font-normal text-[48px] md:text-[66px] leading-[1.05] tracking-[-0.01em] mb-4"
            >
              <span className="block text-[#B7AEA9]">Beauty</span>
              <span className="block text-[#B7AEA9]">
                of <em className="text-[#393931] italic">Mongolian</em>
              </span>
              <span className="block text-[#B7AEA9]">Cashmere</span>
            </motion.h1>

            <motion.p
              custom={2}
              variants={childVariants}
              initial="hidden"
              animate="visible"
              className="font-sans font-normal text-[15px] leading-[1.9] text-[#B7AEA9] leading-[1.05] tracking-[-0.01em] mb-12"
            >
              Woven from the finest inner fleece of Mongolian goats, each piece carries the silence
              of the steppe — a warmth that endures, a softness that lasts a lifetime.
            </motion.p>

            <motion.div
              custom={3}
              variants={childVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-row gap-8 items-center justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-[#393931] px-10 py-3 text-white font-sans font-bold text-[11px] tracking-[4px] uppercase shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                View Collection
              </motion.button>

              <motion.button
                whileHover={{ opacity: 0.8, x: 5 }}
                className="font-sans font-bold text-[11px] tracking-[3.5px] uppercase text-[#B7AEA9] pb-0.5 border-b border-[#B7AEA9] hover:border-[#393931] transition-all duration-300"
              >
                Read Story
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Scroll indicator — fixed from lime #C6F135 to warm #B7AEA9 */}
          <div className="absolute bottom-8 left-[60%] -translate-x-1/2 hidden md:flex flex-col items-center gap-2">
            <div className="w-px h-[36px] bg-gradient-to-b from-[#B7AEA9] to-transparent animate-pulse" />
            <span className="font-sans text-[9px] tracking-[3.6px] uppercase text-[#B7AEA9]/50 animate-pulse">
              Scroll
            </span>
          </div>

          {/* Location tag — fixed dot from #FF3CAC to #B7AEA9 */}
          <div className="absolute bottom-6 right-6 flex flex-row gap-4 items-center">
            <span className="font-sans text-[10px] tracking-[3px] uppercase text-white/30">
              Ulaanbaatar, Mongolia
            </span>
            <div className="w-1 h-1 rounded-full bg-[#B7AEA9]" />
            <span className="font-sans text-[10px] tracking-[3px] uppercase text-white/30">
              Est. 1998
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
