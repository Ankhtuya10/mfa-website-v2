'use client'

import { use, useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Footer, StickyNavbar } from '@/app/components'
import { BookmarkButton } from '@/app/components/shared/BookmarkButton'
import { ArticleCard } from '@/app/components/shared/ArticleCard'
import { articles as mockArticles, designers as mockDesigners } from '@/lib/mockData'
import Link from 'next/link'

export default function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [article, setArticle] = useState<any>(null)
  const [relatedArticles, setRelatedArticles] = useState<any[]>([])
  const [designer, setDesigner] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        
        const [articleRes, relatedRes, designersRes] = await Promise.all([
          supabase.from('articles').select('*').eq('slug', slug).eq('status', 'published').single(),
          supabase.from('articles').select('*').eq('status', 'published').neq('slug', slug).limit(3),
          supabase.from('designers').select('*'),
        ])

        if (articleRes.data) {
          setArticle(articleRes.data)
        } else {
          const fallback = mockArticles.find(a => a.slug === slug)
          setArticle(fallback || mockArticles[0])
        }

        if (relatedRes.data && relatedRes.data.length > 0) {
          setRelatedArticles(relatedRes.data)
        } else {
          setRelatedArticles(mockArticles.filter(a => a.slug !== slug).slice(0, 3))
        }

        if (designersRes.data) {
          setDesigner(designersRes.data.find((d: any) => d.slug === article?.designer_slug))
        }
      } catch {
        const fallback = mockArticles.find(a => a.slug === slug) || mockArticles[0]
        setArticle(fallback)
        setRelatedArticles(mockArticles.filter(a => a.slug !== slug).slice(0, 3))
        const ds = mockDesigners.find((d: any) => d.slug === fallback.designerSlug)
        setDesigner(ds)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [slug])

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen justify-between bg-[#F5F2ED]">
        <StickyNavbar />
        <main className="flex-grow flex items-center justify-center">
          <span className="font-sans text-sm tracking-[2px] uppercase text-[#B7AEA9]">Loading...</span>
        </main>
        <Footer />
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="font-serif text-4xl text-[#2A2522]">Article not found</h1>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen justify-between bg-[#F5F2ED]">
      <StickyNavbar />

      <main className="flex-grow">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Hero */}
          <section className="relative h-[70vh] overflow-hidden">
            <Image
              src={article.cover_image || article.coverImage}
              alt={article.title}
              fill
              className="object-cover object-top"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center">
              <div className="w-full max-w-4xl mx-auto px-8 pb-12 text-center">
                <span className="font-sans text-xs tracking-[4.95px] uppercase text-white/70 block mb-4">
                  {article.category}
                </span>
                <h1 className="font-serif text-white text-4xl md:text-5xl lg:text-6xl leading-[1.1]">
                  {article.title}
                </h1>
              </div>
            </div>
          </section>

          {/* Meta bar */}
          <div className="bg-[#F5F2ED] border-b border-[rgba(0,0,0,0.08)] py-6 flex items-center justify-center">
            <div className="flex items-center gap-4">
              <span className="font-sans text-xs tracking-[2px] uppercase text-[#9B9590]">
                {article.author_name || article.author}
              </span>
              <span className="text-[#B7AEA9]">·</span>
              <span className="font-sans text-xs tracking-[2px] uppercase text-[#9B9590]">
                {new Date(article.published_at || article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="text-[#B7AEA9]">·</span>
              <span className="font-sans text-xs tracking-[2px] uppercase text-[#9B9590]">
                {article.read_time || article.readTime} min read
              </span>
            </div>
            <div className="ml-8">
              <BookmarkButton id={article.id} type="article" />
            </div>
          </div>

          {/* Article body */}
          <article className="py-16 flex items-center justify-center">
            <div className="w-full max-w-2xl mx-auto px-8">
              <h2 className="font-serif italic text-xl md:text-2xl text-[#7A7470] mb-12 text-center">
                {article.subtitle}
              </h2>
              
              <div className="space-y-7">
                {(article.body || '').split('\n\n').map((paragraph: string, i: number) => (
                  <p key={i} className="font-sans text-base md:text-lg leading-[1.85] text-[#3A3530]">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Pull quote */}
              <blockquote className="border-l-[3px] border-[#B7AEA9] pl-8 py-2 my-12">
                <p className="font-serif italic text-xl md:text-2xl text-[#B7AEA9]">
                  "Woven from the finest inner fleece of Mongolian goats, each piece carries the silence of the steppe."
                </p>
              </blockquote>
            </div>
          </article>

          {/* Related designer */}
          {designer && (
            <section className="pb-16 flex items-center justify-center">
              <div className="w-full max-w-2xl mx-auto px-8">
                <Link href={`/designers/${designer.slug}`}>
                  <div className="bg-[#F5F2ED] border border-[rgba(0,0,0,0.08)] p-6 flex items-center gap-6 hover:bg-[#EAE6E0] transition-colors text-center justify-center flex-col md:flex-row">
                    <div className="relative w-18 h-18">
                      <Image
                        src={designer.profile_image || designer.profileImage}
                        alt={designer.name}
                        width={72}
                        height={72}
                        className="object-cover rounded-full"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif text-lg text-[#2A2522]">{designer.name}</h3>
                      <p className="font-sans text-[#7A7470] text-sm mt-1 line-clamp-2">{designer.short_bio || designer.shortBio}</p>
                    </div>
                    <span className="font-sans text-xs tracking-[2px] uppercase text-[#B7AEA9]">
                      View Profile →
                    </span>
                  </div>
                </Link>
              </div>
            </section>
          )}

          {/* More from Editorial */}
          <section className="py-16 bg-white flex items-center justify-center">
            <div className="w-full max-w-6xl mx-auto px-8 text-center">
              <h2 className="font-serif text-2xl text-[#2A2522] mb-10">More Stories</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {relatedArticles.map((a) => (
                  <ArticleCard key={a.id} article={a} variant="grid" />
                ))}
              </div>
            </div>
          </section>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
