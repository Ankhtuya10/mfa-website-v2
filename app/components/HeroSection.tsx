'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export const HeroSection = () => {
  const bgImageUrl =
    'https://feiffroacxipvonvmecs.supabase.co/storage/v1/object/public/videos/images/jennie-complex-3840x2160-23175.jpg';
  const mediaVideoUrl =
    'https://feiffroacxipvonvmecs.supabase.co/storage/v1/object/public/videos/images/jennieklunklun.mp4';

  const ref = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [viewport, setViewport] = useState({ width: 1440, height: 900 });
  const [isHeroHovered, setIsHeroHovered] = useState(false);

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

  const initialMediaWidth = isMobile ? 270 : 315;
  const initialMediaHeight = isMobile ? 360 : 450;
  const mediaWidth = initialMediaWidth + scrollProgress * (viewport.width - initialMediaWidth);
  const mediaHeight = initialMediaHeight + scrollProgress * (viewport.height - initialMediaHeight);
  const mediaRadius = Math.max(0, 14 - scrollProgress * 18);
  const textOpacity = Math.max(0, 1 - Math.max(0, (scrollProgress - 0.58) / 0.28));
  const mediaOverlayOpacity = Math.max(
    0.18,
    (isHeroHovered ? 0.22 : 0.3) - scrollProgress * 0.12
  );
  const titleLetterSpacing = isHeroHovered ? '0.32em' : '0.28em';

  return (
    <div ref={ref} className="relative h-screen w-full overflow-hidden bg-[#0A0A0A]">
      <section className="relative flex h-full w-full flex-col items-center justify-center">
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.84 - scrollProgress * 0.66 }}
          transition={{ duration: 0.15 }}
        >
          {/* Very slow background zoom gives the still image a cinematic breath. */}
          <motion.div
            className="h-full w-full bg-cover bg-center bg-no-repeat"
            animate={{ scale: [1, 1.035, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            style={{ backgroundImage: `url(${bgImageUrl})` }}
          />
          <div className="absolute inset-0 bg-black/48" />
          {/* Soft vignette keeps the frame dark, mysterious, and editorial. */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.42)_58%,rgba(0,0,0,0.78)_100%)]" />
        </motion.div>

        <div className="safe-shell relative z-10 flex h-full w-full items-center justify-center">
          {/* Low-opacity glow integrates the center media into the background. */}
          <div
            className="pointer-events-none absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 blur-3xl"
            style={{
              width: `${mediaWidth * 1.65}px`,
              height: `${mediaHeight * 1.2}px`,
              maxWidth: '120vw',
              maxHeight: '110vh',
              background:
                'radial-gradient(circle, rgba(212, 201, 184, 0.14) 0%, rgba(176, 142, 104, 0.07) 38%, rgba(10, 10, 10, 0) 70%)',
              opacity: 0.36 - scrollProgress * 0.16,
            }}
          />

          <div
            className="absolute top-1/2 left-1/2 z-[1] -translate-x-1/2 -translate-y-1/2"
            style={{
              width: `${mediaWidth}px`,
              height: `${mediaHeight}px`,
              maxWidth: '100vw',
              maxHeight: '100vh',
            }}
          >
            {/* Slow float and darker blending keep the media subtle, not pasted on. */}
            <motion.div
              className="h-full w-full overflow-hidden"
              animate={{
                y: [0, isMobile ? -5 : -8, 0],
                scale: [1, 1.01, 1],
              }}
              transition={{ duration: 9.5, repeat: Infinity, ease: 'easeInOut' }}
              onMouseEnter={() => setIsHeroHovered(true)}
              onMouseLeave={() => setIsHeroHovered(false)}
              style={{
                borderRadius: `${mediaRadius}px`,
                boxShadow: isHeroHovered
                  ? '0px 0px 46px rgba(212, 201, 184, 0.12), 0px 22px 72px rgba(0, 0, 0, 0.46)'
                  : '0px 0px 34px rgba(0, 0, 0, 0.34)',
                filter: isHeroHovered
                  ? 'brightness(1.06) contrast(1.04) saturate(1)'
                  : 'brightness(0.96) contrast(1.04) saturate(0.96)',
                opacity: 1,
                transition:
                  'filter 700ms ease, opacity 700ms ease, box-shadow 700ms ease, border-radius 180ms ease',
              }}
            >
              <video
                src={mediaVideoUrl}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster={bgImageUrl}
                className="h-full w-full object-cover object-center"
              />
              <motion.div
                className="absolute inset-0 bg-black/40"
                initial={{ opacity: 0.72 }}
                animate={{ opacity: mediaOverlayOpacity }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </div>

          <motion.div
            className="relative z-10 mx-auto flex w-full items-center justify-center text-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: textOpacity, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={() => setIsHeroHovered(true)}
            onMouseLeave={() => setIsHeroHovered(false)}
          >
            {/* The wordmark stays above the media so ANOCE remains the hero focus. */}
            <motion.h1
              className="anoce-wordmark text-[58px] sm:text-[78px] md:text-[112px] lg:text-[136px]"
              animate={{
                scale: 1 - scrollProgress * 0.05,
                opacity: textOpacity,
              }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{
                color: isHeroHovered ? '#E8DCCB' : '#D4C9B8',
                letterSpacing: titleLetterSpacing,
                paddingLeft: titleLetterSpacing,
                textShadow: isHeroHovered
                  ? '0 14px 42px rgba(212, 201, 184, 0.16), 0 28px 84px rgba(0, 0, 0, 0.82)'
                  : '0 18px 64px rgba(0, 0, 0, 0.86)',
                transition:
                  'color 700ms ease, letter-spacing 700ms ease, padding-left 700ms ease, text-shadow 700ms ease',
              }}
            >
              ANOCE
            </motion.h1>
          </motion.div>
        </div>
      </section>

      {/* Restored minimal scroll cue from the original hero composition. */}
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

      {/* Pure-CSS grain adds subtle texture while staying non-interactive. */}
      <div className="hero-grain absolute inset-0 z-30" aria-hidden="true" />
    </div>
  );
};
