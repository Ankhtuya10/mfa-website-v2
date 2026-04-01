import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Pencil, Eye } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: publishedCount },
    { count: reviewCount },
    { count: designerCount },
    { count: collectionCount },
    { data: recentArticles },
  ] = await Promise.all([
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'review'),
    supabase.from('designers').select('*', { count: 'exact', head: true }),
    supabase.from('collections').select('*', { count: 'exact', head: true }),
    supabase.from('articles')
      .select('id, slug, title, category, status, author_name, published_at, created_at')
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Header bar */}
      <div className="flex items-center justify-between px-0 py-6 bg-white border-b border-[rgba(0,0,0,0.08)] shrink-0 w-full">
        <div>
          <h1 className="font-serif text-3xl text-[#111111]">Dashboard</h1>
          <p className="font-sans text-[11px] tracking-[2px] uppercase text-[#6B7280] mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="bg-[#111111] text-white font-sans font-bold text-[11px] tracking-[2.5px] uppercase px-8 py-4 hover:bg-[#333] transition-all shadow-lg hover:shadow-xl"
        >
          + New Article
        </Link>
      </div>

      {/* Main scrollable content */}
      <div className="overflow-y-auto w-full">
        {/* Stats grid */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
          <div className="bg-white border border-[rgba(0,0,0,0.08)] p-6 hover:shadow-md transition-shadow">
            <p className="font-serif text-6xl text-[#111111] leading-none font-medium">
              {publishedCount ?? 0}
            </p>
            <p className="font-sans text-[12px] tracking-[2px] uppercase text-[#4B5563] mt-4 font-medium">
              Published Articles
            </p>
            <p className="font-sans text-[12px] text-green-600 mt-2">
              +2 this month
            </p>
          </div>

          <div className="bg-white border border-[rgba(0,0,0,0.08)] p-6 hover:shadow-md transition-shadow">
            <p className="font-serif text-6xl text-[#111111] leading-none font-medium">
              {reviewCount ?? 0}
            </p>
            <p className="font-sans text-[12px] tracking-[2px] uppercase text-[#4B5563] mt-4 font-medium">
              Pending Review
            </p>
            <p className="font-sans text-[12px] text-amber-600 mt-2">
              Needs attention
            </p>
          </div>

          <div className="bg-white border border-[rgba(0,0,0,0.08)] p-6 hover:shadow-md transition-shadow">
            <p className="font-serif text-6xl text-[#111111] leading-none font-medium">
              {designerCount ?? 0}
            </p>
            <p className="font-sans text-[12px] tracking-[2px] uppercase text-[#4B5563] mt-4 font-medium">
              Total Designers
            </p>
            <p className="font-sans text-[12px] text-[#6B7280] mt-2">
              Across all tiers
            </p>
          </div>

          <div className="bg-white border border-[rgba(0,0,0,0.08)] p-6 hover:shadow-md transition-shadow">
            <p className="font-serif text-6xl text-[#111111] leading-none font-medium">
              {collectionCount ?? 0}
            </p>
            <p className="font-sans text-[12px] tracking-[2px] uppercase text-[#4B5563] mt-4 font-medium">
              Total Collections
            </p>
            <p className="font-sans text-[12px] text-green-600 mt-2">
              +2 this month
            </p>
          </div>
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
          {/* LEFT — Recent articles table */}
          <div className="bg-white border border-[rgba(0,0,0,0.08)]">
            <div className="px-6 py-5 border-b border-[rgba(0,0,0,0.08)]">
              <h2 className="font-sans text-[12px] tracking-[2px] uppercase text-[#6B7280]">
                Recent Articles
              </h2>
            </div>

            <table className="w-full table-fixed">
              <thead>
                <tr className="bg-[#F9FAFB]">
                  <th className="text-left px-6 py-4 font-sans text-[11px] tracking-[1.5px] uppercase text-[#6B7280] w-[35%]">
                    Title
                  </th>
                  <th className="text-left px-4 py-4 font-sans text-[11px] tracking-[1.5px] uppercase text-[#6B7280] w-[15%]">
                    Category
                  </th>
                  <th className="text-left px-4 py-4 font-sans text-[11px] tracking-[1.5px] uppercase text-[#6B7280] w-[15%]">
                    Status
                  </th>
                  <th className="text-left px-4 py-4 font-sans text-[11px] tracking-[1.5px] uppercase text-[#6B7280] w-[20%]">
                    Author
                  </th>
                  <th className="text-left px-4 py-4 font-sans text-[11px] tracking-[1.5px] uppercase text-[#6B7280] w-[10%]">
                    Date
                  </th>
                  <th className="text-left px-4 py-4 font-sans text-[11px] tracking-[1.5px] uppercase text-[#6B7280] w-[5%]">
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentArticles?.map((article) => (
                  <tr key={article.id} className="border-t border-[rgba(0,0,0,0.06)] hover:bg-[#FAFAF9]">
                    <td className="px-6 py-5">
                      <p className="font-inter text-[14px] text-[#111111] font-medium leading-snug">
                        {article.title}
                      </p>
                    </td>
                    <td className="px-4 py-5">
                      <p className="font-sans text-[11px] tracking-[1.5px] uppercase text-[#4B5563]">
                        {article.category || '-'}
                      </p>
                    </td>
                    <td className="px-4 py-5">
                      <span className={`inline-block font-sans text-[10px] tracking-[1.5px] uppercase px-3 py-1.5 border ${
                        article.status === 'published'
                          ? 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]'
                          : article.status === 'review'
                          ? 'bg-[#FFF7ED] text-[#EA580C] border-[#FED7AA]'
                          : article.status === 'draft'
                          ? 'bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]'
                          : 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                      }`}>
                        {article.status || 'draft'}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      <p className="font-inter text-[13px] text-[#4B5563]">
                        {article.author_name || '-'}
                      </p>
                    </td>
                    <td className="px-4 py-5">
                      <p className="font-inter text-[12px] text-[#6B7280] whitespace-nowrap">
                        {new Date(article.published_at || article.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex gap-2">
                        <Link href={`/admin/articles/${article.id}/edit`}
                           className="text-[#6B7280] hover:text-[#111111] transition-colors p-2">
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <Link href={`/editorial/${article.slug}`} target="_blank"
                           className="text-[#6B7280] hover:text-[#111111] transition-colors p-2">
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* RIGHT — Editorial calendar */}
          <div className="bg-white border border-[rgba(0,0,0,0.08)]">
            <div className="px-6 py-5 border-b border-[rgba(0,0,0,0.08)]">
              <h2 className="font-sans text-[12px] tracking-[2px] uppercase text-[#6B7280]">
                Editorial Calendar
              </h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-7 gap-1 text-center mb-3">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <span key={day} className="font-sans text-[10px] tracking-[1.5px] uppercase text-[#9CA3AF]">{day}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }, (_, i) => {
                  const day = i - 3
                  const hasArticle = [5, 12, 15, 19, 26].includes(day)
                  const hasReview = [12, 19].includes(day)
                  return (
                    <div
                      key={i}
                      className="aspect-square flex items-center justify-center relative hover:bg-[#F9FAFB] rounded cursor-pointer"
                    >
                      <span className={`font-sans text-[12px] ${day > 0 && day <= 31 ? 'text-[#374151]' : 'text-transparent'}`}>
                        {day > 0 && day <= 31 ? day : ''}
                      </span>
                      {hasArticle && day > 0 && day <= 31 && (
                        <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${hasReview ? 'bg-amber-500' : 'bg-[#111111]'}`} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6 bg-white border border-[rgba(0,0,0,0.08)]">
          <div className="px-6 py-5 border-b border-[rgba(0,0,0,0.08)]">
            <h2 className="font-sans text-[12px] tracking-[2px] uppercase text-[#6B7280]">
              Recent Activity
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { action: 'Article published', item: 'Spring Collection 2026', time: '2 hours ago', type: 'published' },
                { action: 'New designer added', item: 'Goyol Studio', time: '1 day ago', type: 'designer' },
                { action: 'Collection updated', item: 'FW2025 Heritage', time: '2 days ago', type: 'collection' },
                { action: 'Article submitted for review', item: 'Mongolian Cashmere Trends', time: '3 days ago', type: 'review' },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[rgba(0,0,0,0.04)] last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'published' ? 'bg-green-500' :
                      activity.type === 'review' ? 'bg-amber-500' :
                      activity.type === 'designer' ? 'bg-blue-500' : 'bg-gray-400'
                    }`} />
                    <div>
                      <p className="font-inter text-[13px] text-[#111111]">{activity.action}</p>
                      <p className="font-inter text-[12px] text-[#6B7280]">{activity.item}</p>
                    </div>
                  </div>
                  <p className="font-inter text-[11px] text-[#9CA3AF]">{activity.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
