'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { StickyNavbar, Footer } from '@/app/components'
import { ArticleCard } from '@/app/components/shared/ArticleCard'
import { DesignerCard } from '@/app/components/shared/DesignerCard'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const tabs = ['Saved Articles', 'Saved Looks', 'Following', 'Settings']

interface Profile {
  id: string
  name: string | null
  email: string | null
  avatar_url: string | null
  role: string | null
  notifications: {
    new_collections: boolean
    editorial_picks: boolean
    breaking_news: boolean
  } | null
  created_at: string
}

interface Bookmark {
  id: string
  user_id: string
  content_type: string
  content_id: string
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
  collections: {
    title: string | null
    designer_name: string | null
  } | null
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

  const [activeTab, setActiveTab] = useState('Saved Articles')
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [savedArticles, setSavedArticles] = useState<Article[]>([])
  const [savedLooks, setSavedLooks] = useState<Look[]>([])
  const [followedDesigners, setFollowedDesigners] = useState<Designer[]>([])
  const [loading, setLoading] = useState(true)

  const [nameValue, setNameValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [notifications, setNotifications] = useState({
    new_collections: true,
    editorial_picks: true,
    breaking_news: false,
  })

  useEffect(() => {
    async function loadAll() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          console.error('[Profile] Auth error:', authError)
        }
        
        if (authError) {
          console.error('[Profile] Auth error:', authError)
        }
        
        if (!user) {
          router.push('/login')
          return
        }
        setUser(user)

        let { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('[Profile] Error fetching profile:', profileError)
        }

        if (!profile) {
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({ id: user.id, name: user.email?.split('@')[0] || 'Anonymous' })
            .select()
            .single()
          
          if (insertError) {
            console.error('[Profile] Error creating profile:', insertError)
          }
          profile = newProfile
        }

        setProfile(profile)
        if (profile?.name) setNameValue(profile.name)
        if (profile?.notifications) setNotifications(profile.notifications)

        const { data: bookmarks, error: bookmarksError } = await supabase
          .from('bookmarks')
          .select('*')
          .eq('user_id', user.id)
        
        if (bookmarksError) {
          console.error('[Profile] Error fetching bookmarks:', bookmarksError)
        }
        setBookmarks(bookmarks || [])

        const articleIds = (bookmarks || [])
          .filter(b => b.content_type === 'article')
          .map(b => b.content_id)
        
        if (articleIds.length > 0) {
          const { data: articles, error: articlesError } = await supabase
            .from('articles')
            .select('*')
            .in('id', articleIds)
            .eq('status', 'published')
          
          if (articlesError) {
            console.error('[Profile] Error fetching saved articles:', articlesError)
          }
          setSavedArticles(articles || [])
        }

        const lookIds = (bookmarks || [])
          .filter(b => b.content_type === 'look')
          .map(b => b.content_id)
        
        if (lookIds.length > 0) {
          const { data: looks, error: looksError } = await supabase
            .from('looks')
            .select('*, collections(title, designer_name)')
            .in('id', lookIds)
          
          if (looksError) {
            console.error('[Profile] Error fetching saved looks:', looksError)
          }
          setSavedLooks(looks || [])
        }

        const designerIds = (bookmarks || [])
          .filter(b => b.content_type === 'designer')
          .map(b => b.content_id)
        
        if (designerIds.length > 0) {
          const { data: designers, error: designersError } = await supabase
            .from('designers')
            .select('*')
            .in('id', designerIds)
          
          if (designersError) {
            console.error('[Profile] Error fetching followed designers:', designersError)
          }
          setFollowedDesigners(designers || [])
        }

        setLoading(false)
      } catch (err) {
        console.error('[Profile] Unexpected error loading profile:', err)
        setLoading(false)
      }
    }

