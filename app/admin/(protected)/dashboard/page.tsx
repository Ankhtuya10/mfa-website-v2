import Link from 'next/link'
import { Pencil, Eye, TrendingUp, Clock, ArrowRight } from 'lucide-react'
import { createContentRepository } from '@/lib/couchdb/repository'

export const dynamic = 'force-dynamic'

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  published: { label: 'Нийтлэгдсэн', dot: 'bg-emerald-400', badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  review:    { label: 'Хяналт',    dot: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  draft:     { label: 'Ноорог',     dot: 'bg-stone-300',   badge: 'bg-stone-100 text-stone-500 ring-1 ring-stone-200' },
  archived:  { label: 'Архивласан',  dot: 'bg-red-300',     badge: 'bg-red-50 text-red-600 ring-1 ring-red-200' },
}

export default async function DashboardPage() {
  const formatRelativeTime = (dateValue: string) => {
    const now = Date.now()
    const then = new Date(dateValue).getTime()
    const diffHours = Math.max(1, Math.floor((now - then) / (1000 * 60 * 60)))

    if (diffHours < 24) return `${diffHours} цагийн өмнө`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays} өдрийн өмнө`
    const diffWeeks = Math.floor(diffDays / 7)
    if (diffWeeks < 5) return `${diffWeeks} долоо хоногийн өмнө`
    const diffMonths = Math.floor(diffDays / 30)
    return `${diffMonths} сарын өмнө`
  }

  let allArticles: any[] = []
  let allDesigners: any[] = []
  let allCollections: any[] = []
  let recentArticles: any[] = []
  let recentDesigners: any[] = []
  let recentCollections: any[] = []

  try {
    const repo = createContentRepository()
    const [articles, designers, collections] = await Promise.all([
      repo.getArticles({ status: 'all' }),
      repo.getDesigners(),
      repo.getCollections(),
    ])
    allArticles = articles
    allDesigners = designers
    allCollections = collections
    recentArticles = articles.slice(0, 8)
    recentDesigners = designers.slice(0, 4)
    recentCollections = collections.slice(0, 4)
  } catch {
    recentArticles = []
    recentDesigners = []
    recentCollections = []
  }

  const publishedCount = allArticles.filter((article) => article.status === 'published').length
  const reviewCount = allArticles.filter((article) => article.status === 'review').length
  const designerCount = allDesigners.length
  const collectionCount = allCollections.length

  const recentActivity = [
    ...(recentArticles || []).map((article) => ({
      action:
        article.status === 'published'
          ? 'Нийтлэл нийтлэгдсэн'
          : article.status === 'review'
          ? 'Хяналтад илгээсэн'
          : 'Нийтлэлийн ноорог үүссэн',
      item: article.title || 'Гарчиггүй нийтлэл',
      time: article.published_at || article.created_at,
      type:
        article.status === 'published'
          ? 'published'
          : article.status === 'review'
          ? 'review'
          : 'article',
    })),
    ...(recentDesigners || []).map((designer) => ({
      action: 'Дизайнер нэмэгдсэн',
      item: designer.name || 'Нэргүй дизайнер',
      time: designer.created_at,
      type: 'designer',
    })),
    ...(recentCollections || []).map((collection) => ({
      action: 'Цуглуулга нэмэгдсэн',
      item: collection.title || 'Гарчиггүй цуглуулга',
      time: collection.created_at,
      type: 'collection',
    })),
  ]
    .filter((item) => item.time)
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 4)

  const dateStr = new Date().toLocaleDateString('mn-MN', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  })

  const stats = [
    {
      value: publishedCount ?? 0,
      label: 'Нийтлэгдсэн',
      sub: '+2 энэ сард',
      subColor: 'text-emerald-600',
      icon: TrendingUp,
    },
    {
      value: reviewCount ?? 0,
      label: 'Хяналт',
      sub: reviewCount ? 'Анхаарах хэрэгтэй' : 'Бүгд хэвийн',
      subColor: reviewCount ? 'text-amber-600' : 'text-stone-400',
      icon: Clock,
    },
    {
      value: designerCount ?? 0,
      label: 'Дизайнер',
      sub: 'Бүх ангиллаар',
      subColor: 'text-stone-400',
      icon: null,
    },
    {
      value: collectionCount ?? 0,
      label: 'Цуглуулга',
      sub: '+2 энэ сард',
      subColor: 'text-emerald-600',
      icon: null,
    },
  ]

  return (
    <div className="flex flex-col gap-8 pb-12">

      {/* Page header */}
      <div className="flex items-end justify-between pt-1">
        <div>
          <p className="font-sans text-[10.5px] tracking-[0.12em] uppercase text-[#A09D96] mb-1.5">{dateStr}</p>
          <h1 className="font-serif text-[32px] text-[#1A1A18] leading-none tracking-tight">Хянах самбар</h1>
        </div>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 bg-[#0E0E0D] text-white font-sans text-[10.5px] tracking-[0.12em] uppercase font-medium px-5 py-2.5 rounded-lg hover:bg-[#2a2a28] transition-colors"
        >
          <span className="text-white/40 text-[15px] leading-none">+</span> Шинэ нийтлэл
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#E8E4DD] px-6 py-5 hover:shadow-sm transition-shadow">
            <p className="font-serif text-[52px] text-[#1A1A18] leading-none font-normal tabular-nums">
              {stat.value}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="font-sans text-[11px] tracking-[0.09em] uppercase text-[#6B6860] font-medium">
                  {stat.label}
                </p>
                <p className={`font-sans text-[11px] mt-1 ${stat.subColor}`}>
                  {stat.sub}
                </p>
              </div>
              {stat.icon && <stat.icon className="w-4 h-4 text-[#C8C4BC]" strokeWidth={1.6} />}
            </div>
          </div>
        ))}
      </div>

      {/* Two-column body */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">

        {/* Recent articles */}
        <div className="bg-white rounded-xl border border-[#E8E4DD] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDEBE6]">
            <h2 className="font-sans text-[10.5px] tracking-[0.1em] uppercase text-[#9E9B94] font-medium">
              Сүүлийн нийтлэлүүд
            </h2>
            <Link
              href="/admin/articles"
              className="flex items-center gap-1 font-sans text-[10px] tracking-[0.08em] uppercase text-[#B0ACA4] hover:text-[#1A1A18] transition-colors"
            >
              Бүгдийг үзэх <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <table className="w-full">
            <thead>
              <tr className="bg-[#FAFAF8]">
                <th className="text-left px-6 py-3 font-sans text-[10px] tracking-[0.1em] uppercase text-[#B0ACA4] font-medium w-[38%]">Гарчиг</th>
                <th className="text-left px-4 py-3 font-sans text-[10px] tracking-[0.1em] uppercase text-[#B0ACA4] font-medium w-[14%]">Ангилал</th>
                <th className="text-left px-4 py-3 font-sans text-[10px] tracking-[0.1em] uppercase text-[#B0ACA4] font-medium w-[14%]">Төлөв</th>
                <th className="text-left px-4 py-3 font-sans text-[10px] tracking-[0.1em] uppercase text-[#B0ACA4] font-medium w-[18%]">Зохиогч</th>
                <th className="text-left px-4 py-3 font-sans text-[10px] tracking-[0.1em] uppercase text-[#B0ACA4] font-medium w-[10%]">Огноо</th>
                <th className="py-3 px-4 w-[6%]" />
              </tr>
            </thead>
            <tbody>
              {recentArticles?.map((article, i) => {
                const s = article.status || 'draft'
                const cfg = STATUS_CONFIG[s] || STATUS_CONFIG.draft
                return (
                  <tr
                    key={article.id}
                    className={`group hover:bg-[#FAF8F5] transition-colors ${i < (recentArticles.length - 1) ? 'border-b border-[#F0EDE8]' : ''}`}
                  >
                    <td className="px-6 py-3.5">
                      <p className="font-sans text-[13px] text-[#1A1A18] font-medium leading-snug line-clamp-1">
                        {article.title}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-sans text-[10.5px] tracking-[0.07em] uppercase text-[#7A776F]">
                        {article.category || '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 font-sans text-[10px] tracking-[0.07em] uppercase font-medium px-2.5 py-1 rounded-md ${cfg.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-sans text-[12.5px] text-[#6B6860]">{article.author_name || '—'}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-sans text-[11.5px] text-[#A09D96] whitespace-nowrap">
                        {new Date(article.published_at || article.created_at).toLocaleDateString('mn-MN', {
                          month: 'short', day: 'numeric',
                        })}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/articles/${article.id}/edit`}
                          className="p-1.5 rounded-md text-[#9E9B94] hover:text-[#1A1A18] hover:bg-[#ECEAE5] transition-all">
                          <Pencil className="w-3.5 h-3.5" strokeWidth={1.6} />
                        </Link>
                        <Link href={`/editorial/${article.slug}`} target="_blank"
                          className="p-1.5 rounded-md text-[#9E9B94] hover:text-[#1A1A18] hover:bg-[#ECEAE5] transition-all">
                          <Eye className="w-3.5 h-3.5" strokeWidth={1.6} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-[#E8E4DD] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#EDEBE6]">
              <h2 className="font-sans text-[10.5px] tracking-[0.1em] uppercase text-[#9E9B94] font-medium">Шуурхай үйлдэл</h2>
            </div>
            <div className="p-3 flex flex-col gap-1">
              {[
                { label: 'Шинэ нийтлэл', href: '/admin/articles/new', accent: true },
                { label: 'Дизайнер удирдах', href: '/admin/designers', accent: false },
                { label: 'Календарь харах', href: '/admin/calendar', accent: false },
                { label: 'Медиа оруулах', href: '/admin/assets', accent: false },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg font-sans text-[11.5px] tracking-[0.06em] transition-all
                    ${action.accent
                      ? 'bg-[#0E0E0D] text-white hover:bg-[#2a2a28]'
                      : 'text-[#4A4845] hover:bg-[#F5F2ED] hover:text-[#1A1A18]'
                    }`}
                >
                  {action.label}
                  <ArrowRight className={`w-3 h-3 ${action.accent ? 'text-white/40' : 'text-[#C0BCB5]'}`} />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-[#E8E4DD] overflow-hidden flex-1">
            <div className="px-5 py-4 border-b border-[#EDEBE6]">
              <h2 className="font-sans text-[10.5px] tracking-[0.1em] uppercase text-[#9E9B94] font-medium">Сүүлийн үйлдэл</h2>
            </div>
            <div className="px-5 py-3 divide-y divide-[#F0EDE8]">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 py-3">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                    activity.type === 'published' ? 'bg-emerald-400' :
                    activity.type === 'review'    ? 'bg-amber-400' :
                    activity.type === 'designer'  ? 'bg-sky-400' : 'bg-stone-300'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-[12px] text-[#1A1A18] leading-snug">{activity.action}</p>
                    <p className="font-sans text-[11px] text-[#A09D96] mt-0.5 truncate">{activity.item}</p>
                  </div>
                  <span className="font-sans text-[10.5px] text-[#C0BCB5] shrink-0 pt-0.5">{formatRelativeTime(activity.time)}</span>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <p className="py-3 font-sans text-[12px] text-[#A09D96]">Одоогоор үйлдэл алга.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
