'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface BookmarkButtonProps {
  id: string
  type: 'article' | 'look' | 'designer'
}

export function BookmarkButton({ id, type }: BookmarkButtonProps) {
  const supabase = useMemo(() => createClient(), [])
  const storageKey = `anoce_saved_${type}_${id}`
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  useEffect(() => {
    let active = true

    async function loadSavedState() {
      const localSaved = localStorage.getItem(storageKey) === 'true'
      if (active) setIsSaved(localSaved)

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!active) return

        if (!user) return

        const { data: existingBookmark, error } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('user_id', user.id)
          .eq('content_id', id)
          .eq('content_type', type)
          .maybeSingle()

        if (error) throw error
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
      } catch (error) {
        console.error('Error loading bookmark state:', error)
        if (active) setIsSaved(localSaved)
      }
    }

    loadSavedState()

    return () => {
      active = false
    }
  }, [id, storageKey, supabase, type])

  const toggle = async () => {
    if (isSaving) return

    const previousState = isSaved
    const newState = !previousState

    setIsSaved(newState)
    setIsSaving(true)

    if (newState) {
      setShowFeedback(true)
      setTimeout(() => setShowFeedback(false), 500)
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        if (newState) {
          const { error } = await supabase
            .from('bookmarks')
            .upsert(
              {
                user_id: user.id,
                content_id: id,
                content_type: type,
              },
              { onConflict: 'user_id,content_id,content_type' }
            )

          if (error) throw error
        } else {
          const { error } = await supabase
            .from('bookmarks')
            .delete()
            .eq('user_id', user.id)
            .eq('content_id', id)
            .eq('content_type', type)

          if (error) throw error
        }
      }

      if (newState) {
        localStorage.setItem(storageKey, 'true')
      } else {
        localStorage.removeItem(storageKey)
      }
    } catch (error) {
      console.error('Error updating bookmark:', error)
      setIsSaved(previousState)

      if (previousState) {
        localStorage.setItem(storageKey, 'true')
      } else {
        localStorage.removeItem(storageKey)
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={isSaving}
      aria-pressed={isSaved}
      aria-label={isSaved ? `Remove saved ${type}` : `Save ${type}`}
      className="relative p-2 transition-colors hover:bg-black/5 disabled:cursor-wait disabled:opacity-60"
    >
      <motion.div
        animate={showFeedback ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Heart
          className={`h-5 w-5 transition-colors ${
            isSaved ? 'fill-[#B7AEA9] text-[#B7AEA9]' : 'text-[rgba(0,0,0,0.3)]'
          }`}
        />
      </motion.div>
    </button>
  )
}
