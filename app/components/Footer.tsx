'use client';

import { motion } from 'framer-motion';

export const Footer = () => {
  return (
    <footer className="relative w-full bg-[#0F0F0F] text-gray-300 mt-auto">
      <div className="w-full pl-[15%]">
        {/* Upper Section - Brand & Description */}
        <div className="py-20 px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center justify-center text-center"
          >
            <span className="font-serif font-bold text-7xl lg:text-8xl text-white mb-6">Anoce</span>
            <p className="font-sans text-sm text-gray-400 font-light leading-relaxed max-w-xl tracking-wide mb-10">
              Celebrating Mongolian heritage through contemporary design and exceptional craftsmanship.
            </p>
            <div className="w-px h-10 bg-gradient-to-b from-[#B7AEA9] to-transparent" />
          </motion.div>
        </div>

        {/* Middle Section - Links & Newsletter */}
        <div className="py-12 px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 justify-items-center">
            {/* Column 1 - Explore */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <h4 className="font-sans text-[10px] uppercase font-semibold tracking-[0.25em] text-gray-200 mb-5">
                Explore
              </h4>
              <ul className="space-y-3">
                <li><span className="font-sans text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">Home</span></li>
                <li><span className="font-sans text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">Collections</span></li>
                <li><span className="font-sans text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">Editorial</span></li>
                <li><span className="font-sans text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">Contact</span></li>
              </ul>
            </motion.div>

            {/* Column 2 - Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col items-center text-center"
            >
              <h4 className="font-sans text-[10px] uppercase font-semibold tracking-[0.25em] text-gray-200 mb-5">
                Support
              </h4>
              <ul className="space-y-3">
                <li><span className="font-sans text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">Shipping</span></li>
                <li><span className="font-sans text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">Returns</span></li>
                <li><span className="font-sans text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">FAQ</span></li>
                <li><span className="font-sans text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">Contact</span></li>
              </ul>
            </motion.div>

            {/* Column 3 - Company */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col items-center text-center"
            >
              <h4 className="font-sans text-[10px] uppercase font-semibold tracking-[0.25em] text-gray-200 mb-5">
                Company
              </h4>
              <ul className="space-y-3">
                <li><span className="font-sans text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">About</span></li>
                <li><span className="font-sans text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">Careers</span></li>
                <li><span className="font-sans text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">Press</span></li>
                <li><span className="font-sans text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">Journal</span></li>
              </ul>
            </motion.div>

            {/* Column 4 - Newsletter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col items-center text-center"
            >
              <h4 className="font-sans text-[10px] uppercase font-semibold tracking-[0.25em] text-gray-200 mb-5">
                Newsletter
              </h4>
              <p className="font-sans text-sm text-gray-400 mb-5 leading-relaxed">
                Subscribe for updates.
              </p>
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-2.5 bg-transparent border border-gray-700 text-gray-200 placeholder-gray-600 font-sans text-sm focus:outline-none focus:border-gray-400 transition-colors"
                />
                <button className="w-full px-6 py-2.5 bg-white text-[#0F0F0F] font-sans text-[10px] font-semibold uppercase tracking-widest hover:bg-gray-100 transition-colors">
                  Subscribe
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Social Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.5 }}
          className="py-12 px-8 border-t border-[rgba(255,255,255,0.08)]"
        >
          <div className="flex flex-col items-center justify-center text-center">
            <h4 className="font-sans text-[10px] uppercase font-semibold tracking-[0.25em] text-gray-200 mb-6">
              Follow Us
            </h4>
            <div className="flex flex-wrap justify-center gap-8">
              <span className="font-sans text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">Instagram</span>
              <span className="font-sans text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">LinkedIn</span>
              <span className="font-sans text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">Twitter</span>
              <span className="font-sans text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">TikTok</span>
            </div>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center gap-4 py-8 px-8 border-t border-[rgba(255,255,255,0.05)]"
        >
          <p className="font-sans text-xs text-gray-500 tracking-wide">
            © 2026 Anoce. All rights reserved.
          </p>
          <div className="flex gap-8">
            <span className="font-sans text-[10px] uppercase tracking-widest text-gray-600 hover:text-gray-400 transition-colors cursor-pointer">Privacy</span>
            <span className="font-sans text-[10px] uppercase tracking-widest text-gray-600 hover:text-gray-400 transition-colors cursor-pointer">Terms</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};
