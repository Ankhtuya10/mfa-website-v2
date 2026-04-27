'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface PageHeroProps {
  eyebrow?: string
  title: string
  subtitle?: string
  dark?: boolean
  backgroundImage?: string
  height?: string
  align?: 'left' | 'center'
  children?: ReactNode
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  dark = false,
  backgroundImage,
  height = '60vh',
  align = 'center',
  children
}: PageHeroProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.7 }
    }
  }

  return (
    <section 
      className={`relative w-full ${dark ? 'bg-[#0A0A0A]' : 'bg-[#F5F2ED]'} flex items-center justify-center overflow-hidden`}
      style={{ height }}
    >
      {backgroundImage && (
        <div className="absolute inset-0">
          <Image
            src={backgroundImage}
            alt=""
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
      )}

      {!backgroundImage && !dark && (
        <span 
          className="absolute font-serif text-[15vw] text-[#2A2522] opacity-[0.04] select-none pointer-events-none whitespace-nowrap"
          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        >
          {title}
        </span>
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`relative z-10 mx-auto w-full max-w-5xl px-6 md:px-8 lg:px-16 ${align === 'left' ? 'text-left' : 'text-center'}`}
      >
        {eyebrow && (
          <motion.span
            variants={itemVariants}
            className={`font-sans text-xs tracking-[0.32em] uppercase ${dark ? 'text-[#B7AEA9]' : 'text-[#9B9590]'} block mb-8`}
          >
            {eyebrow}
          </motion.span>
        )}

        <motion.h1
          variants={itemVariants}
          className={`font-serif font-normal ${dark ? 'text-white' : 'text-[#2A2522]'} mb-6 text-5xl leading-[1.1] tracking-[-0.01em] [overflow-wrap:anywhere] [text-wrap:balance] md:text-6xl lg:text-7xl`}
        >
          {title.split('\n').map((line, i) => (
            <span key={i} className="block">{line}</span>
          ))}
        </motion.h1>

        {subtitle && (
          <motion.p
            variants={itemVariants}
            className={`font-sans ${dark ? 'text-[#B7AEA9]' : 'text-[#7A7470]'} max-w-2xl text-lg leading-relaxed md:text-xl ${align === 'center' ? 'mx-auto' : ''}`}
          >
            {subtitle}
          </motion.p>
        )}

        {children}
      </motion.div>
    </section>
  )
}
