'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface BookmarkButtonProps {
  id: string
  type: 'article' | 'look' | 'designer'
}

export function BookmarkButton({ id, type }: BookmarkButtonProps) {
  const supabase = createClient()
  const [isSaved, setIsSaved] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadSavedState() {
      const storageKey = `anoce_saved_${type}_${id}`
      const localSaved = localStorage.getItem(storageKey) === 'true'
      if (active) setIsSaved(localSaved)

      const { data: authData } = await supabase.auth.getUser()
      const user = authData.user
      if (!active) return

      if (!user) {
        setUserId(null)
        return
      }

      setUserId(user.id)

      const { data: existingBookmark } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('content_type', type)
        .eq('content_id', id)
        .maybeSingle()

      if (!active) return

      if (existingBookmark) {
        setIsSaved(true)
        localStorage.setItem(storageKey, 'true')
        return
      }

      if (localSaved) {
        const { error: insertError } = await supabase
          .from('bookmarks')
          .upsert(
            {
              user_id: user.id,
              content_id: id,
              content_type: type,
            },
            { onConflict: 'user_id,content_id,content_type' }
          )

        if (!insertError) {
          setIsSaved(true)
          localStorage.setItem(storageKey, 'true')
          return
        }
      }

      setIsSaved(false)
      localStorage.removeItem(storageKey)
    }

    loadSavedState()

    return () => {
      active = false
    }
  }, [id, type])

  const toggle = async () => {
    const newState = !isSaved
    const storageKey = `anoce_saved_${type}_${id}`

    setIsSaved(newState)
    if (newState) {
      localStorage.setItem(storageKey, 'true')
    } else {
      localStorage.removeItem(storageKey)
    }

    if (userId) {
      if (newState) {
        const { error } = await supabase
          .from('bookmarks')
          .upsert(
            {
              user_id: userId,
              content_id: id,
              content_type: type,
            },
            { onConflict: 'user_id,content_id,content_type' }
          )

        if (error) {
          setIsSaved(false)
          localStorage.removeItem(storageKey)
          return
        }
      } else {
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', userId)
          .eq('content_type', type)
          .eq('content_id', id)

        if (error) {
          setIsSaved(true)
          localStorage.setItem(storageKey, 'true')
          return
        }
      }
    }

    if (newState) {
      setShowFeedback(true)
      setTimeout(() => setShowFeedback(false), 500)
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={isSaved ? 'Remove bookmark' : 'Save bookmark'}
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
