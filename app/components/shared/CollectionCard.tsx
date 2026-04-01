'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Collection {
  id: string
  slug: string
  title: string
  designerName?: string
  designer_name?: string
  season?: string
  year?: number
  coverImage?: string
  cover_image?: string
  looks?: any[]
}

interface CollectionCardProps {
  collection: Collection
  showDesigner?: boolean
}

export function CollectionCard({ collection, showDesigner = false }: CollectionCardProps) {
  const coverImage = collection.cover_image || collection.coverImage || ''
  const designerName = collection.designer_name || collection.designerName || ''
  const season = collection.season || ''
  const year = collection.year || ''
  const looksCount = collection.looks?.length || 0

  return (
    <Link href={`/archive/${collection.slug}`}>
      <motion.article
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="group cursor-pointer text-center"
      >
        <div className="relative aspect-[4/5] overflow-hidden">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full h-full"
          >
            <Image
              src={coverImage}
              alt={collection.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </motion.div>
          
          {/* Overlay */}
          <motion.div
            initial={{ y: '100%' }}
            whileHover={{ y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center"
          >
            <div className="mb-6">
              <span className="font-sans text-xs tracking-[3px] uppercase text-white/70">
                {season} {year} · {looksCount} looks
              </span>
            </div>
            <span className="font-sans font-bold text-sm tracking-[4px] uppercase text-white px-8 py-4 border border-white/50 hover:bg-white hover:text-black transition-all">
              View Collection
            </span>
          </motion.div>
        </div>

        <div className="mt-6">
          {showDesigner && (
            <span className="font-sans text-xs tracking-[3px] uppercase text-[#9B9590] block mb-2">
              {designerName}
            </span>
          )}
          <h3 className="font-serif text-xl lg:text-2xl text-[#2A2522] leading-tight group-hover:text-[#393931] transition-colors">
            {collection.title}
          </h3>
        </div>
      </motion.article>
    </Link>
  )
}
