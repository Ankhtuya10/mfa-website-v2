import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { ArticlesTable } from './ArticlesTable'

export default async function ArticlesPage() {
  const supabase = await createClient()
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, slug, title, category, status, author_name, created_at, published_at')
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col gap-7">

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-[28px] text-[#1A1A18] leading-tight tracking-tight">Articles</h1>
          <p className="font-sans text-[12.5px] text-[#A09D96] mt-1">
            {articles?.length || 0} total
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 bg-[#0E0E0D] text-white font-sans text-[11px] tracking-[0.1em] uppercase font-medium px-5 py-2.5 rounded-lg hover:bg-[#2a2a28] transition-colors"
        >
          <span className="text-white/50 text-[14px] leading-none">+</span> New article
        </Link>
      </div>

      {/* Search */}
      <div className="relative w-[280px]">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#B0ACA4]" strokeWidth={1.6} />
        <input
          type="text"
          placeholder="Search articles…"
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E4E0D9] rounded-lg font-sans text-[13px] text-[#1A1A18] placeholder:text-[#B0ACA4] focus:outline-none focus:border-[#0E0E0D] transition-colors"
        />
      </div>

      {error && (
        <p className="text-red-500 font-sans text-[13px]">Error loading articles: {error.message}</p>
      )}

      <ArticlesTable initialArticles={articles || []} />
    </div>
  )
}
