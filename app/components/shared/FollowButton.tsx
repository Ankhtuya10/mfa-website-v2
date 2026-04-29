'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { UserPlus, UserCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface FollowButtonProps {
  designerId: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'dark'
}

export function FollowButton({ designerId, size = 'md', variant = 'default' }: FollowButtonProps) {
  const supabase = useMemo(() => createClient(), [])
  const storageKey = `anoce_followed_designer_${designerId}`
  const [isFollowing, setIsFollowing] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const isDark = variant === 'dark'

  useEffect(() => {
    let active = true

    async function loadFollowState() {
      const localFollowed = localStorage.getItem(storageKey) === 'true'
      if (active) setIsFollowing(localFollowed)

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!active) return

        if (!user) return

        const { data: existingBookmark, error } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('user_id', user.id)
          .eq('content_id', designerId)
          .eq('content_type', 'designer')
          .maybeSingle()

        if (error) throw error
        if (!active) return

        if (existingBookmark) {
          setIsFollowing(true)
          localStorage.setItem(storageKey, 'true')
          return
        }

        if (localFollowed) {
          const { error: insertError } = await supabase
            .from('bookmarks')
            .upsert(
              {
                user_id: user.id,
                content_id: designerId,
                content_type: 'designer',
              },
              { onConflict: 'user_id,content_id,content_type' }
            )

          if (!insertError) {
            setIsFollowing(true)
            localStorage.setItem(storageKey, 'true')
            return
          }
        }

        setIsFollowing(false)
        localStorage.removeItem(storageKey)
      } catch (error) {
        console.error('Error loading follow state:', error)
        if (active) setIsFollowing(localFollowed)
      }
    }

    loadFollowState()

    return () => {
      active = false
    }
  }, [designerId, storageKey, supabase])

  const toggle = async () => {
    if (isPending) return

    const previousState = isFollowing
    const newState = !previousState

    setIsFollowing(newState)
    setIsPending(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        if (newState) {
          const { error } = await supabase
            .from('bookmarks')
            .upsert(
              {
                user_id: user.id,
                content_id: designerId,
                content_type: 'designer',
              },
              { onConflict: 'user_id,content_id,content_type' }
            )

          if (error) throw error
        } else {
          const { error } = await supabase
            .from('bookmarks')
            .delete()
            .eq('user_id', user.id)
            .eq('content_id', designerId)
            .eq('content_type', 'designer')

          if (error) throw error
        }
      }

      if (newState) {
        localStorage.setItem(storageKey, 'true')
      } else {
        localStorage.removeItem(storageKey)
      }
    } catch (error) {
      console.error('Error updating follow:', error)
      setIsFollowing(previousState)

      if (previousState) {
        localStorage.setItem(storageKey, 'true')
      } else {
        localStorage.removeItem(storageKey)
      }
    } finally {
      setIsPending(false)
    }
  }

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }

  const iconSize = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      aria-pressed={isFollowing}
      aria-label={isFollowing ? 'Unfollow designer' : 'Follow designer'}
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full border transition-colors hover:bg-black/5 disabled:cursor-wait disabled:opacity-60 ${
        isFollowing
          ? 'border-white/20 bg-white/10 text-[#B7AEA9]'
          : 'border-white/20 bg-black/20 text-white/70 hover:text-white hover:border-white/40'
      }`}
    >
      <motion.div
        animate={isFollowing ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        {isFollowing ? (
          <UserCheck className={iconSize[size]} />
        ) : (
          <UserPlus className={iconSize[size]} />
        )}
      </motion.div>
    </button>
  )
}