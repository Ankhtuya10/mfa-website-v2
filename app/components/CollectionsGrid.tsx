'use client';

import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const collections = [
  {
    id: 1,
    title: "Spring '26 Lookbook",
    description: 'Contemporary interpretations',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=1000&fit=crop&q=80',
    size: 'large',
  },
  {
    id: 2,
    title: 'FW 2025 — Gobi',
    description: 'Premium cashmere',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=600&fit=crop&q=80',
    size: 'small',
  },
  {
    id: 3,
    title: 'SS 2025 — Goyol',
    description: 'Hand-crafted luxury',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop&q=80',
    size: 'medium',
  },
  {
    id: 4,
    title: 'Emerging — Michel&Amazonka',
    description: 'Timeless meets contemporary',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=600&fit=crop&q=80',
    size: 'small',
  },
];

export const CollectionsGrid = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const titleY = useTransform(scrollYProgress, [0, 0.3], [40, -40]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);

  const image1Y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const image2Y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const image3Y = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const image4Y = useTransform(scrollYProgress, [0, 1], [0, -120]);

  return (
    <section
      ref={ref}
      className="relative w-full bg-[#F5F2ED] py-32 px-8 lg:px-16 overflow-hidden flex flex-col items-center"
    >
      {/* Parallax Background Elements */}
      <motion.div 
        className="absolute top-20 left-10 w-64 h-64 rounded-full bg-[#E8E3DB]/50 blur-3xl"
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, 200]) }}
      />
      <motion.div 
        className="absolute bottom-40 right-20 w-96 h-96 rounded-full bg-[#DCCEC1]/30 blur-3xl"
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, -150]) }}
      />

      {/* Section Title */}
      <motion.div
        style={{ y: titleY, opacity: titleOpacity }}
        className="text-center mb-20 relative z-10"
      >
        <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-[#9B9590] block mb-4">
          Featured Collections
        </span>
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#2A2522] leading-tight">
          Latest Collections
        </h2>
      </motion.div>

      {/* Magazine Grid Layout */}
      <div className="w-full max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-12 gap-4 lg:gap-6">
          
          {/* Large Featured Image - Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -80, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            style={{ y: image1Y }}
            className="col-span-12 lg:col-span-5 lg:row-span-2"
          >
            <div className="relative group overflow-hidden h-[500px] lg:h-[700px] cursor-pointer">
              <Image
                src={collections[0].image}
                alt={collections[0].title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out">
                <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-white/70 mb-2">
                  {collections[0].description}
                </p>
                <h3 className="font-serif text-3xl lg:text-4xl font-bold text-white mb-3">
                  {collections[0].title}
                </h3>
                <span className="inline-block w-12 h-px bg-white/50" />
              </div>
            </div>
          </motion.div>

          {/* Top Right - Small Image */}
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{ y: image2Y }}
            className="col-span-6 lg:col-span-3"
          >
            <div className="relative group overflow-hidden h-[240px] lg:h-[340px] cursor-pointer">
              <Image
                src={collections[1].image}
                alt={collections[1].title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out">
                <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-white/70 mb-1">
                  {collections[1].description}
                </p>
                <h3 className="font-serif text-xl lg:text-2xl font-semibold text-white">
                  {collections[1].title}
                </h3>
              </div>
            </div>
          </motion.div>

          {/* Top Right - Medium Image */}
          <motion.div
            initial={{ opacity: 0, y: -80, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ y: image3Y }}
            className="col-span-6 lg:col-span-4"
          >
            <div className="relative group overflow-hidden h-[240px] lg:h-[340px] cursor-pointer">
              <Image
                src={collections[2].image}
                alt={collections[2].title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out">
                <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-white/70 mb-1">
                  {collections[2].description}
                </p>
                <h3 className="font-serif text-xl lg:text-2xl font-semibold text-white">
                  {collections[2].title}
                </h3>
              </div>
            </div>
          </motion.div>

          {/* Bottom Row - Two Small Images */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ y: image4Y }}
            className="col-span-6 lg:col-span-4"
          >
            <div className="relative group overflow-hidden h-[200px] lg:h-[280px] cursor-pointer">
              <Image
                src={collections[3].image}
                alt={collections[3].title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out">
                <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-white/70 mb-1">
                  {collections[3].description}
                </p>
                <h3 className="font-serif text-lg lg:text-xl font-semibold text-white">
                  {collections[3].title}
                </h3>
              </div>
            </div>
          </motion.div>

          {/* Decorative Text Block */}
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="col-span-6 lg:col-span-3 flex items-center justify-center bg-[#2A2522] h-[200px] lg:h-[280px] group cursor-pointer"
          >
            <div className="text-center px-6 group-hover:scale-110 transition-transform duration-500">
              <span className="font-sans text-[9px] tracking-[0.3em] uppercase text-[#B7AEA9] block mb-2">New Season</span>
              <span className="font-serif text-4xl lg:text-5xl font-bold text-white block">SS 2026</span>
              <span className="inline-block w-8 h-px bg-[#B7AEA9] mt-4 mx-auto" />
            </div>
          </motion.div>

        </div>
      </div>

      {/* View All Link */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="text-center mt-20 relative z-10"
      >
        <a href="#" className="inline-flex items-center gap-4 font-sans text-[11px] tracking-[0.2em] uppercase text-[#2A2522] hover:text-[#555] transition-colors group">
          <span className="w-12 h-px bg-[#2A2522] group-hover:w-20 transition-all duration-300" />
          View All Collections
          <span className="w-12 h-px bg-[#2A2522] group-hover:w-20 transition-all duration-300" />
        </a>
      </motion.div>
    </section>
  );
};
