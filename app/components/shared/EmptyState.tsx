'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface EmptyStateProps {
  title: string
  subtitle: string
  ghostText?: string
  action?: { label: string; href: string }
}

export function EmptyState({ title, subtitle, ghostText, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      {ghostText && (
        <span className="font-serif text-[8vw] text-[rgba(0,0,0,0.04)] select-none pointer-events-none mb-4">
          {ghostText}
        </span>
      )}
      <h3 className="font-display text-2xl text-[#2A2522] mb-2">{title}</h3>
      <p className="font-sans text-[#B7AEA9] mb-8 max-w-md">{subtitle}</p>
      {action && (
        <Link
          href={action.href}
          className="font-sans font-bold text-[11px] tracking-[4px] uppercase text-white bg-[#393931] px-10 py-3.5 hover:bg-[#2A2522] transition-colors"
        >
          {action.label}
        </Link>
      )}
    </motion.div>
  )
}
