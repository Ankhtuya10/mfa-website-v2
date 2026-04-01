'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export const DiscoverSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen w-full bg-[#F5F2ED] py-32 px-8 lg:px-16 flex items-center justify-center"
    >
      <div className="w-full max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <motion.span 
            style={{ y }}
            className="font-sans text-[10px] tracking-[0.3em] uppercase text-[#9B9590] mb-8 block"
          >
            Curated Collection
          </motion.span>

          <motion.h2 
            style={{ y }}
            className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-[#2A2522] mb-8 leading-tight"
          >
            Discover Modern Elegance
          </motion.h2>

          <motion.p 
            style={{ y, opacity }}
            className="font-sans text-base md:text-lg text-[#7A7470] mb-12 font-normal leading-relaxed max-w-2xl mx-auto"
          >
            Our curated selection celebrates contemporary design rooted in the heritage of the Mongolian steppe. 
            Each piece tells a story of innovation meeting tradition — timeless luxury for the modern world.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#030213] text-white px-8 py-4 font-sans text-[12px] uppercase tracking-wider rounded-[10px] hover:opacity-80 transition-opacity"
          >
            Shop Now
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};
