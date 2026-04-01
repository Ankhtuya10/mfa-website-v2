'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pencil, Eye, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Article {
  id: string
  slug: string
  title: string
  category: string | null
  status: string | null
  author_name: string | null
  created_at: string
  published_at: string | null
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  published: { label: 'Published', dot: 'bg-emerald-400', badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  review:    { label: 'Review',    dot: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  draft:     { label: 'Draft',     dot: 'bg-stone-300',   badge: 'bg-stone-100 text-stone-500 ring-1 ring-stone-200' },
  archived:  { label: 'Archived',  dot: 'bg-red-300',     badge: 'bg-red-50 text-red-600 ring-1 ring-red-200' },
}

const FILTERS = ['all', 'published', 'review', 'draft'] as const
type Filter = typeof FILTERS[number]

export function ArticlesTable({ initialArticles }: { initialArticles: Article[] }) {
  const [articles, setArticles] = useState<Article[]>(initialArticles)
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = filter === 'all' ? articles : articles.filter(a => a.status === filter)

  const counts = {
    all: articles.length,
    published: articles.filter(a => a.status === 'published').length,
    review: articles.filter(a => a.status === 'review').length,
    draft: articles.filter(a => a.status === 'draft').length,
  }

  async function deleteArticle(id: string) {
    if (!confirm('Delete this article? This cannot be undone.')) return
    const supabase = createClient()
    await supabase.from('articles').delete().eq('id', id)
    setArticles(articles.filter(a => a.id !== id))
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-sans text-[10.5px] tracking-[0.08em] uppercase font-medium transition-all duration-100
              ${filter === f
                ? 'bg-[#0E0E0D] text-white'
                : 'text-[#9E9B94] hover:text-[#1A1A18] hover:bg-[#ECEAE5]'
              }`}
          >
            {f === 'all' ? 'All' : STATUS_CONFIG[f]?.label ?? f}
            <span className={`text-[9.5px] min-w-[16px] text-center tabular-nums ${
              filter === f ? 'text-white/40' : 'text-[#C0BCB5]'
            }`}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#E8E4DD] overflow-hidden bg-white">
        <table className="w-full">
          <thead>
            <tr className="bg-[#FAFAF8] border-b border-[#EDEBE6]">
              <th className="text-left py-3 px-6 font-sans text-[10px] tracking-[0.1em] uppercase text-[#B0ACA4] font-medium w-[38%]">Title</th>
              <th className="text-left py-3 px-4 font-sans text-[10px] tracking-[0.1em] uppercase text-[#B0ACA4] font-medium w-[13%]">Category</th>
              <th className="text-left py-3 px-4 font-sans text-[10px] tracking-[0.1em] uppercase text-[#B0ACA4] font-medium w-[14%]">Status</th>
              <th className="text-left py-3 px-4 font-sans text-[10px] tracking-[0.1em] uppercase text-[#B0ACA4] font-medium w-[18%]">Author</th>
              <th className="text-left py-3 px-4 font-sans text-[10px] tracking-[0.1em] uppercase text-[#B0ACA4] font-medium w-[10%]">Date</th>
              <th className="py-3 px-4 w-[7%]" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-20 text-center text-[#C0BCB5] font-sans text-[13px]">
                  No articles found
                </td>
              </tr>
            ) : (
              filtered.map((article, i) => {
                const s = article.status || 'draft'
                const cfg = STATUS_CONFIG[s] || STATUS_CONFIG.draft
                return (
                  <tr
                    key={article.id}
                    className={`group transition-colors hover:bg-[#FAF8F5] ${i < filtered.length - 1 ? 'border-b border-[#F0EDE8]' : ''}`}
                  >
                    <td className="py-3.5 px-6">
                      <span className="font-sans text-[13px] text-[#1A1A18] font-medium leading-snug line-clamp-1">
                        {article.title}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-sans text-[10.5px] tracking-[0.07em] uppercase text-[#7A776F]">
                        {article.category || '—'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 font-sans text-[10px] tracking-[0.07em] uppercase font-medium px-2.5 py-1 rounded-md ${cfg.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-sans text-[12.5px] text-[#6B6860]">{article.author_name || '—'}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-sans text-[11.5px] text-[#A09D96]">
                        {article.created_at
                          ? new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          : '—'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/admin/articles/${article.id}/edit`}
                          className="p-1.5 rounded-md text-[#9E9B94] hover:text-[#1A1A18] hover:bg-[#ECEAE5] transition-all"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" strokeWidth={1.6} />
                        </Link>
                        <Link
                          href={`/editorial/${article.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-md text-[#9E9B94] hover:text-[#1A1A18] hover:bg-[#ECEAE5] transition-all"
                          title="View live"
                        >
                          <Eye className="w-3.5 h-3.5" strokeWidth={1.6} />
                        </Link>
                        <button
                          onClick={() => deleteArticle(article.id)}
                          className="p-1.5 rounded-md text-[#9E9B94] hover:text-red-500 hover:bg-red-50 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.6} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
