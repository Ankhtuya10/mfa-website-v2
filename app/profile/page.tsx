'use client'

import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import Image from 'next/image'
import { StickyNavbar } from '@/app/components'
import { ArticleCard } from '@/app/components/shared/ArticleCard'
import { DesignerCard } from '@/app/components/shared/DesignerCard'
import { BookmarkButton } from '@/app/components/shared/BookmarkButton'
import { FollowButton } from '@/app/components/shared/FollowButton'
import { createClient } from '@/lib/supabase/client'
import { getArticles, getCollections, getDesigners } from '@/lib/supabase/queries'
import { useRouter } from 'next/navigation'

const TABS = [
  { id: 'articles', label: 'Saved Articles', eyebrow: 'Library' },
  { id: 'looks', label: 'Saved Looks', eyebrow: 'Library' },
  { id: 'following', label: 'Following', eyebrow: 'Designers' },
  { id: 'settings', label: 'Settings', eyebrow: 'Account' },
]

const EMPTY_QUOTES: Record<string, string> = {
  articles: '"The best fashion is the one that makes you feel like yourself."',
  looks: '"Style is a way to say who you are without having to speak."',
  following: '"Fashion is instant language." - Miuccia Prada',
}

const NOTIFICATIONS_STORAGE_KEY = 'anoce_profile_notifications'

interface Profile {
  id: string
  name: string | null
  email: string | null
  avatar_url: string | null
  role: string | null
  notifications?: {
    new_collections: boolean
    editorial_picks: boolean
    breaking_news: boolean
  } | null
  created_at: string
}

interface Article {
  id: string
  title: string
  slug: string
  cover_image?: string
  published_at?: string
  excerpt?: string
}

interface Look {
  id: string
  image: string
  title: string | null
  collections: { title: string | null; designer_name: string | null } | null
}

