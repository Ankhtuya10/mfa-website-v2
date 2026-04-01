'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { StickyNavbar, Footer } from '@/app/components'
import { ArticleCard } from '@/app/components/shared/ArticleCard'
import { articles as mockArticles } from '@/lib/mockData'

const categories = ['All', 'Features', 'Interviews', 'News', 'Trends']

export default function EditorialPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [visibleCount, setVisibleCount] = useState(6)
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchArticles() {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        let query = supabase
          .from('articles')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
        
        const { data, error } = await query
        if (error || !data || data.length === 0) {
          setArticles(mockArticles.filter(a => a.status === 'published'))
        } else {
          setArticles(data)
        }
      } catch {
        setArticles(mockArticles.filter(a => a.status === 'published'))
      } finally {
        setLoading(false)
      }
    }
    fetchArticles()
  }, [])

  const featuredArticle = articles[0]
  const remainingArticles = articles.slice(1)

  const filteredArticles = activeCategory === 'All'
    ? remainingArticles
    : remainingArticles.filter(a => a.category?.toLowerCase() === activeCategory.toLowerCase())

  const visibleArticles = filteredArticles.slice(0, visibleCount)
  const hasMore = visibleCount < filteredArticles.length

  return (
    <div className="flex flex-col min-h-screen justify-between bg-[#F5F2ED]">
      <StickyNavbar />

      <main className="flex-grow">
        {/* Hero */}
        <section className="relative w-full bg-[#0A0A0A] flex items-center justify-center" style={{ height: '55vh' }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-5xl mx-auto px-8 text-center"
          >
            <span className="font-sans text-xs tracking-[4.95px] uppercase text-[#B7AEA9] block mb-6">Anoce Editorial</span>
            <h1 className="font-serif text-white text-5xl md:text-6xl lg:text-7xl leading-[1.1] mb-6">
              Stories from<br />the Steppe
            </h1>
            <p className="font-sans text-[#B7AEA9] text-lg max-w-xl mx-auto">
              Interviews, features and dispatches from the world of Mongolian fashion
            </p>
          </motion.div>
        </section>

        {/* Category tabs */}
        <section className="sticky top-20 z-40 bg-[#0A0A0A]/95 backdrop-blur border-b border-[rgba(255,255,255,0.08)] py-5 flex items-center justify-center">
          <div className="flex items-center gap-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`font-sans text-sm tracking-[3px] uppercase pb-1 transition-colors ${
                  activeCategory === cat
                    ? 'border-b-2 border-white text-white'
                    : 'text-[#7A7470] hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Featured article */}
        {activeCategory === 'All' && featuredArticle && (
          <section className="py-16 flex items-center justify-center">
            <div className="w-full max-w-5xl mx-auto px-8 text-center">
              <span className="font-sans text-xs tracking-[4.95px] uppercase text-[#9B9590] block mb-8">Featured</span>
              <ArticleCard article={featuredArticle} variant="featured" />
            </div>
          </section>
        )}

        {/* Article grid */}
        <section className="py-16 pb-24 flex items-center justify-center">
          <div className="w-full max-w-6xl mx-auto px-8">
            {loading ? (
              <div className="text-center py-20">
                <span className="font-sans text-sm tracking-[2px] uppercase text-[#B7AEA9]">Loading...</span>
              </div>
            ) : (
              <>
                <motion.div
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
                  }}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false, amount: 0.1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
                >
                  {visibleArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} variant="grid" />
                  ))}
                </motion.div>

                {/* Load more */}
                <div className="text-center pt-12">
                  {hasMore ? (
                    <button
                      onClick={() => setVisibleCount(prev => prev + 3)}
                      className="font-sans font-bold text-sm tracking-[3.5px] uppercase pb-1 border-b border-[#B7AEA9] text-[#B7AEA9] hover:text-[#2A2522] hover:border-[#2A2522] transition-colors"
                    >
                      Load More
                    </button>
                  ) : (
                    <span className="font-sans text-sm tracking-[2px] uppercase text-[#B7AEA9]">
                      No more articles
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
