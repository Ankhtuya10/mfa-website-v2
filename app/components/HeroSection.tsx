'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export const HeroSection = () => {
  const bgImageUrl =
    'https://feiffroacxipvonvmecs.supabase.co/storage/v1/object/public/videos/images/jennie-complex-3840x2160-23175.jpg';
  const mediaVideoUrl = 'https://feiffroacxipvonvmecs.supabase.co/storage/v1/object/public/videos/jennie.mp4';

  const ref = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [viewport, setViewport] = useState({ width: 1440, height: 900 });

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    const handleScroll = () => {
      const scrollContainer = document.querySelector('.snap-container') as HTMLElement | null;
      const scrollTop = scrollContainer ? scrollContainer.scrollTop : window.scrollY;
      const viewportHeight = window.innerHeight || 1;
      const normalized = Math.min(Math.max(scrollTop / (viewportHeight * 0.9), 0), 1);
      setScrollProgress(normalized);
    };

    checkIsMobile();
    handleScroll();

    const scrollContainer = document.querySelector('.snap-container') as HTMLElement | null;
    const target: HTMLElement | Window = scrollContainer ?? window;

    target.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', checkIsMobile);
    window.addEventListener('resize', handleScroll);

    return () => {
      target.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkIsMobile);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const initialMediaWidth = isMobile ? 320 : 360;
  const initialMediaHeight = isMobile ? 420 : 520;
  const mediaWidth = initialMediaWidth + scrollProgress * (viewport.width - initialMediaWidth);
  const mediaHeight = initialMediaHeight + scrollProgress * (viewport.height - initialMediaHeight);
  const mediaRadius = Math.max(0, 24 - scrollProgress * 28);
  const textTranslate = scrollProgress * (isMobile ? 24 : 16);
  const textOpacity = Math.max(0, 1 - Math.max(0, (scrollProgress - 0.58) / 0.28));

  return (
    <div ref={ref} className="relative h-screen w-full overflow-hidden bg-[#0A0A0A]">
      <section className="relative flex h-full w-full flex-col items-center justify-center">
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.82 - scrollProgress * 0.65 }}
          transition={{ duration: 0.15 }}
        >
          <div
            className="h-full w-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${bgImageUrl})` }}
          />
          <div className="absolute inset-0 bg-black/45" />
        </motion.div>

        <div className="relative z-10 flex h-full w-full items-center justify-center px-6 md:px-10">
          <div
            className="absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 overflow-hidden"
            style={{
              width: `${mediaWidth}px`,
              height: `${mediaHeight}px`,
              maxWidth: '100vw',
              maxHeight: '100vh',
              borderRadius: `${mediaRadius}px`,
              boxShadow: '0px 0px 56px rgba(0, 0, 0, 0.42)',
            }}
          >
            <video
              src={mediaVideoUrl}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="h-full w-full object-cover object-center"
            />
            <motion.div
              className="absolute inset-0 bg-black/40"
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 0.5 - scrollProgress * 0.25 }}
              transition={{ duration: 0.2 }}
            />
          </div>

          <motion.div
            className="relative z-10 mx-auto flex w-full max-w-[860px] flex-col items-center text-center text-[#F4EEE8]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: textOpacity, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="w-full max-w-[980px] px-3 md:px-6">
              <p
                className="mb-2 font-sans text-[10px] font-semibold tracking-[4.2px] uppercase text-[#ECE2D7]/95 md:text-[11px]"
                style={{ transform: `translateX(-${textTranslate}vw)` }}
              >
                Spring Collection · 2026
              </p>
              <h1
                className="mb-5 font-serif text-[44px] leading-[0.96] tracking-tight md:text-[88px]"
                style={{ transform: `translateX(${textTranslate}vw)` }}
              >
                <span
                  className="block bg-gradient-to-b from-[#FCF6F0] via-[#F0E4D7] to-[#E2D4C6] bg-clip-text text-transparent"
                  style={{
                    textShadow: '0 8px 32px rgba(255, 255, 255, 0.18)',
                    WebkitTextStroke: '0.6px rgba(255,255,255,0.35)',
                  }}
                >
                  Beauty of
                </span>
                <span
                  className="block italic bg-gradient-to-b from-[#FFF4E8] via-[#EAD7C2] to-[#DCC4AB] bg-clip-text text-transparent"
                  style={{
                    textShadow: '0 10px 40px rgba(255, 255, 255, 0.22)',
                    WebkitTextStroke: '0.7px rgba(255,255,255,0.28)',
                  }}
                >
                  Mongolian Cashmere
                </span>
              </h1>
              <p
                className="mb-8 max-w-[760px] font-sans text-[14px] leading-[1.5] tracking-[0.01em] text-[#F4EBE4]/90 md:text-[15px]"
                style={{ transform: `translateX(-${textTranslate}vw)` }}
              >
                Woven from the finest inner fleece of Mongolian goats, each piece carries the silence
                of the steppe, a warmth that endures, and a softness that lasts a lifetime.
              </p>
              <div
                className="flex flex-row flex-wrap items-center justify-center gap-4 md:gap-6"
                style={{ transform: `translateX(${textTranslate}vw)` }}
              >
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-full bg-[#F4EEE8] px-8 py-3 font-sans text-[11px] font-semibold uppercase tracking-[3.5px] text-[#2A2521] shadow-[0_14px_34px_rgba(0,0,0,0.28)] transition-all duration-300 hover:bg-white"
                >
                  View Collection
                </motion.button>
                <motion.button
                  whileHover={{ opacity: 0.8, x: 5 }}
                  className="border-b border-[#F4EEE8]/40 pb-1 font-sans text-[11px] font-semibold uppercase tracking-[3.5px] text-[#F4EEE8]/90 transition-all duration-300 hover:border-[#F4EEE8] hover:text-[#F4EEE8]"
                >
                  Read Story
                </motion.button>
              </div>
            </div>
          </motion.div>

          <div className="absolute right-6 bottom-7 z-10 flex flex-row items-center gap-4 md:right-8">
            <span className="font-sans text-[10px] tracking-[3px] uppercase text-[#E9DED4]/72">
              Ulaanbaatar, Mongolia
            </span>
            <div className="h-1 w-1 rounded-full bg-[#E9DED4]/65" />
            <span className="font-sans text-[10px] tracking-[3px] uppercase text-[#E9DED4]/72">
              Est. 1998
            </span>
          </div>
        </div>
      </section>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="font-sans text-[9px] tracking-[3.6px] uppercase text-[#F4EEE8]/76">
          Scroll
        </span>
        <div className="h-[42px] w-px bg-gradient-to-b from-[#F4EEE8]/76 to-[#F4EEE8]/20" />
      </motion.div>
    </div>
  );
};
