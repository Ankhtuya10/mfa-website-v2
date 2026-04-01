'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Article {
  id: string
  title: string | null
  status: string | null
  published_at: string | null
  slug: string | null
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
  thisWeekStart.setDate(today.getDate() - today.getDay() + 1)
  const thisWeekEnd = new Date(thisWeekStart)
  thisWeekEnd.setDate(thisWeekStart.getDate() + 6)

  const thisWeekArticles = articles.filter(a => {
    if (!a.published_at) return false
    const date = new Date(a.published_at)
    return date >= thisWeekStart && date <= thisWeekEnd
  })

  const statusColors: Record<string, { bg: string; dot: string }> = {
    published: { bg: 'bg-[#F0FDF4] text-[#16A34A]', dot: 'bg-[#16A34A]' },
    review: { bg: 'bg-[#FFFBEB] text-[#D97706]', dot: 'bg-[#D97706]' },
    draft: { bg: 'bg-[#F9FAFB] text-[#6B7280]', dot: 'bg-[#6B7280]' },
  }

  if (loading) {
    return (
      <div className="w-full">
      <header className="flex items-center justify-between mb-8 w-full max-w-full">
          <h1 className="font-serif text-2xl text-[#111111]">Calendar</h1>
        </header>
        <div className="bg-white border border-[rgba(0,0,0,0.08)] h-[500px] animate-pulse w-full" />
      </div>
    )
  }

  return (
    <div style={{ width: '100%', maxWidth: '100%', paddingRight: '3rem', boxSizing: 'border-box' }}>
      <header className="flex items-center justify-between mb-8 w-full">
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="p-2 hover:bg-[#F5F2ED] transition-colors">
            <ChevronLeft className="w-5 h-5 text-[#9B9590]" />
          </button>
          <h1 className="font-serif text-2xl text-[#111111] w-48">{monthName}</h1>
          <button onClick={nextMonth} className="p-2 hover:bg-[#F5F2ED] transition-colors">
            <ChevronRight className="w-5 h-5 text-[#9B9590]" />
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="ml-4 px-4 py-2 font-sans text-[11px] tracking-[2px] uppercase text-[#9B9590] hover:text-[#111111] transition-colors"
          >
            Today
          </button>
        </div>
        <button className="bg-[#111111] text-white font-sans font-bold text-[10px] tracking-[2.5px] uppercase px-5 py-2.5 hover:bg-[#333] transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Schedule Article
        </button>
      </header>

      <div className="flex w-full" style={{ maxWidth: 'calc(100% - 3rem)' }}>
        <div className="flex-1">
          <div className="bg-white border border-[rgba(0,0,0,0.08)] w-full">
            <div className="grid grid-cols-7 border-b border-[rgba(0,0,0,0.08)] w-full">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="p-4 text-center font-sans text-[10px] tracking-[2px] uppercase text-[#9B9590]">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 w-full">
              {Array.from({ length: 35 }, (_, i) => {
                const day = i - adjustedFirstDay + 1
                const isValid = day > 0 && day <= daysInMonth
                const dayArticles = articlesByDay[day] || []
                
                return (
                  <div
                    key={i}
                    className={`min-h-[100px] p-2 border-b border-r border-[rgba(0,0,0,0.06)] w-full ${
                      !isValid ? 'bg-[#FAFAFA]' : ''
                    } ${isToday(day) ? 'ring-1 ring-[#B7AEA9] bg-[#F5F2ED]' : ''}`}
                  >
                    {isValid && (
                      <>
                        <span className="font-sans text-[12px] text-[#111111] font-medium">{day}</span>
                        {dayArticles.map((article, j) => (
                          <div
                            key={j}
                            className={`mt-1 px-2 py-1 font-sans text-[10px] truncate cursor-pointer hover:opacity-80 ${
                              statusColors[article.status || 'draft'].bg
                            }`}
                          >
                            {article.title}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="w-64 bg-white border-l border-[rgba(0,0,0,0.08)] p-6">
          <h2 className="font-sans text-[10px] tracking-[2.5px] uppercase text-[#9B9590] mb-4">This Week</h2>
          <div className="space-y-4">
            {thisWeekArticles.length === 0 ? (
              <p className="font-inter text-[12px] text-[#9B9590]">No articles scheduled this week</p>
            ) : (
              thisWeekArticles.map((article, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-[rgba(0,0,0,0.06)]">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${
                    statusColors[article.status || 'draft'].dot
                  }`} />
                  <div>
                    <p className="font-inter text-[12px] text-[#111111]">{article.title}</p>
                    <p className="font-inter text-[11px] text-[#9B9590] mt-1">
                      {article.published_at ? new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
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
