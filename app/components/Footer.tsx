'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export const Footer = () => {
  return (
    <footer className="relative w-full h-screen bg-[#0F0F0F] text-gray-300 flex flex-col justify-between py-8">

      {/* Brand block — fully centered */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center justify-center text-center pt-20 pb-12 px-8 border-b border-white/[0.06]"
      >
        <span className="font-serif font-bold text-6xl lg:text-8xl text-white mb-4 hover:text-[#F5F2ED] transition-colors duration-500 cursor-default">
          Anoce
        </span>
        <p className="font-sans text-sm text-[#555] leading-relaxed max-w-sm tracking-wide">
          Celebrating Mongolian heritage through contemporary design and exceptional craftsmanship.
        </p>
        <div className="w-px h-8 bg-gradient-to-b from-[#333] to-transparent mt-10" />
      </motion.div>

      {/* Columns */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-10 px-8 lg:px-24 py-14 border-b border-white/[0.06]"
      >
        {/* Explore */}
        <div>
          <h4 className="font-sans text-[9px] uppercase tracking-[0.22em] text-[#555] mb-5">
            Explore
          </h4>
          <ul className="space-y-3">
            {[['Home', '/'], ['Collections', '/collections'], ['Editorial', '/editorial'], ['Contact', '/contact']].map(([label, href]) => (
              <li key={label}>
                <Link href={href} className="font-sans text-sm text-[#777] hover:text-white transition-colors duration-300">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="font-sans text-[9px] uppercase tracking-[0.22em] text-[#555] mb-5">
            Support
          </h4>
          <ul className="space-y-3">
            {['Shipping', 'Returns', 'FAQ', 'Contact'].map((item) => (
              <li key={item}>
                <Link href="#" className="font-sans text-sm text-[#777] hover:text-white transition-colors duration-300">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-sans text-[9px] uppercase tracking-[0.22em] text-[#555] mb-5">
            Company
          </h4>
          <ul className="space-y-3">
            {['About', 'Careers', 'Press', 'Journal'].map((item) => (
              <li key={item}>
                <Link href="#" className="font-sans text-sm text-[#777] hover:text-white transition-colors duration-300">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="font-sans text-[9px] uppercase tracking-[0.22em] text-[#555] mb-5">
            Newsletter
          </h4>
          <p className="font-sans text-sm text-[#555] mb-4 leading-relaxed">
            Subscribe for updates.
          </p>
          <div className="flex flex-col gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full px-4 py-2.5 bg-transparent border border-[#2a2a2a] text-gray-200 placeholder-[#3a3a3a] font-sans text-sm focus:outline-none focus:border-[#555] transition-all duration-300"
            />
            <button className="w-full px-6 py-2.5 bg-[#F5F2ED] text-[#0F0F0F] font-sans text-[10px] font-semibold uppercase tracking-widest hover:bg-white transition-all duration-300">
              Subscribe
            </button>
          </div>
        </div>
      </motion.div>

      {/* Bottom bar */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col md:flex-row items-center justify-between gap-4 px-8 lg:px-24 py-7"
      >
        <p className="font-sans text-xs text-[#3a3a3a] tracking-wide">
          © 2026 Anoce. All rights reserved.
        </p>

        <div className="flex items-center gap-6">
          {['Instagram', 'LinkedIn', 'Twitter', 'TikTok'].map((s) => (
            <Link key={s} href="#" className="font-sans text-[11px] text-[#444] hover:text-[#888] transition-colors duration-300">
              {s}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <Link href="#" className="font-sans text-[10px] uppercase tracking-widest text-[#3a3a3a] hover:text-[#666] transition-colors duration-300">
            Privacy
          </Link>
          <Link href="#" className="font-sans text-[10px] uppercase tracking-widest text-[#3a3a3a] hover:text-[#666] transition-colors duration-300">
            Terms
          </Link>
        </div>
      </motion.div>

    </footer>
  );
};