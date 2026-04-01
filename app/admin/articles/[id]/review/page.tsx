'use client'

import { use } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { articles } from '@/lib/mockData'
import { ExternalLink } from 'lucide-react'

export default function ArticleReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const article = articles.find(a => a.id === id)

  if (!article) {
    return <div>Article not found</div>
  }

  const timeline = [
    { label: 'Draft Created', date: 'Mar 10, 2026', actor: 'Tsetseg', done: true },
    { label: 'Submitted for Review', date: 'Mar 15, 2026', actor: 'Tsetseg', done: true },
    { label: 'Under Review', date: 'Mar 18, 2026', actor: 'Narantsetseg', done: true },
    { label: 'Approved', date: null, actor: null, done: false },
  ]

  return (
    <div className="flex min-h-screen">
      {/* Left - Preview */}
      <div className="flex-1 overflow-y-auto bg-[#F5F2ED] min-h-screen">
        <div className="sticky top-0 bg-[#030213] text-white px-6 py-3 text-center">
          <span className="font-sans text-[10px] tracking-[4px] uppercase">Preview Mode</span>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-12">
          {/* Hero */}
          <div className="relative h-[50vh] mb-12 overflow-hidden">
            <Image src={article.coverImage} alt="" fill className="object-cover" />
          </div>

          <span className="font-sans text-[10px] tracking-[4.95px] uppercase text-[#B7AEA9] block mb-4">
            {article.category}
          </span>
          <h1 className="font-serif text-4xl text-[#2A2522] mb-6">{article.title}</h1>
          <p className="font-serif italic text-xl text-[#7A7470] mb-8">{article.subtitle}</p>
          
          <div className="flex items-center gap-4 mb-12 text-[#9B9590]">
            <span className="font-sans text-[11px] tracking-[2px] uppercase">{article.author}</span>
            <span>·</span>
            <span className="font-sans text-[11px] tracking-[2px] uppercase">{article.readTime} min read</span>
          </div>

          <div className="space-y-6">
            {article.body.split('\n\n').slice(0, 3).map((p, i) => (
              <p key={i} className="font-inter text-[17px] leading-[1.85] text-[#3A3530]">{p}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Review */}
      <div className="w-[400px] bg-white border-l border-[rgba(0,0,0,0.08)] overflow-y-auto">
        <div className="p-8">
          <h2 className="font-serif text-xl text-[#2A2522] mb-1 truncate">{article.title}</h2>
          <p className="font-sans text-[11px] text-[#9B9590]">by {article.author} · Submitted Mar 15</p>

          {/* Timeline */}
          <div className="mt-8 space-y-6">
            {timeline.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className={`w-3 h-3 rounded-full mt-1 ${step.done ? 'bg-green-500' : 'bg-gray-200'}`} />
                <div>
                  <p className={`font-sans text-[12px] ${step.done ? 'text-[#2A2522]' : 'text-[#9B9590]'}`}>
                    {step.label}
                  </p>
                  {step.date && (
                    <p className="font-sans text-[10px] text-[#9B9590] mt-1">
                      {step.date} · {step.actor}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Review form */}
          <div className="mt-8 space-y-4">
            <textarea
              placeholder="Leave feedback..."
              rows={4}
              className="w-full border border-[rgba(0,0,0,0.15)] p-4 font-inter text-[14px] outline-none focus:border-[#2A2522] resize-none"
            />
            
            <button className="w-full bg-green-600 text-white py-4 font-sans font-bold text-[11px] tracking-[3px] uppercase hover:bg-green-700 transition-colors">
              Approve
            </button>
            
            <button className="w-full border border-red-300 text-red-600 py-4 font-sans font-bold text-[11px] tracking-[3px] uppercase hover:bg-red-50 transition-colors">
              Request Changes
            </button>
          </div>

          <a
            href={`/editorial/${article.slug}`}
            target="_blank"
            className="flex items-center justify-center gap-2 mt-6 text-[#9B9590] hover:text-[#2A2522] transition-colors"
          >
            <span className="font-sans text-[11px] tracking-[2px] uppercase">Preview on site</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  )
}