    loadAll()
  }, [])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/login')
      }
      if (event === 'TOKEN_REFRESHED') {
        console.log('[Profile] Token refreshed successfully')
      }
      if (event === 'USER_UPDATED') {
        console.log('[Profile] User updated:', session?.user)
      }
      if (event === 'SIGNED_IN') {
        console.log('[Profile] User signed in:', session?.user)
      }
    })
    return () => subscription.unsubscribe()
  }, [supabase, router])

  async function handleSaveProfile() {
    if (!user) return
    setSaving(true)
    
    const { error } = await supabase
      .from('profiles')
      .update({ name: nameValue })
      .eq('id', user.id)
    
    setSaving(false)
    if (error) {
      console.error('[Profile] Error saving profile:', error)
    } else {
      setSaveSuccess(true)
      setProfile(prev => prev ? { ...prev, name: nameValue } : null)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
  }

  async function handleToggle(key: string) {
    if (!user) return
    const updated = { ...notifications, [key]: !notifications[key as keyof typeof notifications] }
    setNotifications(updated)
    
    const { error } = await supabase
      .from('profiles')
      .update({ notifications: updated })
      .eq('id', user.id)
    
    if (error) {
      console.error('[Profile] Error updating notifications:', error)
    }
  }

  async function handleChangePassword() {
    if (!user?.email) return
    
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
    })
    
    if (error) {
      console.error('[Profile] Error sending password reset email:', error)
      alert('Failed to send password reset email. Please try again.')
    } else {
      alert('Password reset email sent. Check your inbox.')
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This cannot be undone.'
    )
    if (!confirmed) return
    
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('[Profile] Error signing out:', error)
    }
    router.push('/')
  }

  const userName = profile?.name || user?.email?.split('@')[0] || 'Anonymous'
  const userRole = profile?.role || 'viewer'
  const roleDisplay = userRole.charAt(0).toUpperCase() + userRole.slice(1)
  const joinedDate = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''
  const profileInitial = userName[0]?.toUpperCase() || 'A'
  const statCards = [
    { label: 'Saved', value: savedArticles.length },
    { label: 'Looks', value: savedLooks.length },
    { label: 'Following', value: followedDesigners.length },
  ]

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen justify-between bg-[#0A0A0A]">
        <StickyNavbar />
        <div className="flex-1">
          <section className="bg-[#0A0A0A] py-20">
            <div className="max-w-6xl mx-auto px-8 w-full">
              <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-[#B7AEA9]/30 animate-pulse" />
                  <div>
                    <div className="w-48 h-8 bg-[#B7AEA9]/30 animate-pulse rounded" />
                    <div className="w-32 h-4 bg-[#B7AEA9]/20 animate-pulse mt-2 rounded" />
                  </div>
                </div>
                <div className="flex gap-16">
                  <div className="w-16 h-8 bg-[#B7AEA9]/20 animate-pulse" />
                  <div className="w-16 h-8 bg-[#B7AEA9]/20 animate-pulse" />
                  <div className="w-16 h-8 bg-[#B7AEA9]/20 animate-pulse" />
                </div>
              </div>
            </div>
          </section>
          <div className="sticky top-20 z-40 bg-transparent">
            <div className="max-w-6xl mx-auto px-8">
              <div className="glass-panel-dark rounded-full px-6 py-4 flex gap-10">
                {tabs.map((tab) => (
                  <div key={tab} className="w-20 h-4 bg-[#B7AEA9]/20 animate-pulse" />
                ))}
              </div>
            </div>
          </div>
          <div className="max-w-6xl mx-auto px-8 w-full py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-panel-dark rounded-[34px] animate-pulse aspect-[3/4]" />
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen justify-between bg-[#0A0A0A]">
        <StickyNavbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <h1 className="font-serif text-4xl text-white mb-4">Not logged in</h1>
          <a href="/login" className="font-sans text-[11px] tracking-[2px] uppercase text-[#B7AEA9] hover:text-white">
            Go to Login →
          </a>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-[#0A0A0A]">
      <StickyNavbar />

      <main className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth snap-container pt-[72px] md:pt-[88px]">
        <section className="snap-start relative h-screen w-full overflow-hidden bg-[#0A0A0A] px-6 pb-6 pt-[92px] md:px-10 md:pb-8 md:pt-[108px] lg:px-14">
          <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-center">
            <div className="glass-panel-dark flex w-full max-w-5xl flex-col items-center justify-center gap-8 rounded-[42px] px-8 py-10 text-center md:px-12 md:py-12 lg:px-16">
              <div className="flex flex-col items-center gap-5">
                <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-[#B7AEA9] ring-4 ring-white/10 md:h-32 md:w-32">
                  {profile?.avatar_url ? (
                    <Image src={profile.avatar_url} alt={userName} fill className="object-cover" />
                  ) : (
                    <span className="font-serif text-5xl text-white">{profileInitial}</span>
                  )}
                </div>
                <div className="max-w-2xl space-y-2">
                  <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-[#9B9590]">{roleDisplay}</p>
                  <h1 className="font-serif text-4xl leading-none text-white md:text-5xl [overflow-wrap:anywhere]">{userName}</h1>
                  <p className="mx-auto max-w-xl font-sans text-base leading-relaxed text-white/62 [overflow-wrap:anywhere]">{user.email}</p>
                  {joinedDate && (
                    <p className="font-sans text-[10px] tracking-[0.28em] uppercase text-[#9B9590]">Joined {joinedDate}</p>
                  )}
                </div>
              </div>

              <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
                {statCards.map((stat) => (
                  <div key={stat.label} className="glass-panel-dark flex min-h-[148px] min-w-0 flex-col items-center justify-center rounded-[32px] px-6 py-6 text-center">
                    <span className="font-serif text-5xl leading-none text-white md:text-6xl">{stat.value}</span>
                    <span className="mt-3 font-sans text-[10px] tracking-[0.26em] uppercase text-[#9B9590]">{stat.label}</span>
                  </div>
                ))}
              </div>

              <div className="glass-panel-dark flex w-full max-w-4xl flex-wrap items-center justify-center gap-3 rounded-full px-4 py-4 md:px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-full px-5 py-2.5 font-sans text-[10px] tracking-[0.24em] uppercase transition-all ${
                      activeTab === tab
                        ? 'bg-white text-[#0A0A0A] shadow-[0_8px_24px_rgba(255,255,255,0.16)]'
                        : 'border border-white/[0.08] bg-white/[0.03] text-[#B7AEA9] hover:border-white/[0.18] hover:bg-white/[0.07] hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="snap-start relative h-screen w-full overflow-hidden border-t border-white/[0.06] bg-[#0A0A0A] px-6 pb-6 pt-[92px] md:px-10 md:pb-8 md:pt-[108px] lg:px-14">
          <div className="mx-auto flex h-full w-full max-w-6xl flex-col">
            <div className="glass-panel-dark relative flex-1 overflow-hidden rounded-[40px]">
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col items-center px-6 pt-6 text-center md:pt-7">
                <p className="mb-3 font-sans text-[10px] tracking-[0.3em] uppercase text-[#9B9590]">Profile Library</p>
                <h2 className="font-serif text-3xl leading-none text-white md:text-4xl">{activeTab}</h2>
              </div>

              <div className="h-full overflow-y-auto px-6 pb-6 pt-28 md:px-8 md:pb-8 md:pt-32">
                {activeTab === 'Saved Articles' && (
                  savedArticles.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {savedArticles.map((article) => (
                        <ArticleCard key={article.id} article={article} variant="grid" />
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-full min-h-[480px] flex-col items-center justify-center text-center">
                      <div className="glass-panel-dark mb-6 flex h-20 w-20 items-center justify-center rounded-full">
                        <svg className="h-10 w-10 text-[#9B9590]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                      </div>
                      <h3 className="font-serif text-2xl text-white">No saved articles yet</h3>
                      <p className="mt-3 max-w-md font-sans text-white/58">Bookmark articles as you read to build your personal editorial shelf.</p>
                      <a href="/editorial" className="glass-pill-dark mt-8 inline-block px-8 py-3 font-sans text-[11px] tracking-[0.24em] uppercase text-white hover:bg-white/[0.08]">
                        Browse Editorial
                      </a>
                    </div>
                  )
                )}

                {activeTab === 'Saved Looks' && (
                  savedLooks.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {savedLooks.map((look) => (
                        <div key={look.id} className="glass-panel-dark group relative aspect-[4/5] overflow-hidden rounded-[32px] p-2.5">
                          <Image
                            src={look.image}
                            alt={look.title || 'Look'}
                            fill
                            className="rounded-[24px] object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-x-2.5 bottom-2.5 rounded-[24px] bg-gradient-to-t from-black/85 via-black/45 to-transparent px-5 pb-5 pt-12">
                            <p className="font-sans text-[10px] tracking-[0.22em] uppercase text-white/62 [overflow-wrap:anywhere]">
                              {look.collections?.designer_name || 'Saved Look'}
                            </p>
                            <p className="mt-2 font-serif text-xl leading-tight text-white [overflow-wrap:anywhere]">
                              {look.collections?.title || look.title || 'Untitled look'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-full min-h-[480px] flex-col items-center justify-center text-center">
                      <div className="glass-panel-dark mb-6 flex h-20 w-20 items-center justify-center rounded-full">
                        <svg className="h-10 w-10 text-[#9B9590]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="font-serif text-2xl text-white">No saved looks yet</h3>
                      <p className="mt-3 max-w-md font-sans text-white/58">Explore collections and save the looks you want to revisit later.</p>
                      <a href="/archive" className="glass-pill-dark mt-8 inline-block px-8 py-3 font-sans text-[11px] tracking-[0.24em] uppercase text-white hover:bg-white/[0.08]">
                        Explore Archive
                      </a>
                    </div>
                  )
                )}

                {activeTab === 'Following' && (
                  followedDesigners.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {followedDesigners.map((designer) => (
                        <DesignerCard key={designer.id} designer={designer} variant="grid" />
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-full min-h-[480px] flex-col items-center justify-center text-center">
                      <div className="glass-panel-dark mb-6 flex h-20 w-20 items-center justify-center rounded-full">
                        <svg className="h-10 w-10 text-[#9B9590]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </div>
                      <h3 className="font-serif text-2xl text-white">Not following anyone yet</h3>
                      <p className="mt-3 max-w-md font-sans text-white/58">Follow designers from their profiles to keep your favorites close.</p>
                      <a href="/designers" className="glass-pill-dark mt-8 inline-block px-8 py-3 font-sans text-[11px] tracking-[0.24em] uppercase text-white hover:bg-white/[0.08]">
                        Discover Designers
                      </a>
                    </div>
                  )
                )}

                {activeTab === 'Settings' && (
                  <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                    <div className="space-y-6">
                      <div className="glass-panel-dark rounded-[34px] p-8 md:p-10">
                        <h3 className="mb-8 text-center font-serif text-3xl text-white">Profile Settings</h3>
                        <div className="space-y-6">
                          <div>
                            <label className="mb-2 block font-sans text-[10px] tracking-[0.24em] uppercase text-[#9B9590]">Full Name</label>
                            <input
                              type="text"
                              value={nameValue}
                              onChange={(e) => setNameValue(e.target.value)}
                              className="w-full rounded-[20px] border border-white/[0.1] bg-white/[0.03] px-5 py-4 text-center font-sans text-[15px] text-white outline-none transition-colors focus:border-white/30"
                            />
                          </div>
                          <div>
                            <label className="mb-2 block font-sans text-[10px] tracking-[0.24em] uppercase text-[#9B9590]">Email</label>
                            <input
                              type="email"
                              value={user?.email || ''}
                              disabled
                              className="w-full cursor-not-allowed rounded-[20px] border border-white/[0.08] bg-white/[0.02] px-5 py-4 text-center font-sans text-[15px] text-white/46 outline-none"
                            />
                            <p className="mt-3 text-center font-sans text-xs leading-relaxed text-white/46">Contact support to change your email address.</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-center xl:justify-start">
                        <button
                          onClick={handleSaveProfile}
                          disabled={saving}
                          className={`glass-pill-dark px-12 py-4 font-sans text-[11px] font-bold tracking-[0.28em] uppercase text-white transition-colors hover:bg-white/[0.08] ${
                            saving ? 'cursor-not-allowed opacity-50' : ''
                          } ${saveSuccess ? 'text-green-400' : ''}`}
                        >
                          {saving ? 'Saving...' : saveSuccess ? 'Saved ✓' : 'Save Changes'}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="glass-panel-dark rounded-[34px] p-8 md:p-10">
                        <h3 className="mb-8 text-center font-serif text-3xl text-white">Notifications</h3>
                        <div className="space-y-5">
                          {[
                            ['New Collection Drops', 'new_collections'],
                            ['Editorial Picks', 'editorial_picks'],
                            ['Breaking Fashion News', 'breaking_news'],
                          ].map(([label, key]) => (
                            <label key={key} className="flex items-center justify-between gap-4 rounded-[22px] border border-white/[0.08] bg-white/[0.03] px-5 py-4">
                              <span className="min-w-0 font-sans text-sm leading-relaxed text-white/78 [overflow-wrap:anywhere]">{label}</span>
                              <div className="relative shrink-0">
                                <input
                                  type="checkbox"
                                  checked={notifications[key as keyof typeof notifications]}
                                  onChange={() => handleToggle(key)}
                                  className="peer sr-only"
                                />
                                <div className="h-7 w-14 rounded-full bg-white/10 transition-colors peer-checked:bg-white/60" />
                                <div className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-7" />
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="glass-panel-dark rounded-[34px] p-8 md:p-10">
                        <h3 className="mb-6 text-center font-serif text-3xl text-white">Account</h3>
                        <div className="flex flex-col items-center gap-4 text-center">
                          <button
                            onClick={handleChangePassword}
                            className="glass-pill-dark px-8 py-3 font-sans text-[11px] tracking-[0.24em] uppercase text-white hover:bg-white/[0.08]"
                          >
                            Change Password
                          </button>
                          <button
                            onClick={handleDeleteAccount}
                            className="font-sans text-[11px] tracking-[0.24em] uppercase text-red-400 transition-colors hover:text-red-300"
                          >
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="snap-start h-screen w-full">
          <Footer />
        </div>
      </main>
    </div>
  )
}
