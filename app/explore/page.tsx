'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { StickyNavbar, Footer } from '@/app/components'
import { ArticleCard } from '@/app/components/shared/ArticleCard'
import { CollectionCard } from '@/app/components/shared/CollectionCard'
import { DesignerCard } from '@/app/components/shared/DesignerCard'
import { EmptyState } from '@/app/components/shared/EmptyState'

const tags = ['cashmere', 'fw2025', 'gobi', 'emerging', 'ulaanbaatar']

export default function ExplorePage() {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [results, setResults] = useState<{ articles: any[]; collections: any[]; designers: any[] }>({ articles: [], collections: [], designers: [] })
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults({ articles: [], collections: [], designers: [] })
      return
    }

    setLoading(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const q = `%${searchQuery}%`

      const [articlesRes, collectionsRes, designersRes] = await Promise.all([
        supabase.from('articles').select('*').or(`title.ilike.${q},body.ilike.${q},author_name.ilike.${q}`).eq('status', 'published').limit(6),
        supabase.from('collections').select('*').or(`title.ilike.${q},description.ilike.${q},designer_name.ilike.${q}`).limit(6),
        supabase.from('designers').select('*').or(`name.ilike.${q},bio.ilike.${q}`).limit(6),
      ])

      setResults({
        articles: articlesRes.data || [],
        collections: collectionsRes.data || [],
        designers: designersRes.data || [],
      })
    } catch (error) {
      console.error('Search error:', error)
      setResults({ articles: [], collections: [], designers: [] })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      search(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query, search])

  const totalResults = results.articles.length + results.collections.length + results.designers.length

  return (
    <div className="flex flex-col min-h-screen justify-between bg-[#F5F2ED]">
      <StickyNavbar />

      <main className="flex-grow">
        {/* Search Hero */}
        <section className="relative bg-[#0A0A0A] overflow-hidden pt-24 pb-12">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1920&q=80"
              alt=""
              fill
              className="object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/80 via-[#0A0A0A]/60 to-[#0A0A0A]" />
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] px-8">
            <span className="font-sans text-xs tracking-[4.95px] uppercase text-[#B7AEA9] mb-8">Explore the Archive</span>
            
            <div className="w-full max-w-4xl">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search collections, articles, designers..."
                className="w-full font-serif text-3xl md:text-4xl lg:text-5xl text-white bg-transparent border-b-2 border-[#B7AEA9]/50 outline-none py-4 text-center placeholder:text-[#7A7470] focus:border-white transition-colors"
                style={{ caretColor: 'white' }}
              />
            </div>

            <div className="flex flex-wrap justify-center gap-3 mt-10">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-5 py-2 font-sans text-xs tracking-[2px] uppercase text-[#B7AEA9] border border-[#393931] hover:border-white hover:text-white transition-all"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Filter bar */}
        <AnimatePresence>
          {query && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-[#0A0A0A] border-b border-[rgba(255,255,255,0.08)] overflow-hidden"
            >
              <div className="max-w-4xl mx-auto px-8 py-4 flex items-center justify-center gap-8">
                {['All', 'Articles', 'Collections', 'Designers'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={`font-sans text-sm tracking-[3px] uppercase pb-1 transition-colors ${
                      typeFilter === type
                        ? 'border-b-2 border-white text-white'
                        : 'text-[#7A7470] hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
                <span className="ml-6 font-sans text-sm tracking-[2px] uppercase text-[#7A7470]">
                  {loading ? 'Searching...' : `${totalResults} ${totalResults === 1 ? 'result' : 'results'}`}
                </span>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Results */}
        <section className="py-12 pb-24 flex items-center justify-center">
          <div className="w-full max-w-6xl mx-auto px-8">
            {query && totalResults === 0 && !loading ? (
              <EmptyState
                title="No results found"
                subtitle="Try different keywords or browse our categories."
                ghostText="EMPTY"
              />
            ) : (
              <AnimatePresence mode="wait">
                {query && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-16"
                  >
                    {(typeFilter === 'All' || typeFilter === 'Articles') && results.articles.length > 0 && (
                      <div>
                        <h2 className="font-serif text-2xl text-[#2A2522] mb-8 text-center">Articles</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          {results.articles.slice(0, 3).map((article) => (
                            <ArticleCard key={article.id} article={article} variant="grid" />
                          ))}
                        </div>
                      </div>
                    )}

                    {(typeFilter === 'All' || typeFilter === 'Collections') && results.collections.length > 0 && (
                      <div>
                        <h2 className="font-serif text-2xl text-[#2A2522] mb-8 text-center">Collections</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          {results.collections.slice(0, 3).map((collection) => (
                            <CollectionCard key={collection.id} collection={collection} />
                          ))}
                        </div>
                      </div>
                    )}

                    {(typeFilter === 'All' || typeFilter === 'Designers') && results.designers.length > 0 && (
                      <div>
                        <h2 className="font-serif text-2xl text-[#2A2522] mb-8 text-center">Designers</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          {results.designers.slice(0, 3).map((designer) => (
                            <DesignerCard key={designer.id} designer={designer} variant="grid" />
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {!query && (
              <div className="text-center py-16">
                <p className="font-sans text-base text-[#7A7470] tracking-wider">Start typing to search...</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
