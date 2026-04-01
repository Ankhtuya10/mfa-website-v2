'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart } from 'lucide-react'

interface BookmarkButtonProps {
  id: string
  type: 'article' | 'look' | 'designer'
}

export function BookmarkButton({ id, type }: BookmarkButtonProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(`anoce_saved_${type}_${id}`)
    setIsSaved(saved === 'true')
  }, [id, type])

  const toggle = () => {
    const newState = !isSaved
    setIsSaved(newState)
    localStorage.setItem(`anoce_saved_${type}_${id}`, String(newState))
    
    if (newState) {
      setShowFeedback(true)
      setTimeout(() => setShowFeedback(false), 500)
    }
  }

  return (
    <button
      onClick={toggle}
      className="relative p-2 hover:bg-black/5 transition-colors"
    >
      <motion.div
        animate={showFeedback ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Heart
          className={`w-5 h-5 transition-colors ${
            isSaved ? 'fill-[#B7AEA9] text-[#B7AEA9]' : 'text-[rgba(0,0,0,0.3)]'
          }`}
        />
      </motion.div>
    </button>
  )
}
