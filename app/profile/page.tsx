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

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen justify-between bg-[#F5F2ED]">
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
          <div className="sticky top-20 z-40 bg-white border-b border-[rgba(0,0,0,0.08)]">
            <div className="max-w-6xl mx-auto px-8">
              <div className="flex gap-10">
                {tabs.map((tab) => (
                  <div key={tab} className="w-20 h-4 bg-[#B7AEA9]/20 animate-pulse" />
                ))}
              </div>
            </div>
          </div>
          <div className="max-w-6xl mx-auto px-8 w-full py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#EAEAEA] animate-pulse aspect-[3/4]" />
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
      <div className="flex flex-col min-h-screen justify-between bg-[#F5F2ED]">
        <StickyNavbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <h1 className="font-serif text-4xl text-[#2A2522] mb-4">Not logged in</h1>
          <a href="/login" className="font-sans text-[11px] tracking-[2px] uppercase text-[#B7AEA9] hover:text-[#2A2522]">
            Go to Login →
          </a>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen justify-between bg-[#F5F2ED]">
      <StickyNavbar />

      <main className="flex-grow">
        <section className="bg-[#0A0A0A] py-20">
          <div className="max-w-6xl mx-auto px-8 w-full">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 bg-[#B7AEA9] overflow-hidden flex items-center justify-center">
                  {profile?.avatar_url ? (
                    <Image src={profile.avatar_url} alt={userName} fill className="object-cover" />
                  ) : (
                    <span className="font-serif text-4xl text-white">
                      {userName[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="font-serif text-4xl text-white">{userName}</h1>
                  <p className="font-sans text-[#B7AEA9] mt-1">{user.email}</p>
                  <p className="font-sans text-[10px] tracking-[2px] uppercase text-[#9B9590] mt-2">
                    {roleDisplay}
                  </p>
                  {joinedDate && (
                    <p className="font-sans text-[10px] tracking-[2px] uppercase text-[#9B9590] mt-1">
                      Joined {joinedDate}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-16">
                <div className="text-center">
                  <span className="font-serif text-5xl text-white block">{savedArticles.length}</span>
                  <span className="font-sans text-[10px] tracking-[2px] uppercase text-[#9B9590]">Saved</span>
                </div>
                <div className="text-center">
                  <span className="font-serif text-5xl text-white block">{savedLooks.length}</span>
                  <span className="font-sans text-[10px] tracking-[2px] uppercase text-[#9B9590]">Looks</span>
                </div>
                <div className="text-center">
                  <span className="font-serif text-5xl text-white block">{followedDesigners.length}</span>
                  <span className="font-sans text-[10px] tracking-[2px] uppercase text-[#9B9590]">Following</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="sticky top-20 z-40 bg-white border-b border-[rgba(0,0,0,0.08)]">
          <div className="max-w-6xl mx-auto px-8">
            <div className="flex gap-10">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`font-sans text-[11px] tracking-[2px] uppercase pb-4 transition-colors ${
                    activeTab === tab
                      ? 'border-b-2 border-[#2A2522] text-[#2A2522]'
                      : 'text-[#B7AEA9] hover:text-[#2A2522]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-8 w-full py-16">
          {activeTab === 'Saved Articles' && (
            <div>
              {savedArticles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {savedArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} variant="grid" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-24">
                  <div className="w-20 h-20 mx-auto mb-6 bg-[#E5E0DB] rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-[#9B9590]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-2xl text-[#2A2522] mb-2">No saved articles yet</h3>
                  <p className="font-sans text-[#9B9590] mb-6">Bookmark articles as you read to find them here</p>
                  <a href="/editorial" className="inline-block bg-[#0A0A0A] text-white px-8 py-3 font-sans text-[11px] tracking-[2px] uppercase hover:bg-[#2A2522] transition-colors">
                    Browse Editorial
                  </a>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Saved Looks' && (
            <div>
              {savedLooks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {savedLooks.map((look) => (
                    <div key={look.id} className="relative aspect-[2/3] overflow-hidden group">
                      <Image 
                        src={look.image} 
                        alt={look.title || 'Look'} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                        <p className="font-sans text-[10px] tracking-[2px] uppercase text-white/70">
                          {look.collections?.designer_name}
                        </p>
                        <p className="font-sans text-[11px] text-white">{look.collections?.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24">
                  <div className="w-20 h-20 mx-auto mb-6 bg-[#E5E0DB] rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-[#9B9590]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-2xl text-[#2A2522] mb-2">No saved looks yet</h3>
                  <p className="font-sans text-[#9B9590] mb-6">Explore collections and save looks you love</p>
                  <a href="/archive" className="inline-block bg-[#0A0A0A] text-white px-8 py-3 font-sans text-[11px] tracking-[2px] uppercase hover:bg-[#2A2522] transition-colors">
                    Explore Archive
                  </a>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Following' && (
            <div>
              {followedDesigners.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {followedDesigners.map((designer) => (
                    <DesignerCard key={designer.id} designer={designer} variant="grid" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-24">
                  <div className="w-20 h-20 mx-auto mb-6 bg-[#E5E0DB] rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-[#9B9590]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-2xl text-[#2A2522] mb-2">Not following anyone yet</h3>
                  <p className="font-sans text-[#9B9590] mb-6">Follow designers from their profile pages</p>
                  <a href="/designers" className="inline-block bg-[#0A0A0A] text-white px-8 py-3 font-sans text-[11px] tracking-[2px] uppercase hover:bg-[#2A2522] transition-colors">
                    Discover Designers
                  </a>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Settings' && (
            <div className="max-w-xl">
              <div className="bg-white p-10 mb-8">
                <h3 className="font-serif text-2xl text-[#2A2522] mb-8">Profile Settings</h3>
                <div className="space-y-6">
                  <div>
                    <label className="font-sans text-[10px] tracking-[2px] uppercase text-[#9B9590] block mb-2">Full Name</label>
                    <input
                      type="text"
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                      className="w-full border-b border-[rgba(0,0,0,0.15)] bg-transparent py-3 font-inter text-[15px] text-[#2A2522] outline-none focus:border-[#2A2522] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="font-sans text-[10px] tracking-[2px] uppercase text-[#9B9590] block mb-2">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full border-b border-[rgba(0,0,0,0.08)] bg-[#F5F2ED] py-3 font-inter text-[15px] text-[#9B9590] outline-none cursor-not-allowed"
                    />
                    <p className="font-sans text-[10px] text-[#9B9590] mt-1">Contact support to change your email</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-10 mb-8">
                <h3 className="font-serif text-2xl text-[#2A2522] mb-8">Notifications</h3>
                <div className="space-y-5">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="font-inter text-[15px] text-[#3A3530] group-hover:text-[#2A2522] transition-colors">New Collection Drops</span>
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={notifications.new_collections} 
                        onChange={() => handleToggle('new_collections')}
                        className="sr-only peer" 
                      />
                      <div className="w-12 h-6 bg-[#E5E0DB] rounded-full peer peer-checked:bg-[#0A0A0A] transition-colors"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-6 transition-transform"></div>
                    </div>
                  </label>
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="font-inter text-[15px] text-[#3A3530] group-hover:text-[#2A2522] transition-colors">Editorial Picks</span>
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={notifications.editorial_picks} 
                        onChange={() => handleToggle('editorial_picks')}
                        className="sr-only peer" 
                      />
                      <div className="w-12 h-6 bg-[#E5E0DB] rounded-full peer peer-checked:bg-[#0A0A0A] transition-colors"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-6 transition-transform"></div>
                    </div>
                  </label>
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="font-inter text-[15px] text-[#3A3530] group-hover:text-[#2A2522] transition-colors">Breaking Fashion News</span>
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={notifications.breaking_news} 
                        onChange={() => handleToggle('breaking_news')}
                        className="sr-only peer" 
                      />
                      <div className="w-12 h-6 bg-[#E5E0DB] rounded-full peer peer-checked:bg-[#0A0A0A] transition-colors"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-6 transition-transform"></div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="bg-white p-10">
                <h3 className="font-serif text-2xl text-[#2A2522] mb-8">Account</h3>
                <div className="space-y-4">
                  <button 
                    onClick={handleChangePassword}
                    className="font-sans text-[11px] tracking-[2px] uppercase text-[#2A2522] hover:text-[#393931] transition-colors block"
                  >
                    Change Password
                  </button>
                  <button 
                    onClick={handleDeleteAccount}
                    className="font-sans text-[11px] tracking-[2px] uppercase text-red-500 block"
                  >
                    Delete Account
                  </button>
                </div>
              </div>

              <div className="mt-10 flex justify-end">
                <button 
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className={`bg-[#0A0A0A] text-white px-12 py-4 font-sans font-bold text-[11px] tracking-[4px] uppercase hover:bg-[#2A2522] transition-colors ${
                    saving ? 'opacity-50 cursor-not-allowed' : ''
                  } ${saveSuccess ? 'text-green-500' : ''}`}
                >
                  {saving ? 'SAVING...' : saveSuccess ? 'SAVED ✓' : 'SAVE CHANGES'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
