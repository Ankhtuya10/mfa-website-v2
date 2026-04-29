'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, MessageCircle, Send, Sparkles, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
}

type AuthState = 'loading' | 'signed-in' | 'signed-out'

const starterSuggestions = [
  'Одоо ямар trend байна?',
  'Ноолуурын брэндүүд',
  'Streetwear санал болго',
]

const insufficientContextMessage =
  'Anoce архивын өгөгдөл дотроос энэ талаар хангалттай мэдээлэл олдсонгүй.'

function createMessageId(role: ChatMessage['role']) {
  return `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-label="Хариулт бэлдэж байна">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="h-1.5 w-1.5 rounded-full bg-[#D8CABA]/75 animate-pulse"
          style={{ animationDelay: `${index * 140}ms` }}
        />
      ))}
    </span>
  )
}

export function AnoceChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [authState, setAuthState] = useState<AuthState>('loading')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      setAuthState(data.user ? 'signed-in' : 'signed-out')
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState(session?.user ? 'signed-in' : 'signed-out')
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!isOpen) return

    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    })
  }, [isOpen, messages, isSending])

  const sendChatMessage = async (rawMessage: string) => {
    const trimmedMessage = rawMessage.trim()
    if (!trimmedMessage || isSending || authState !== 'signed-in') return

    setMessages((current) => [
      ...current,
      {
        id: createMessageId('user'),
        role: 'user',
        text: trimmedMessage,
      },
    ])
    setMessage('')
    setIsSending(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: trimmedMessage }),
      })

      const payload = (await response.json()) as { answer?: string; error?: string }

      if (response.status === 401) {
        setAuthState('signed-out')
        throw new Error(payload.error ?? 'Нэвтрэх шаардлагатай.')
      }

      if (!response.ok) {
        throw new Error(payload.answer ?? payload.error ?? 'Anoce AI түр хариу өгөх боломжгүй байна.')
      }

      setMessages((current) => [
        ...current,
        {
          id: createMessageId('assistant'),
          role: 'assistant',
          text: payload.answer?.trim() || insufficientContextMessage,
        },
      ])
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: createMessageId('assistant'),
          role: 'assistant',
          text:
            error instanceof Error
              ? error.message
              : 'Anoce AI түр хариу өгөх боломжгүй байна. Дахин оролдоно уу.',
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void sendChatMessage(message)
  }

  return (
    <div className="fixed bottom-4 right-3 z-[70] flex flex-col items-end gap-3 sm:bottom-7 sm:right-7">
      <AnimatePresence>
        {isOpen && (
          <motion.section
            key="anoce-chat-panel"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-[min(620px,calc(100vh-96px))] w-[calc(100vw-24px)] flex-col overflow-hidden rounded-lg border border-[#D8CABA]/20 bg-[#100D0B]/85 text-[#F7EFE4] shadow-[0_28px_90px_rgba(0,0,0,0.44)] backdrop-blur-2xl sm:w-[380px]"
            aria-label="Anoce AI чат"
          >
            <div className="border-b border-[#D8CABA]/15 bg-white/[0.04] px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 text-[#D8CABA]/70">
                    <Sparkles size={14} aria-hidden="true" />
                    <p className="font-sans text-[9px] uppercase tracking-[0.26em]">
                      Монгол fashion archive assistant
                    </p>
                  </div>
                  <h2 className="font-serif text-2xl leading-none text-[#F7EFE4]">Anoce AI</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#D8CABA]/10 text-[#D8CABA]/70 transition hover:border-[#D8CABA]/30 hover:bg-white/[0.06] hover:text-[#F7EFE4]"
                  aria-label="Чатыг хаах"
                >
                  <X size={17} aria-hidden="true" />
                </button>
              </div>
            </div>

            {authState === 'loading' && (
              <div className="flex flex-1 items-center justify-center">
                <div className="rounded-full border border-[#D8CABA]/15 bg-white/[0.04] px-4 py-3">
                  <TypingDots />
                </div>
              </div>
            )}

            {authState === 'signed-out' && (
              <div className="flex flex-1 flex-col justify-between px-5 py-6">
                <div>
                  <p className="font-serif text-3xl leading-tight text-[#F7EFE4]">
                    Архивтай ярилцахын өмнө нэвтэрнэ үү.
                  </p>
                  <p className="mt-4 font-sans text-sm leading-6 text-[#D8CABA]/72">
                    Anoce AI нь хэрэглэгчийн эрхээр ажилладаг. Нэвтэрсний дараа Монгол хэлээр брэнд,
                    материал, mood, чиг хандлагын талаар асууж болно.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="mt-8 inline-flex w-full items-center justify-center rounded-full border border-[#D8CABA]/30 bg-[#D8CABA] px-5 py-3 font-sans text-[10px] font-semibold uppercase tracking-[0.24em] text-[#16110E] transition hover:bg-[#F3E8D6]"
                >
                  Нэвтрэх
                </Link>
              </div>
            )}

            {authState === 'signed-in' && (
              <>
                <div
                  ref={scrollRef}
                  className="flex-1 space-y-4 overflow-y-auto px-4 py-4 [scrollbar-color:#D8CABA33_transparent] [scrollbar-width:thin]"
                >
                  {messages.length === 0 && (
                    <div className="flex min-h-full flex-col justify-end">
                      <div className="rounded-lg border border-[#D8CABA]/14 bg-white/[0.045] p-4">
                        <p className="font-serif text-2xl leading-tight text-[#F7EFE4]">
                          Монгол загварын архивын тайван өрөө.
                        </p>
                        <p className="mt-3 font-sans text-sm leading-6 text-[#D8CABA]/72">
                          Брэндийн өнгө аяс, материалын ой санамж, Улаанбаатарын streetwear, heritage
                          silhouette-ийн тухай асуугаарай.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {starterSuggestions.map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => void sendChatMessage(suggestion)}
                              disabled={isSending}
                              className="rounded-full border border-[#D8CABA]/18 bg-[#D8CABA]/8 px-3 py-2 font-sans text-[11px] text-[#F3E8D6] transition hover:border-[#D8CABA]/35 hover:bg-[#D8CABA]/14 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {messages.map((item) => (
                    <div
                      key={item.id}
                      className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[88%] whitespace-pre-wrap break-words rounded-lg px-4 py-3 font-sans text-sm leading-6 ${
                          item.role === 'user'
                            ? 'bg-[#D8CABA] text-[#16110E] shadow-[0_12px_30px_rgba(0,0,0,0.18)]'
                            : 'border border-[#D8CABA]/14 bg-white/[0.07] text-[#F7EFE4]'
                        }`}
                      >
                        {item.text}
                      </div>
                    </div>
                  ))}

                  {isSending && (
                    <div className="flex justify-start">
                      <div className="inline-flex items-center rounded-lg border border-[#D8CABA]/14 bg-white/[0.07] px-4 py-3">
                        <TypingDots />
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="border-t border-[#D8CABA]/15 bg-[#0D0A09]/80 p-3">
                  <label htmlFor="anoce-chat-message" className="sr-only">
                    Anoce AI-д асуулт бичих
                  </label>
                  <div className="flex items-end gap-2">
                    <textarea
                      id="anoce-chat-message"
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                          event.preventDefault()
                          event.currentTarget.form?.requestSubmit()
                        }
                      }}
                      rows={2}
                      maxLength={1000}
                      disabled={isSending}
                      placeholder="Anoce архиваас асуух..."
                      className="max-h-28 min-h-12 flex-1 resize-none rounded-lg border border-[#D8CABA]/16 bg-white/[0.055] px-3 py-2.5 font-sans text-sm leading-5 text-[#F7EFE4] outline-none transition placeholder:text-[#D8CABA]/42 focus:border-[#D8CABA]/45 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    <button
                      type="submit"
                      disabled={!message.trim() || isSending}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#D8CABA]/20 bg-[#D8CABA] text-[#16110E] transition hover:bg-[#F3E8D6] disabled:cursor-not-allowed disabled:opacity-45"
                      aria-label="Асуулт илгээх"
                    >
                      {isSending ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Send size={16} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full border border-[#D8CABA]/28 bg-[#100D0B]/88 text-[#F7EFE4] shadow-[0_16px_50px_rgba(0,0,0,0.38)] backdrop-blur-xl transition hover:border-[#D8CABA]/55 hover:bg-[#1A1512] focus:outline-none focus:ring-2 focus:ring-[#D8CABA] focus:ring-offset-2 focus:ring-offset-[#100D0B]"
        aria-label={isOpen ? 'Anoce AI чатыг хаах' : 'Anoce AI чатыг нээх'}
        aria-expanded={isOpen}
      >
        <span className="absolute inset-0 rounded-full bg-[#D8CABA]/10 opacity-0 transition group-hover:opacity-100" />
        {isOpen ? <X size={22} aria-hidden="true" /> : <MessageCircle size={22} aria-hidden="true" />}
      </button>
    </div>
  )
}
