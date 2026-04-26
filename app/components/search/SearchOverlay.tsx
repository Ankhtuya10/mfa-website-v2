'use client'

import { useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Clock3, Search, X } from 'lucide-react'
import { TRENDING_TAGS, expandQueryTerms } from './searchEngine'
import { useGlobalSearch } from './useGlobalSearch'
import type { SearchCategory, SearchResultItem, SeasonFilter } from './types'

type SearchOverlayProps = {
  isOpen: boolean
  onClose: () => void
}

const categories = ['all', 'articles', 'collections', 'designers', 'brands'] as const

const highlightMatch = (text: string, query: string) => {
  if (!query.trim()) return text
  const terms = expandQueryTerms(query).sort((a, b) => b.length - a.length)
  const lowerText = text.toLowerCase()
  const matchedTerm = terms.find((term) => term && lowerText.includes(term.toLowerCase()))
  if (!matchedTerm) return text

  const index = lowerText.indexOf(matchedTerm.toLowerCase())
  if (index === -1) return text

  return (
    <>
      {text.slice(0, index)}
      <span className="text-white">{text.slice(index, index + matchedTerm.length)}</span>
      {text.slice(index + matchedTerm.length)}
    </>
  )
}

function SearchResultCard({ item, query, onClose }: { item: SearchResultItem; query: string; onClose: () => void }) {
  return (
    <Link href={item.href} onClick={onClose} className="block">
      <article className="overflow-hidden rounded-[22px] border border-white/[0.13] bg-white/[0.06] transition-all duration-300 hover:border-white/[0.24] hover:bg-white/[0.09]">
        <div className="relative aspect-[16/11] overflow-hidden">
          <Image src={item.image} alt={item.title} fill className="object-cover transition-transform duration-700 hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <p className="mb-1 font-sans text-[10px] tracking-[0.13em] uppercase text-white/46">{item.meta}</p>
            <h3 className="font-serif text-[22px] leading-[1.18] text-white [overflow-wrap:anywhere]">{highlightMatch(item.title, query)}</h3>
          </div>
        </div>
        <p className="line-clamp-2 p-4 pt-3 font-sans text-[14px] leading-[1.38] text-white/58">{highlightMatch(item.subtitle, query)}</p>
      </article>
    </Link>
  )
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const {
    query,
    setQuery,
    activeCategory,
    setActiveCategory,
    seasonFilter,
    setSeasonFilter,
    deferredQuery,
    recentSearches,
    groupedResults,
    totalResults,
    showLiveResults,
    noResults,
    suggestedFallback,
  } = useGlobalSearch()

  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const timer = setTimeout(() => inputRef.current?.focus(), 20)
    return () => {
      clearTimeout(timer)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [isOpen, onClose])

  const groupedEntries = useMemo(
    () =>
      (['articles', 'collections', 'designers', 'brands'] as SearchCategory[])
        .filter((category) => activeCategory === 'all' || activeCategory === category)
        .map((category) => ({ category, items: groupedResults[category] })),
    [activeCategory, groupedResults]
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120]"
          role="dialog"
          aria-modal="true"
          aria-label="Global search"
        >
          <button aria-label="Close search" onClick={onClose} className="absolute inset-0 bg-black/45 backdrop-blur-md" />

          <div className="relative h-full w-full">
            <div className="absolute left-1/2 top-1/2 h-[min(90vh,860px)] w-[min(1120px,calc(100vw-3rem))] -translate-x-1/2 -translate-y-1/2 md:w-[min(1120px,calc(100vw-6rem))]">
              <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.99 }}
                transition={{ duration: 0.3 }}
                className="relative flex h-full w-full flex-col overflow-hidden rounded-[30px] border border-white/[0.14] bg-[rgba(14,13,12,0.82)]"
              >
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute -top-1/3 left-[-35%] h-[160%] w-[35%] rotate-[16deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)] blur-2xl"
                animate={{ x: ['0%', '250%'] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              />

              <div className="border-b border-white/[0.09]">
                <div className="mx-auto w-full max-w-[1020px] px-8 pb-6 pt-8 md:px-12">
                  <div className="mb-5 flex min-w-0 items-center gap-4">
                    <Search className="h-5 w-5 shrink-0 text-white/45" />
                    <input
                      ref={inputRef}
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search cashmere, FW2025, emerald wool, Gobi..."
                      className="min-w-0 flex-1 bg-transparent font-serif text-xl leading-tight text-white/92 outline-none placeholder:text-white/38 md:text-[2rem] xl:text-[2.3rem]"
                    />
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.18] bg-white/[0.06] text-white/55 transition-all hover:bg-white/[0.1] hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="mr-1 shrink-0 font-sans text-[10px] leading-none tracking-[0.2em] uppercase text-white/36">Season</span>
                    {[
                      { label: 'All', value: 'all' },
                      { label: 'Current', value: 'current' },
                      { label: 'Archive', value: 'archive' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSeasonFilter(option.value as SeasonFilter)}
                        className={`shrink-0 rounded-full border px-[13px] py-[6px] font-sans text-[10px] leading-none tracking-[0.14em] uppercase transition-all ${
                          seasonFilter === option.value
                            ? 'border-transparent bg-white/[0.95] text-[#0A0A0A]'
                            : 'border-white/[0.13] bg-white/[0.04] text-white/56 hover:text-white/80'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                    <span className="mx-2 h-3 w-px shrink-0 bg-white/[0.12]" />
                    {categories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setActiveCategory(category)}
                        className={`shrink-0 rounded-full border px-[13px] py-[6px] font-sans text-[10px] leading-none tracking-[0.14em] uppercase transition-all ${
                          activeCategory === category
                            ? 'border-transparent bg-white/[0.95] text-[#0A0A0A]'
                            : 'border-white/[0.13] bg-white/[0.04] text-white/56 hover:text-white/80'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex min-h-0 flex-1 overflow-y-auto">
                <div className="mx-auto flex w-full max-w-[1020px] flex-col gap-8 px-8 pb-10 pt-8 md:px-12">
                  <div>
                    <p className="mb-3 font-sans text-[10px] leading-none tracking-[0.2em] uppercase text-white/36">Recent</p>
                    {recentSearches.length > 0 ? (
                      <div className="flex flex-wrap gap-2.5">
                        {recentSearches.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setQuery(item)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.11] bg-white/[0.04] px-3 py-1.5 font-sans text-[12px] leading-none text-white/60 transition-all hover:text-white/84"
                          >
                            <Clock3 className="h-[12px] w-[12px]" />
                            {item}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="font-sans text-[13px] text-white/45">Your recent searches will appear here.</p>
                    )}
                  </div>

                  <div>
                    <p className="mb-3 font-sans text-[10px] leading-none tracking-[0.2em] uppercase text-white/36">Trending</p>
                    <div className="flex flex-wrap gap-2.5">
                      {TRENDING_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setQuery(tag)}
                          className="rounded-full border border-white/[0.11] bg-white/[0.04] px-3 py-1.5 font-sans text-[10px] leading-none tracking-[0.18em] uppercase text-[#c8b89a] transition-all hover:text-white"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-4 font-sans text-[10px] leading-none tracking-[0.2em] uppercase text-white/36">
                      {showLiveResults ? `${totalResults} Results` : 'Featured'}
                    </p>

                    {!showLiveResults && (
                      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                        {suggestedFallback.map((item, index) => (
                          <motion.div key={item.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: index * 0.06 }}>
                            <SearchResultCard item={item} query="" onClose={onClose} />
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {showLiveResults && !noResults && (
                      <div className="space-y-8">
                        {groupedEntries.map(({ category, items }) => {
                          if (items.length === 0) return null
                          return (
                            <section key={category}>
                              <p className="mb-3 font-sans text-[10px] leading-none tracking-[0.2em] uppercase text-white/40">{category}</p>
                              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                                {items.map((item, index) => (
                                  <motion.div key={item.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: index * 0.06 }}>
                                    <SearchResultCard item={item} query={deferredQuery} onClose={onClose} />
                                  </motion.div>
                                ))}
                              </div>
                            </section>
                          )
                        })}
                      </div>
                    )}

                    {noResults && (
                      <div className="rounded-2xl border border-white/[0.11] bg-white/[0.03] p-7 text-center">
                        <h3 className="font-serif text-3xl text-white">No results for "{deferredQuery}"</h3>
                        <p className="mt-2 font-sans text-base text-white/56">Try related materials, season terms, or brand names.</p>
                        <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                          {['cashmere', 'fw2025', 'winter', 'emerald', 'wool'].map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => setQuery(suggestion)}
                              className="rounded-full border border-white/[0.11] bg-white/[0.04] px-3 py-1.5 font-sans text-[10px] tracking-[0.18em] uppercase text-[#c8b89a] transition-all hover:text-white"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
