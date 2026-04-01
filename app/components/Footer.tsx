'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Collections', href: '/collections' },
  { label: 'Editorial', href: '/editorial' },
  { label: 'Contact', href: '/contact' },
];

const secondaryLinks = [
  { label: 'About', href: '#' },
  { label: 'Careers', href: '#' },
  { label: 'Press', href: '#' },
  { label: 'Journal', href: '#' },
  { label: 'Shipping', href: '#' },
  { label: 'Returns', href: '#' },
];

const socials = ['Instagram', 'TikTok', 'LinkedIn', 'Twitter'];

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const handleSubmit = () => {
    if (email) setSubmitted(true);
  };

  return (
    <footer className="relative w-full h-screen bg-[#0A0907] overflow-hidden flex flex-col">

      {/* Atmospheric background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Warm glow bottom-left */}
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #C8A882, transparent 70%)' }} />
        {/* Cool accent top-right */}
        <div className="absolute -top-20 right-0 w-[400px] h-[400px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #8A7B6A, transparent 70%)' }} />
        {/* Thin horizontal rule lines */}
        <div className="absolute top-[38%] left-0 right-0 h-px bg-white/[0.03]" />
        <div className="absolute top-[62%] left-0 right-0 h-px bg-white/[0.03]" />
      </div>

      {/* Top strip — issue line */}
      <div className="flex-shrink-0 border-b border-white/[0.05] px-8 lg:px-16 py-3 flex items-center justify-between">
        <span className="font-mono text-[8px] tracking-[0.3em] uppercase text-white/15">
          Anoce · Est. 2026 · Ulaanbaatar, Mongolia
        </span>
        <span className="font-mono text-[8px] tracking-[0.3em] uppercase text-white/15">
          Volume XII · Spring 2026
        </span>
      </div>

      {/* CENTER — giant wordmark */}
      <div className="flex-1 flex flex-col items-center justify-center relative min-h-0 px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="text-center relative"
        >
          {/* Super large wordmark — editorial centerpiece */}
          <h2
            className="font-serif font-bold text-white leading-none select-none cursor-default"
            style={{ fontSize: 'clamp(80px, 18vw, 280px)', letterSpacing: '-0.02em' }}
          >
            Anoce
          </h2>

          {/* Tagline sits over the baseline */}
          <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-white/20 mt-4 mx-auto">
            Mongolian Heritage · Contemporary Luxury
          </p>
        </motion.div>

        {/* Nav links — horizontal, centered below wordmark */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center gap-8 mt-10"
        >
          {navLinks.map(({ label, href }) => (
            <Link key={label} href={href}
              className="font-sans text-[11px] tracking-[0.22em] uppercase text-white/30 hover:text-white transition-colors duration-300 relative group">
              {label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-white/40 group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </motion.div>
      </div>

      {/* Bottom section */}
      <div className="flex-shrink-0 border-t border-white/[0.05]">

        {/* Links + newsletter row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-b border-white/[0.05]">

          {/* Secondary links */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-8 lg:px-16 py-5 border-b md:border-b-0 md:border-r border-white/[0.05]">
            {secondaryLinks.map(({ label, href }) => (
              <Link key={label} href={href}
                className="font-sans text-[10px] tracking-[0.18em] uppercase text-white/20 hover:text-white/50 transition-colors duration-300">
                {label}
              </Link>
            ))}
          </div>

          {/* Social */}
          <div className="flex items-center justify-center gap-6 px-8 py-5 border-b md:border-b-0 md:border-r border-white/[0.05]">
            {socials.map((s) => (
              <Link key={s} href="#"
                className="font-sans text-[10px] tracking-[0.2em] uppercase text-white/20 hover:text-white/60 transition-colors duration-300">
                {s}
              </Link>
            ))}
          </div>

          {/* Newsletter */}
          <div className="flex items-center gap-3 px-8 lg:px-12 py-5">
            {!hydrated ? (
              <div aria-hidden="true" className="flex w-full items-center gap-3">
                <div className="h-[30px] flex-1 border-b border-white/10" />
                <div className="h-[30px] w-[112px] border border-white/10 flex-shrink-0" />
              </div>
            ) : submitted ? (
              <motion.span
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-sans text-[10px] tracking-[0.25em] uppercase text-white/40"
              >
                Thank you ·
              </motion.span>
            ) : (
              <>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 bg-transparent border-b border-white/10 text-white/60 placeholder-white/15 font-sans text-[11px] py-1.5 focus:outline-none focus:border-white/30 transition-colors duration-300"
                />
                <button
                  onClick={handleSubmit}
                  className="font-sans text-[9px] tracking-[0.25em] uppercase text-white/30 hover:text-white border border-white/10 hover:border-white/30 px-4 py-1.5 transition-all duration-300 flex-shrink-0"
                >
                  Subscribe
                </button>
              </>
            )}
          </div>
        </div>

        {/* Copyright bar */}
        <div className="flex items-center justify-between px-8 lg:px-16 py-4">
          <p className="font-sans text-[10px] text-white/15 tracking-wide">
            © 2026 Anoce. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {['Privacy', 'Terms', 'Cookies'].map((item) => (
              <Link key={item} href="#"
                className="font-sans text-[9px] uppercase tracking-[0.2em] text-white/15 hover:text-white/40 transition-colors duration-300">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
};