interface Designer {
  id: string
  name: string
  slug: string
  avatar?: string
  bio?: string
}

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState('articles')
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [savedArticles, setSavedArticles] = useState<Article[]>([])
  const [savedLooks, setSavedLooks] = useState<Look[]>([])
  const [followedDesigners, setFollowedDesigners] = useState<Designer[]>([])
  const [loading, setLoading] = useState(true)
  const [nameValue, setNameValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [canPersistNotifs, setCanPersistNotifs] = useState(true)
  const [notifications, setNotifications] = useState({
    new_collections: true,
    editorial_picks: true,
    breaking_news: false,
  })

  useEffect(() => {
    async function loadAll() {
      try {
        const {
          data: { user },
          error: authErr,
        } = await supabase.auth.getUser()
        if (authErr) console.error('[Profile] Auth error:', authErr)
        if (!user) {
          router.push('/login')
          return
        }
        setUser(user)

        let { data: loadedProfile, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        if (profileErr) console.error('[Profile] Profile fetch error:', profileErr)

        if (!loadedProfile) {
          const { data: np, error: insertErr } = await supabase
            .from('profiles')
            .insert({ id: user.id, name: user.email?.split('@')[0] || 'Anonymous' })
            .select()
            .single()
          if (insertErr) console.error('[Profile] Profile create error:', insertErr)
          loadedProfile = np
        }

        setProfile(loadedProfile)
        if (loadedProfile?.name) setNameValue(loadedProfile.name)

        const local = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)
        if (local) {
          try {
            setNotifications(JSON.parse(local))
          } catch {
            localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY)
          }
        } else if (loadedProfile?.notifications) {
          setNotifications(loadedProfile.notifications)
        }

        const { error: notifProbeErr } = await supabase
          .from('profiles')
          .select('notifications')
          .eq('id', user.id)
          .single()
        if (notifProbeErr) setCanPersistNotifs(false)

        const { data: bookmarks } = await supabase.from('bookmarks').select('*').eq('user_id', user.id)

        const articleIds = (bookmarks || []).filter((b) => b.content_type === 'article').map((b) => b.content_id)
        if (articleIds.length) {
          const articles = await getArticles({ status: 'published' })
          setSavedArticles((articles || []).filter((article: Article) => articleIds.includes(article.id)))
        }

        const lookIds = (bookmarks || []).filter((b) => b.content_type === 'look').map((b) => b.content_id)
        if (lookIds.length) {
          const collections = await getCollections()
          const looks = (collections || []).flatMap((collection: any) =>
            (Array.isArray(collection.looks) ? collection.looks : [])
              .filter((look: any) => lookIds.includes(look.id))
              .map((look: any) => ({
                ...look,
                title: look.description || `Look ${look.number || ''}`.trim(),
                collections: {
                  title: collection.title || null,
                  designer_name: collection.designer_name || collection.designerName || null,
                },
              })),
          )
          setSavedLooks(looks)
        }

        const designerIds = (bookmarks || [])
          .filter((b) => b.content_type === 'designer')
          .map((b) => b.content_id)
        if (designerIds.length) {
          const designers = await getDesigners()
          setFollowedDesigners((designers || []).filter((designer: Designer) => designerIds.includes(designer.id)))
        }
      } catch (err) {
        console.error('[Profile] Unexpected error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAll()
  }, [router, supabase])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) router.push('/login')
    })
    return () => subscription.unsubscribe()
  }, [supabase, router])

  async function handleSaveProfile() {
    if (!user) return
    setSaving(true)
    const { error } = await supabase.from('profiles').update({ name: nameValue }).eq('id', user.id)
    setSaving(false)
    if (!error) {
      setSaveSuccess(true)
      setProfile((prev) => (prev ? { ...prev, name: nameValue } : null))
      setTimeout(() => setSaveSuccess(false), 3000)
    }
  }

  async function handleToggle(key: string) {
    if (!user) return
    const updated = { ...notifications, [key]: !notifications[key as keyof typeof notifications] }
    setNotifications(updated)
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated))
    if (!canPersistNotifs) return
    const { error } = await supabase.from('profiles').update({ notifications: updated }).eq('id', user.id)
    if (error) setCanPersistNotifs(false)
  }

  async function handleChangePassword() {
    if (!user?.email) return
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
    })
    if (error) alert('Failed to send password reset email. Please try again.')
    else alert('Password reset email sent. Check your inbox.')
  }

  async function handleDeleteAccount() {
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) return
    await supabase.auth.signOut()
    router.push('/')
  }

  const userName = profile?.name || user?.email?.split('@')[0] || 'Anonymous'
  const userRole = profile?.role || 'viewer'
  const roleDisplay = userRole.charAt(0).toUpperCase() + userRole.slice(1)
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : ''
  const profileInit = userName[0]?.toUpperCase() || 'A'
  const activeTabMeta = TABS.find((t) => t.id === activeTab)!

  const contentCounts: Record<string, number> = {
    articles: savedArticles.length,
    looks: savedLooks.length,
    following: followedDesigners.length,
    settings: 0,
  }

  const shellTopOffset = 'calc(var(--safe-edge-y) + 72px)'

  if (loading) {
    return (
      <div className="h-screen w-full overflow-hidden bg-[#080808]">
        <div className="relative h-full w-full overflow-hidden bg-[#080808]">
          <StickyNavbar />
          <div className="flex h-full" style={{ paddingTop: shellTopOffset }}>
            <aside className="w-[340px] shrink-0 border-r border-white/[0.07] p-9">
              <div className="flex flex-col items-center gap-4">
                <div className="h-24 w-24 animate-pulse rounded-full bg-white/[0.06]" />
                <div className="h-5 w-32 animate-pulse rounded bg-white/[0.06]" />
                <div className="h-3 w-48 animate-pulse rounded bg-white/[0.04]" />
              </div>
              <div className="mt-8 grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/[0.04]" />
                ))}
              </div>
            </aside>
            <main className="flex-1 p-10">
              <div className="h-12 w-64 animate-pulse rounded bg-white/[0.04]" />
            </main>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="h-screen w-full overflow-hidden bg-[#080808]">
        <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#080808]">
          <StickyNavbar />
          <p className="font-serif text-3xl text-white">Not signed in</p>
          <a
            href="/login"
            className="mt-6 text-[10px] uppercase tracking-widest text-[#B7AEA9] hover:text-white"
          >
            Go to Login {"->"}
          </a>
        </div>
      </div>
    )
  }

  const EmptyState = ({
    icon,
    title,
    description,
    cta,
    href,
    quote,
  }: {
    icon: ReactNode
    title: string
    description: string
    cta: string
    href: string
    quote?: string
  }) => (
    <div className="relative flex h-full min-h-[340px] flex-col items-center justify-center text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-white/[0.07]">
        {icon}
      </div>
      <h3 className="mb-3 font-serif text-[28px] font-light text-white">{title}</h3>
      <p className="max-w-[260px] text-[11px] leading-[1.75] text-white/40">{description}</p>
      <a
        href={href}
        className="mt-7 rounded-full border border-white/[0.14] px-7 py-2.5 text-[8px] uppercase tracking-[0.3em] text-[#B7AEA9] transition-all hover:border-white/[0.24] hover:bg-white/[0.06] hover:text-white"
      >
        {cta}
      </a>
      {quote && (
        <p className="pointer-events-none absolute bottom-6 left-0 right-0 font-serif text-[12px] italic font-light tracking-[0.08em] text-white/[0.09]">
          {quote}
        </p>
      )}
    </div>
  )

  return (
    <div className="h-screen w-full overflow-hidden bg-[#080808]">
      <div className="relative h-full w-full overflow-hidden bg-[#080808]">
        <StickyNavbar />

        <div className="flex h-full" style={{ paddingTop: shellTopOffset }}>
          <aside className="flex w-[340px] shrink-0 flex-col overflow-hidden border-r border-white/[0.07]">
            <div className="px-7 pb-6 pt-10">
            <div className="mb-7 flex flex-col items-center text-center">
              <div className="relative mb-5">
                <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/[0.12] bg-white/[0.04]">
                  {profile?.avatar_url ? (
                    <Image src={profile.avatar_url} alt={userName} fill className="object-cover" />
                  ) : (
                    <span className="font-serif text-[42px] font-light text-[#D4C9B8]">{profileInit}</span>
                  )}
                </div>
                <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full border-2 border-[#080808] bg-green-400" />
              </div>
              <p className="mb-2.5 text-[8px] uppercase tracking-[0.42em] text-[#6B6560]">{roleDisplay}</p>
              <h1 className="mb-2 font-serif text-[48px] font-light leading-[0.95] text-white">{userName}</h1>
              <p className="text-[11px] tracking-[0.05em] text-white/36">{user.email}</p>
              {joinedDate && (
                <p className="mt-1.5 text-[8px] uppercase tracking-[0.3em] text-[#6B6560]">Joined {joinedDate}</p>
              )}
            </div>
            </div>

            <div className="mx-7 mb-6 h-px bg-white/[0.07]" />

            <div className="mb-6 grid grid-cols-3 gap-2 px-5">
              {[
                { label: 'Saved', value: savedArticles.length },
                { label: 'Looks', value: savedLooks.length },
                { label: 'Following', value: followedDesigners.length },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-[20px] border border-white/[0.07] bg-white/[0.03] px-2 py-4 text-center transition-colors hover:border-white/[0.12]"
                >
                  <div className="font-serif text-[44px] font-light leading-none text-white">{s.value}</div>
                  <div className="mt-1 text-[8px] uppercase tracking-[0.3em] text-[#6B6560]">{s.label}</div>
                </div>
              ))}
            </div>

            <nav className="mt-auto flex flex-col gap-1 px-4 pb-6">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{ paddingLeft: '18px', paddingRight: '18px' }}
                  className={`group flex min-h-[40px] w-full items-center justify-between rounded-[14px] px-4 py-[11px] text-[9px] uppercase tracking-[0.28em] transition-all ${
                    activeTab === tab.id
                      ? 'border border-white/[0.07] bg-white/[0.06] text-[#D4C9B8]'
                      : 'border border-transparent text-[#6B6560] hover:bg-white/[0.03] hover:text-white/70'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[11px] transition-opacity ${
                      activeTab === tab.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {"->"}
                  </span>
                </button>
              ))}
            </nav>
          </aside>

          <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex items-end justify-between border-b border-white/[0.07] px-10 pb-7 pt-10 md:px-12">
            <div>
              <p className="mb-2 text-[8px] uppercase tracking-[0.38em] text-[#6B6560]">{activeTabMeta.eyebrow}</p>
              <h2
                className="font-serif text-[52px] font-light leading-[1.02] text-white"
                style={{ fontStyle: activeTab === 'settings' ? 'normal' : 'italic' }}
              >
                {activeTabMeta.label}
              </h2>
            </div>
            {activeTab !== 'settings' && (
              <div className="font-serif text-[64px] font-light leading-none text-white/[0.06]">
                {contentCounts[activeTab]}
              </div>
            )}
          </div>

          <div className="relative flex-1 overflow-y-auto px-10 py-9 md:px-12">
{activeTab === 'articles' &&
              (savedArticles.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {savedArticles.map((a) => (
                    <div key={a.id} className="relative">
                      <ArticleCard article={a} variant="grid" />
                      <div className="absolute top-4 right-4 z-10">
                        <BookmarkButton id={a.id} type="article" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={
                    <svg
                      className="h-[22px] w-[22px]"
                      fill="none"
                      stroke="#6B6560"
                      strokeWidth={1.3}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                      />
                    </svg>
                  }
                  title="No saved articles yet"
                  description="Bookmark articles as you read to build your personal editorial shelf."
                  cta="Browse Editorial"
                  href="/editorial"
                  quote={EMPTY_QUOTES.articles}
                />
              ))}

{activeTab === 'looks' &&
              (savedLooks.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {savedLooks.map((look) => (
                    <div
                      key={look.id}
                      className="group relative aspect-[4/5] overflow-hidden rounded-[28px] border border-white/[0.07] p-2"
                    >
                      <div className="absolute top-4 right-4 z-10">
                        <BookmarkButton id={look.id} type="look" />
                      </div>
                      <Image
                        src={look.image}
                        alt={look.title || 'Look'}
                        fill
                        className="rounded-[22px] object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-x-2 bottom-2 rounded-[22px] bg-gradient-to-t from-black/85 via-black/40 to-transparent px-5 pb-5 pt-12">
                        <p className="text-[9px] uppercase tracking-[0.22em] text-white/50">
                          {look.collections?.designer_name || 'Saved Look'}
                        </p>
                        <p className="mt-1.5 font-serif text-[18px] font-light leading-tight text-white">
                          {look.collections?.title || look.title || 'Untitled'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={
                    <svg
                      className="h-[22px] w-[22px]"
                      fill="none"
                      stroke="#6B6560"
                      strokeWidth={1.3}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  }
                  title="No saved looks yet"
                  description="Explore collections and save the looks you want to revisit later."
                  cta="Explore Archive"
                  href="/archive"
                  quote={EMPTY_QUOTES.looks}
                />
              ))}

{activeTab === 'following' &&
              (followedDesigners.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {followedDesigners.map((d) => (
                    <div key={d.id} className="relative">
                      <DesignerCard designer={d} variant="grid" />
                      <div className="absolute top-4 right-4 z-10">
                        <FollowButton designerId={d.id} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={
                    <svg
                      className="h-[22px] w-[22px]"
                      fill="none"
                      stroke="#6B6560"
                      strokeWidth={1.3}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                  }
                  title="Not following anyone yet"
                  description="Follow designers from their profiles to keep your favorites close."
                  cta="Discover Designers"
                  href="/designers"
                  quote={EMPTY_QUOTES.following}
                />
              ))}

            {activeTab === 'settings' && (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr]">
                <div className="col-span-full rounded-[28px] border border-white/[0.07] bg-white/[0.03] p-7">
                  <h3 className="mb-7 text-center font-serif text-[22px] font-light text-white">Profile</h3>
                  <div className="mx-auto max-w-sm space-y-4">
                    <div>
                      <label className="mb-2 block text-[8px] uppercase tracking-[0.28em] text-[#6B6560]">
                        Display name
                      </label>
                      <input
                        type="text"
                        value={nameValue}
                        onChange={(e) => setNameValue(e.target.value)}
                        className="w-full rounded-[12px] border border-white/[0.07] bg-white/[0.025] px-4 py-3 text-center text-[12px] tracking-[0.03em] text-white outline-none transition-colors focus:border-white/[0.22]"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-[8px] uppercase tracking-[0.28em] text-[#6B6560]">
                        Email address
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full cursor-not-allowed rounded-[12px] border border-white/[0.05] bg-white/[0.015] px-4 py-3 text-center text-[12px] tracking-[0.03em] text-white/25 outline-none"
                      />
                      <p className="mt-2 text-center text-[9px] leading-relaxed text-white/24">
                        Contact support to update your email address.
                      </p>
                    </div>
                    <div className="pt-1 text-center">
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className={`rounded-full border border-white/[0.14] px-7 py-2.5 text-[8px] uppercase tracking-[0.3em] transition-all hover:border-white/[0.24] hover:bg-white/[0.06] ${
                          saving ? 'cursor-not-allowed opacity-40' : ''
                        } ${saveSuccess ? 'text-green-400' : 'text-[#D4C9B8]'}`}
                      >
                        {saving ? 'Saving...' : saveSuccess ? 'Saved ?' : 'Save changes'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/[0.07] bg-white/[0.03] p-7">
                  <h3 className="mb-6 text-center font-serif text-[22px] font-light text-white">Notifications</h3>
                  <div className="space-y-2">
                    {([
                      ['New collection drops', 'new_collections'],
                      ['Editorial picks', 'editorial_picks'],
                      ['Breaking fashion news', 'breaking_news'],
                    ] as [string, string][]).map(([label, key]) => (
                      <label
                        key={key}
                        className="flex cursor-pointer items-center justify-between gap-4 rounded-[14px] border border-white/[0.07] px-4 py-3 transition-colors hover:border-white/[0.12]"
                      >
                        <span className="text-[11px] text-white/62">{label}</span>
                        <div className="relative shrink-0">
                          <input
                            type="checkbox"
                            checked={notifications[key as keyof typeof notifications]}
                            onChange={() => handleToggle(key)}
                            className="peer sr-only"
                          />
                          <div className="h-[22px] w-[42px] rounded-full bg-white/[0.09] transition-colors peer-checked:bg-white/[0.45]" />
                          <div className="absolute left-[3px] top-[3px] h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center gap-4 rounded-[28px] border border-white/[0.07] bg-white/[0.03] p-7 text-center">
                  <h3 className="font-serif text-[22px] font-light text-white">Account</h3>
                  <button
                    onClick={handleChangePassword}
                    className="rounded-full border border-white/[0.14] px-7 py-2.5 text-[8px] uppercase tracking-[0.3em] text-[#D4C9B8] transition-all hover:border-white/[0.24] hover:bg-white/[0.06]"
                  >
                    Change password
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="text-[8px] uppercase tracking-[0.26em] text-red-400 transition-colors hover:text-red-300"
                  >
                    Delete account
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      </div>
    </div>
  )
}

