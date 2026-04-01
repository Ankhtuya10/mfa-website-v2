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
      <div className="flex items-end justify-between pt-1">
        <div>
          <h1 className="font-serif text-[32px] text-[#1A1A18] leading-none tracking-tight">Articles</h1>
          <p className="font-sans text-[11px] text-[#A09D96] mt-1.5 tracking-[0.04em]">
            {articles?.length || 0} total
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 bg-[#0E0E0D] text-white font-sans text-[10.5px] tracking-[0.12em] uppercase font-medium px-5 py-2.5 rounded-lg hover:bg-[#2a2a28] transition-colors"
        >
          <span className="text-white/40 text-[14px] leading-none">+</span> New article
        </Link>
      </div>

      {/* Search */}
      <div className="relative w-[260px]">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#C0BCB5]" strokeWidth={1.6} />
        <input
          type="text"
          placeholder="Search articles…"
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E8E4DD] rounded-lg font-sans text-[12.5px] text-[#1A1A18] placeholder:text-[#C0BCB5] focus:outline-none focus:border-[#0E0E0D] transition-colors"
        />
      </div>

      {error && (
        <p className="text-red-500 font-sans text-[12.5px]">Error loading articles: {error.message}</p>
      )}

      <ArticlesTable initialArticles={articles || []} />
    </div>
  )
}
