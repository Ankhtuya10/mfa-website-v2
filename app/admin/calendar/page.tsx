'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Article {
  id: string
  title: string | null
  status: string | null
  published_at: string | null
  slug: string | null
}

const STATUS_DOT: Record<string, string> = {
  published: 'bg-emerald-400',
  review:    'bg-amber-400',
  draft:     'bg-stone-300',
}

const STATUS_BAR: Record<string, string> = {
  published: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  review:    'bg-amber-50 text-amber-700 border border-amber-200',
  draft:     'bg-stone-100 text-stone-500 border border-stone-200',
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchArticles() {
      const supabase = createClient()
      const { data } = await supabase
        .from('articles')
        .select('id, title, status, published_at, slug')
        .not('published_at', 'is', null)
        .order('published_at')
      setArticles(data || [])
      setLoading(false)
    }
    fetchArticles()
  }, [])

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))

  const articlesByDay: Record<number, Article[]> = {}
  articles.forEach(article => {
    if (article.published_at) {
      const date = new Date(article.published_at)
      if (date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear()) {
        const day = date.getDate()
        if (!articlesByDay[day]) articlesByDay[day] = []
        articlesByDay[day].push(article)
      }
    }
  })

  const today = new Date()
  const isToday = (day: number) =>
    day === today.getDate() &&
    currentDate.getMonth() === today.getMonth() &&
    currentDate.getFullYear() === today.getFullYear()

  const thisWeekStart = new Date(today)
  thisWeekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  const thisWeekEnd = new Date(thisWeekStart)
  thisWeekEnd.setDate(thisWeekStart.getDate() + 6)

  const thisWeekArticles = articles.filter(a => {
    if (!a.published_at) return false
    const date = new Date(a.published_at)
    return date >= thisWeekStart && date <= thisWeekEnd
  })

  const totalCells = Math.ceil((adjustedFirstDay + daysInMonth) / 7) * 7

  if (loading) {
    return (
      <div className="flex flex-col gap-7">
        <div className="flex items-end justify-between pt-1">
          <h1 className="font-serif text-[32px] text-[#1A1A18] leading-none tracking-tight">Calendar</h1>
        </div>
        <div className="bg-white rounded-xl border border-[#E8E4DD] h-[500px] animate-pulse" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-7">

      {/* Header */}
      <div className="flex items-end justify-between pt-1">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-1.5 rounded-lg text-[#B0ACA4] hover:text-[#1A1A18] hover:bg-[#ECEAE5] transition-all">
            <ChevronLeft className="w-4 h-4" strokeWidth={1.8} />
          </button>
          <h1 className="font-serif text-[32px] text-[#1A1A18] leading-none tracking-tight w-56">{monthName}</h1>
          <button onClick={nextMonth} className="p-1.5 rounded-lg text-[#B0ACA4] hover:text-[#1A1A18] hover:bg-[#ECEAE5] transition-all">
            <ChevronRight className="w-4 h-4" strokeWidth={1.8} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="ml-2 px-3 py-1.5 font-sans text-[10px] tracking-[0.1em] uppercase text-[#9E9B94] hover:text-[#1A1A18] hover:bg-[#ECEAE5] rounded-lg transition-all"
          >
            Today
          </button>
        </div>
        <button className="flex items-center gap-2 bg-[#0E0E0D] text-white font-sans text-[10.5px] tracking-[0.12em] uppercase font-medium px-5 py-2.5 rounded-lg hover:bg-[#2a2a28] transition-colors">
          <Plus className="w-3.5 h-3.5" strokeWidth={2} /> Schedule
        </button>
      </div>

      {/* Calendar + sidebar */}
      <div className="flex gap-5">

        {/* Calendar grid */}
        <div className="flex-1 bg-white rounded-xl border border-[#E8E4DD] overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-[#EDEBE6]">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="py-3 text-center font-sans text-[9.5px] tracking-[0.12em] uppercase text-[#B0ACA4] font-medium">
                {day}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {Array.from({ length: totalCells }, (_, i) => {
              const day = i - adjustedFirstDay + 1
              const isValid = day > 0 && day <= daysInMonth
              const dayArticles = isValid ? (articlesByDay[day] || []) : []
              const todayCell = isValid && isToday(day)

              return (
                <div
                  key={i}
                  className={`min-h-[96px] p-2.5 border-b border-r border-[#F0EDE8] transition-colors
                    ${!isValid ? 'bg-[#FAFAF8]' : 'hover:bg-[#FAF8F5]'}
                    ${todayCell ? 'bg-[#F5F2ED]' : ''}
                  `}
                >
                  {isValid && (
                    <>
                      <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full mb-1 font-sans text-[11.5px] font-medium
                        ${todayCell ? 'bg-[#0E0E0D] text-white' : 'text-[#1A1A18]'}
                      `}>
                        {day}
                      </div>
                      <div className="space-y-1">
                        {dayArticles.slice(0, 2).map((article, j) => (
                          <div
                            key={j}
                            className={`px-1.5 py-0.5 rounded-md font-sans text-[9.5px] truncate cursor-pointer hover:opacity-80 transition-opacity ${STATUS_BAR[article.status || 'draft']}`}
                          >
                            {article.title}
                          </div>
                        ))}
                        {dayArticles.length > 2 && (
                          <p className="font-sans text-[9px] text-[#B0ACA4] pl-1">
                            +{dayArticles.length - 2} more
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* This week sidebar */}
        <div className="w-[220px] shrink-0 bg-white rounded-xl border border-[#E8E4DD] overflow-hidden self-start">
          <div className="px-5 py-4 border-b border-[#EDEBE6]">
            <h2 className="font-sans text-[10px] tracking-[0.12em] uppercase text-[#9E9B94] font-medium">This Week</h2>
          </div>
          <div className="px-5 py-3 divide-y divide-[#F0EDE8]">
            {thisWeekArticles.length === 0 ? (
              <p className="font-sans text-[12px] text-[#C0BCB5] py-4 text-center">No articles this week</p>
            ) : (
              thisWeekArticles.map((article, i) => (
                <div key={i} className="flex items-start gap-2.5 py-3">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${STATUS_DOT[article.status || 'draft']}`} />
                  <div>
                    <p className="font-sans text-[12px] text-[#1A1A18] leading-snug line-clamp-2">{article.title}</p>
                    <p className="font-sans text-[10.5px] text-[#B0ACA4] mt-0.5">
                      {article.published_at
                        ? new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : ''}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
