'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Article {
  id: string
  slug: string
  title: string
  subtitle?: string
  category?: string
  cover_image?: string
  coverImage?: string
  author?: string
  author_name?: string
  publishedAt?: string
  published_at?: string
  readTime?: number
  read_time?: number
  body?: string
  tags?: string[]
  status?: string
}

interface ArticleCardProps {
  article: Article
  variant?: 'grid' | 'featured' | 'minimal'
}

export function ArticleCard({ article, variant = 'grid' }: ArticleCardProps) {
  const coverImage = article.cover_image || article.coverImage || ''
  const author = article.author || article.author_name || 'Unknown'
  const publishedAt = article.publishedAt || article.published_at || new Date().toISOString()
  const readTime = article.readTime || article.read_time || 5

  if (variant === 'minimal') {
    return (
      <Link href={`/editorial/${article.slug}`}>
        <div className="border-b border-[rgba(0,0,0,0.06)] pb-6 text-center">
          <span className="font-sans text-xs tracking-[3px] uppercase text-[#B7AEA9]">
            {article.category}
          </span>
          <h3 className="mt-3 font-serif text-2xl leading-tight text-[#2A2522] [overflow-wrap:anywhere]">
            {article.title}
          </h3>
          <span className="font-sans text-xs tracking-[2px] uppercase text-[#9B9590] mt-3 block">
            {new Date(publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </Link>
    )
  }

  if (variant === 'featured') {
    return (
      <Link href={`/editorial/${article.slug}`}>
        <motion.article
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.5 }}
          className="glass-panel-light overflow-hidden rounded-[34px] grid grid-cols-1 gap-0 lg:grid-cols-[55%_45%]"
        >
          <div className="relative h-[500px] overflow-hidden rounded-[28px] m-2.5">
            <Image
              src={coverImage}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
          </div>
          <div className="p-12 lg:p-16 flex flex-col justify-center items-center text-center">
            <span className="mb-6 block font-sans text-xs tracking-[0.32em] uppercase text-[#9B9590]">
              {article.category}
            </span>
            <h2 className="mb-6 font-serif text-3xl leading-tight text-[#2A2522] [overflow-wrap:anywhere] lg:text-4xl xl:text-5xl">
              {article.title}
            </h2>
            <p className="font-sans text-base lg:text-lg text-[#7A7470] mb-8 leading-relaxed max-w-md">
              {article.subtitle}
            </p>
            <div className="mb-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              <span className="font-sans text-xs tracking-[2px] uppercase text-[#9B9590]">
                {author}
              </span>
              <span className="text-[#B7AEA9]">·</span>
              <span className="font-sans text-xs tracking-[2px] uppercase text-[#9B9590]">
                {readTime} min read
              </span>
            </div>
            <span className="font-sans text-sm tracking-[3px] uppercase text-[#2A2522] inline-flex items-center gap-3 group">
              Read Article
              <span className="w-8 h-px bg-[#2A2522] group-hover:w-16 transition-all duration-300" />
            </span>
          </div>
        </motion.article>
      </Link>
    )
  }

  return (
    <Link href={`/editorial/${article.slug}`}>
      <motion.article
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="glass-panel-light group cursor-pointer overflow-hidden rounded-[34px] text-center p-3"
      >
        <div className="relative aspect-[3/4] overflow-hidden rounded-[26px]">
          <motion.div
            whileHover={{ scale: 1.07 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full h-full"
          >
            <Image
              src={coverImage}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </motion.div>
          <span className="absolute top-4 left-1/2 -translate-x-1/2 font-sans text-xs tracking-[3px] uppercase text-white/80 bg-black/40 px-3 py-1.5 rounded-full">
            {article.category}
          </span>
        </div>
        <h3 className="mt-5 px-2 font-serif text-2xl leading-[1.2] text-[#2A2522] transition-colors [overflow-wrap:anywhere] group-hover:text-[#393931]">
          {article.title}
        </h3>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 pb-3">
          <span className="font-sans text-xs tracking-[2px] uppercase text-[#9B9590]">
            {author}
          </span>
          <span className="text-[#B7AEA9]">·</span>
          <span className="font-sans text-xs tracking-[2px] uppercase text-[#9B9590]">
            {new Date(publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </motion.article>
    </Link>
  )
}
