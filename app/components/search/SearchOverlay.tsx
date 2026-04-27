'use client'

import { useEffect, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
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

function FilterPill({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-2 font-sans text-[11px] leading-none tracking-[0.12em] uppercase transition-all duration-300 ${
        active
          ? 'border-transparent bg-[#E4D8C5] text-[#11100E] shadow-[0_10px_28px_rgba(228,216,197,0.12)]'
          : 'border-white/10 bg-white/[0.045] text-white/52 hover:border-white/24 hover:bg-white/[0.075] hover:text-white/82'
      }`}
    >
      {children}
    </button>
  )
}

function SearchResultCard({ item, query, onClose }: { item: SearchResultItem; query: string; onClose: () => void }) {
  return (
    <Link href={item.href} onClick={onClose} className="group block h-full min-w-0">
      <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.045] transition-all duration-300 hover:-translate-y-1 hover:border-white/22 hover:bg-white/[0.075]">
        <div className="relative aspect-[4/3] overflow-hidden bg-black">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-black/10" />
        </div>

        <div className="flex min-h-0 flex-1 flex-col p-4">
          <p className="mb-2 truncate font-sans text-[9px] tracking-[0.2em] uppercase text-white/38">{item.meta}</p>
          <h3 className="line-clamp-2 font-serif text-lg leading-[1.12] text-[#F5EFE7] md:text-xl">
            {highlightMatch(item.title, query)}
          </h3>
          <p className="mt-3 line-clamp-2 font-sans text-[13px] leading-[1.45] text-white/50">
            {highlightMatch(item.subtitle, query)}
          </p>
        </div>
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

  const topMatches = useMemo(
    () => groupedEntries.flatMap(({ items }) => items).slice(0, 6),
    [groupedEntries]
  )

  const featuredResults = useMemo(() => suggestedFallback.slice(0, 3), [suggestedFallback])

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
          <button
            aria-label="Close search"
            onClick={onClose}
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(212,201,184,0.12),rgba(0,0,0,0.62)_42%,rgba(0,0,0,0.78)_100%)] backdrop-blur-2xl"
          />

          <div className="pointer-events-none relative flex h-full w-full items-start justify-center px-3 py-5 md:px-8 md:pt-[7vh]">
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.99 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto relative flex h-[calc(100vh-2.5rem)] max-h-[760px] w-full max-w-[72rem] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#0A0A0A]/72 shadow-[0_36px_140px_rgba(0,0,0,0.7)] backdrop-blur-2xl md:h-[78vh] md:rounded-[32px]"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_0%,rgba(212,201,184,0.12),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.06),transparent_28%,rgba(255,255,255,0.025))]" />

              <div className="relative z-10 border-b border-white/10 px-4 py-4 md:px-7 md:py-5">
                <div className="flex min-w-0 items-center gap-3">
                  <Search className="h-5 w-5 shrink-0 text-white/42" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search cashmere, FW2025, emerald wool, Gobi..."
                    className="h-11 min-w-0 flex-1 truncate bg-transparent font-serif text-xl leading-none text-white/92 outline-none placeholder:text-white/36 md:h-12 md:text-2xl"
                  />
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/14 bg-white/[0.055] text-white/58 transition-all hover:bg-white/[0.1] hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <span className="mr-1 font-sans text-[11px] tracking-[0.18em] uppercase text-white/42">Season</span>
                    {[
                      { label: 'All', value: 'all' },
                      { label: 'Current', value: 'current' },
                      { label: 'Archive', value: 'archive' },
                    ].map((option) => (
                      <FilterPill
                        key={option.value}
                        active={seasonFilter === option.value}
                        onClick={() => setSeasonFilter(option.value as SeasonFilter)}
                      >
                        {option.label}
                      </FilterPill>
                    ))}
                  </div>

                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <span className="mr-1 font-sans text-[11px] tracking-[0.18em] uppercase text-white/42">Type</span>
                    {categories.map((category) => (
                      <FilterPill
                        key={category}
                        active={activeCategory === category}
                        onClick={() => setActiveCategory(category)}
                      >
                        {category}
                      </FilterPill>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative z-10 min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-7 md:py-6">
                <div className="grid gap-6 lg:grid-cols-12">
                  <aside className="space-y-6 lg:col-span-4">
                    <section className="rounded-[24px] border border-white/10 bg-white/[0.035] p-4">
                      <p className="mb-3 font-sans text-[11px] tracking-[0.18em] uppercase text-white/42">Recent</p>
                      {recentSearches.length > 0 ? (
                        <div className="space-y-2">
                          {recentSearches.slice(0, 5).map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => setQuery(item)}
                              className="flex w-full min-w-0 items-center gap-2 rounded-full px-3 py-2 text-left font-sans text-[13px] leading-none text-white/58 transition-all hover:bg-white/[0.07] hover:text-white/86"
                            >
                              <Clock3 className="h-[13px] w-[13px] shrink-0 text-white/38" />
                              <span className="truncate">{item}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="font-sans text-[13px] leading-relaxed text-white/42">
                          Your recent searches will appear here.
                        </p>
                      )}
                    </section>

                    <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-4">
                      <p className="mb-3 font-sans text-[11px] tracking-[0.18em] uppercase text-white/42">Trending</p>
                      <div className="flex flex-wrap gap-2">
                        {TRENDING_TAGS.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setQuery(tag)}
                            className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 font-sans text-[10px] leading-none tracking-[0.14em] uppercase text-[#D4C9B8]/72 transition-all hover:border-white/22 hover:bg-white/[0.07] hover:text-white"
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    </section>
                  </aside>

                  <main className="min-w-0 lg:col-span-8">
                    <div className="mb-4 flex items-end justify-between gap-4">
                      <div>
                        <p className="font-sans text-[11px] tracking-[0.18em] uppercase text-white/42">
                          {showLiveResults ? 'Top matches' : 'Featured'}
                        </p>
                        {showLiveResults && (
                          <p className="mt-1 font-sans text-[13px] text-white/44">{totalResults} results in archive</p>
                        )}
                      </div>
                    </div>

                    {!showLiveResults && (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {featuredResults.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: index * 0.05 }}
                          >
                            <SearchResultCard item={item} query="" onClose={onClose} />
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {showLiveResults && !noResults && (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {topMatches.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: index * 0.04 }}
                          >
                            <SearchResultCard item={item} query={deferredQuery} onClose={onClose} />
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {noResults && (
                      <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-6 text-center md:p-8">
                        <h3 className="font-serif text-2xl leading-tight text-white">No results for "{deferredQuery}"</h3>
                        <p className="mt-2 font-sans text-[14px] leading-relaxed text-white/50">
                          Try a material, season, designer, or collection name.
                        </p>
                        <div className="mt-5 flex flex-wrap justify-center gap-2">
                          {['cashmere', 'fw2025', 'winter', 'emerald', 'wool'].map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => setQuery(suggestion)}
                              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 font-sans text-[10px] tracking-[0.14em] uppercase text-[#D4C9B8]/74 transition-all hover:border-white/22 hover:text-white"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </main>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
