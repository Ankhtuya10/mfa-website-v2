# Personalized Home Page - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the home page into a personalized experience for logged-in users with feed filters (For You / Following / Saved).

**Architecture:** Create FeedFilter component for tab navigation, add query functions for personalized feeds, update page.tsx to conditionally render personalized vs generic content.

**Tech Stack:** Next.js, Supabase, React hooks

---

## File Structure

- `app/components/FeedFilter.tsx` - New: Filter tabs component
- `app/components/PersonalizedFeed.tsx` - New: Feed content component
- `lib/supabase/queries.ts` - Modify: Add feed queries
- `app/page.tsx` - Modify: Add personalized feed logic

---

## Tasks

### Task 1: Add Feed Query Functions

**Files:**
- Modify: `lib/supabase/queries.ts:1-140`

- [ ] **Step 1: Read existing queries.ts file**

```typescript
// Read lines 1-123 to understand existing patterns
```

- [ ] **Step 2: Add feed query functions**

Append these functions to `lib/supabase/queries.ts`:

```typescript
// ── FEED QUERIES ──

export async function getFollowingFeed(userId: string) {
  // Get designers user follows
  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('content_id')
    .eq('user_id', userId)
    .eq('content_type', 'designer')
  
  const followedDesignerIds = bookmarks?.map(b => b.content_id) || []
  
  if (followedDesignerIds.length === 0) {
    return { articles: [], collections: [] }
  }

  // Get articles from followed designers
  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .in('designer_slug', followedDesignerIds.length > 0 ? followedDesignerIds : [''])
    .order('published_at', { ascending: false })
    .limit(20)

  // Get collections from followed designers
  const { data: collections } = await supabase
    .from('collections')
    .select('*, looks(count)')
    .in('designer_slug', followedDesignerIds.length > 0 ? followedDesignerIds : [''])
    .order('created_at', { ascending: false })
    .limit(20)

  return { articles: articles || [], collections: collections || [] }
}

export async function getForYouFeed(userId: string) {
  // Get user's saved items to understand preferences
  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', userId)

  // Get tags and designer slugs from saved items
  const savedArticleIds = bookmarks?.filter(b => b.content_type === 'article').map(b => b.content_id) || []
  const savedDesignerIds = bookmarks?.filter(b => b.content_type === 'designer').map(b => b.content_id) || []

  // Get details of saved articles to extract tags/categories
  let preferredTags: string[] = []
  let preferredCategories: string[] = []
  
  if (savedArticleIds.length > 0) {
    const { data: savedArticles } = await supabase
      .from('articles')
      .select('tags, category')
      .in('id', savedArticleIds)
    
    savedArticles?.forEach(article => {
      preferredTags.push(...(article.tags || []))
      preferredCategories.push(article.category)
    })
  }

  // Get designers followed to get their tier
  let preferredTiers: string[] = []
  if (savedDesignerIds.length > 0) {
    const { data: followedDesigners } = await supabase
      .from('designers')
      .select('tier')
      .in('id', savedDesignerIds)
    
    preferredTiers = followedDesigners?.map(d => d.tier).filter(Boolean) || []
  }

  // Get articles matching preferences
  let articlesQuery = supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .not('id', 'in', `(${savedArticleIds.map(id => `"${id}"`).join(',')})`)

  // Get collections
  let collectionsQuery = supabase
    .from('collections')
    .select('*, looks(count)')
    .not('designer_slug', 'in', `(${savedDesignerIds.map(id => `"${id}"`).join(',')})`)

  // If no preferences, return latest content
  if (preferredTags.length === 0 && preferredTiers.length === 0) {
    const { data: articles } = await articlesQuery.order('published_at', { ascending: false }).limit(20)
    const { data: collections } = await collectionsQuery.order('created_at', { ascending: false }).limit(20)
    return { articles: articles || [], collections: collections || [] }
  }

  // Score-based ranking for articles
  const { data: allArticles } = await articlesQuery.order('published_at', { ascending: false }).limit(50)
  
  const scoredArticles = (allArticles || []).map(article => {
    let score = 0
    const articleTags = article.tags || []
    const articleCategory = article.category
    
    // Tag matches
    score += articleTags.filter(tag => preferredTags.includes(tag)).length * 2
    
    // Category matches
    if (preferredCategories.includes(articleCategory)) score += 1
    
    return { article, score }
  })
  .sort((a, b) => b.score - a.score)
  .slice(0, 20)
  .map(item => item.article)

  // Score-based ranking for collections
  const { data: allCollections } = await collectionsQuery.order('created_at', { ascending: false }).limit(50)
  
  const scoredCollections = (allCollections || []).map(collection => {
    let score = 0
    return { collection, score }
  }).slice(0, 20)

  return { articles: scoredArticles, collections: scoredCollections.map(c => c.collection) }
}

export async function getSavedFeed(userId: string) {
  // Get all bookmarks
  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (!bookmarks || bookmarks.length === 0) {
    return { articles: [], looks: [] }
  }

  const articleIds = bookmarks.filter(b => b.content_type === 'article').map(b => b.content_id)
  const lookIds = bookmarks.filter(b => b.content_type === 'look').map(b => b.content_id)

  const [articlesRes, looksRes] = await Promise.all([
    articleIds.length > 0 
      ? supabase.from('articles').select('*').in('id', articleIds)
      : Promise.resolve({ data: [] }),
    lookIds.length > 0 
      ? supabase.from('looks').select('*, collections(title, designer_name)').in('id', lookIds)
      : Promise.resolve({ data: [] })
  ])

  return { 
    articles: articlesRes.data || [], 
    looks: looksRes.data || [] 
  }
}

export async function checkUserLoggedIn() {
  const { data: { user } } = await supabase.auth.getUser()
  return !!user
}
```

- [ ] **Step 3: Test the queries compile**

Run: `npx tsc --noEmit lib/supabase/queries.ts`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add lib/supabase/queries.ts
git commit -m "feat: add feed query functions for personalized home"
```

---

### Task 2: Create FeedFilter Component

**Files:**
- Create: `app/components/FeedFilter.tsx`

- [ ] **Step 1: Create FeedFilter component**

Create file `app/components/FeedFilter.tsx`:

```typescript
'use client'

import { motion } from 'framer-motion'

interface FeedFilterProps {
  activeFilter: string
  onFilterChange: (filter: string) => void
}

const filters = [
  { id: 'for-you', label: 'For You' },
  { id: 'following', label: 'Following' },
  { id: 'saved', label: 'Saved' },
]

export function FeedFilter({ activeFilter, onFilterChange }: FeedFilterProps) {
  return (
    <div className="flex gap-8 border-b border-[rgba(0,0,0,0.08)]">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`relative pb-4 font-sans text-[11px] tracking-[2px] uppercase transition-colors ${
            activeFilter === filter.id
              ? 'text-[#2A2522]'
              : 'text-[#B7AEA9] hover:text-[#2A2522]'
          }`}
        >
          {filter.label}
          {activeFilter === filter.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2A2522]"
            />
          )}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/FeedFilter.tsx
git commit -m "feat: add FeedFilter component"
```

---

### Task 3: Create PersonalizedFeed Component

**Files:**
- Create: `app/components/PersonalizedFeed.tsx`

- [ ] **Step 1: Create PersonalizedFeed component**

Create file `app/components/PersonalizedFeed.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { FeedFilter } from './FeedFilter'
import { ArticleCard } from './shared/ArticleCard'
import { CollectionCard } from './shared/CollectionCard'

type FeedType = 'for-you' | 'following' | 'saved'

export function PersonalizedFeed() {
  const [user, setUser] = useState<any>(null)
  const [activeFilter, setActiveFilter] = useState<FeedType>('for-you')
  const [feedData, setFeedData] = useState<any>({ articles: [], collections: [], looks: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        loadFeed(activeFilter, user.id)
      } else {
        setLoading(false)
      }
    }
    checkUser()
  }, [])

  async function loadFeed(filter: FeedType, userId: string) {
    setLoading(true)
    const supabase = createClient()
    
    let data: any = { articles: [], collections: [], looks: [] }
    
    if (filter === 'for-you') {
      const { data: forYouData } = await supabase.rpc('get_for_you_feed', { p_user_id: userId }).catch(() => ({ data: null }))
      // Fallback if RPC not available
      if (!forYouData) {
        const { data: articles } = await supabase.from('articles').select('*').eq('status', 'published').order('published_at', { ascending: false }).limit(20)
        const { data: collections } = await supabase.from('collections').select('*, looks(count)').order('created_at', { ascending: false }).limit(20)
        data = { articles: articles || [], collections: collections || [] }
      } else {
        data = forYouData || { articles: [], collections: [] }
      }
    } else if (filter === 'following') {
      const { data: bookmarks } = await supabase
        .from('bookmarks')
        .select('content_id')
        .eq('user_id', userId)
        .eq('content_type', 'designer')
      
      const followedIds = bookmarks?.map(b => b.content_id) || []
      
      if (followedIds.length > 0) {
        const [articlesRes, collectionsRes] = await Promise.all([
          supabase.from('articles').select('*').eq('status', 'published').in('designer_slug', followedIds).order('published_at', { ascending: false }).limit(20),
          supabase.from('collections').select('*, looks(count)').in('designer_slug', followedIds).order('created_at', { ascending: false }).limit(20)
        ])
        data = { articles: articlesRes.data || [], collections: collectionsRes.data || [] }
      }
    } else if (filter === 'saved') {
      const { data: bookmarks } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      const articleIds = bookmarks?.filter(b => b.content_type === 'article').map(b => b.content_id) || []
      const lookIds = bookmarks?.filter(b => b.content_type === 'look').map(b => b.content_id) || []
      
      const [articlesRes, looksRes] = await Promise.all([
        articleIds.length > 0 ? supabase.from('articles').select('*').in('id', articleIds) : Promise.resolve({ data: [] }),
        lookIds.length > 0 ? supabase.from('looks').select('*, collections(title, designer_name)').in('id', lookIds) : Promise.resolve({ data: [] })
      ])
      data = { articles: articlesRes.data || [], looks: looksRes.data || [] }
    }
    
    setFeedData(data)
    setLoading(false)
  }

  function handleFilterChange(filter: string) {
    setActiveFilter(filter as FeedType)
    if (user) {
      loadFeed(filter as FeedType, user.id)
    }
  }

  if (!user) return null

  return (
    <div className="py-12">
      <FeedFilter activeFilter={activeFilter} onFilterChange={handleFilterChange} />
      
      <div className="mt-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-[#EAEAEA] animate-pulse aspect-[3/4]" />
            ))}
          </div>
        ) : feedData.articles?.length === 0 && feedData.collections?.length === 0 && feedData.looks?.length === 0 ? (
          <EmptyState filter={activeFilter} />
        ) : (
          <div className="space-y-12">
            {/* Articles */}
            {feedData.articles && feedData.articles.length > 0 && (
              <div>
                <h3 className="font-sans text-[10px] tracking-[2px] uppercase text-[#9B9590] mb-6">Articles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {feedData.articles.map((article: any) => (
                    <ArticleCard key={article.id} article={article} variant="grid" />
                  ))}
                </div>
              </div>
            )}
            
            {/* Collections */}
            {feedData.collections && feedData.collections.length > 0 && (
              <div>
                <h3 className="font-sans text-[10px] tracking-[2px] uppercase text-[#9B9590] mb-6">Collections</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {feedData.collections.map((collection: any) => (
                    <CollectionCard key={collection.id} collection={collection} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Looks (Saved only) */}
            {activeFilter === 'saved' && feedData.looks && feedData.looks.length > 0 && (
              <div>
                <h3 className="font-sans text-[10px] tracking-[2px] uppercase text-[#9B9590] mb-6">Looks</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {feedData.looks.map((look: any) => (
                    <div key={look.id} className="relative aspect-[2/3] overflow-hidden">
                      <Image src={look.image} alt="" fill className="object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                        <p className="font-sans text-[10px] tracking-[2px] uppercase text-white/70">
                          {look.collections?.designer_name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState({ filter }: { filter: string }) {
  const messages: Record<string, { title: string; desc: string; cta: string; href: string }> = {
    'for-you': {
      title: 'No recommendations yet',
      desc: 'Save articles and follow designers to get personalized recommendations',
      cta: 'Explore Editorial',
      href: '/editorial'
    },
    'following': {
      title: 'Not following anyone',
      desc: 'Follow designers to see their latest content here',
      cta: 'Discover Designers',
      href: '/designers'
    },
    'saved': {
      title: 'No saved items',
      desc: 'Bookmark articles and looks to find them here',
      cta: 'Browse Archive',
      href: '/archive'
    }
  }
  
  const msg = messages[filter] || messages['for-you']
  
  return (
    <div className="text-center py-20">
      <h3 className="font-serif text-2xl text-[#2A2522] mb-2">{msg.title}</h3>
      <p className="font-sans text-[#9B9590] mb-6">{msg.desc}</p>
      <Link href={msg.href} className="inline-block bg-[#0A0A0A] text-white px-8 py-3 font-sans text-[11px] tracking-[2px] uppercase hover:bg-[#2A2522] transition-colors">
        {msg.cta}
      </Link>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/PersonalizedFeed.tsx
git commit -m "feat: add PersonalizedFeed component with tabs"
```

---

### Task 4: Update Home Page

**Files:**
- Modify: `app/page.tsx:1-20`

- [ ] **Step 1: Read existing page.tsx**

```typescript
// Current content:
'use client';

import { StickyNavbar, HeroSection, DiscoverSection, CollectionsGrid, Footer } from './components';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen justify-between bg-[#F5F2ED]">
      <StickyNavbar />
      <main className="flex-grow">
        <HeroSection />
        <DiscoverSection />
        <CollectionsGrid />
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Update to include personalized feed for logged-in users**

Replace content of `app/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react'
import { StickyNavbar, HeroSection, DiscoverSection, CollectionsGrid, Footer, PersonalizedFeed } from './components'
import { createClient } from '@/lib/supabase/client'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    checkUser()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen justify-between bg-[#F5F2ED]">
        <StickyNavbar />
        <main className="flex-grow">
          <HeroSection />
          <div className="max-w-6xl mx-auto px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-[#EAEAEA] animate-pulse aspect-[3/4]" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen justify-between bg-[#F5F2ED]">
      <StickyNavbar />
      <main className="flex-grow">
        <HeroSection />
        
        {user ? (
          <section className="max-w-6xl mx-auto px-8">
            <PersonalizedFeed />
          </section>
        ) : (
          <>
            <DiscoverSection />
            <CollectionsGrid />
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add personalized home page for logged-in users"
```

---

### Task 5: Update Components Index

**Files:**
- Modify: `app/components/index.ts`

- [ ] **Step 1: Add new components to index**

Update `app/components/index.ts`:

```typescript
export { StickyNavbar } from './StickyNavbar'
export { HeroSection } from './HeroSection'
export { DiscoverSection } from './DiscoverSection'
export { CollectionsGrid } from './CollectionsGrid'
export { Footer } from './Footer'
export { FeedFilter } from './FeedFilter'
export { PersonalizedFeed } from './PersonalizedFeed'
```

- [ ] **Step 2: Commit**

```bash
git add app/components/index.ts
git commit -m "feat: export new feed components"
```

---

## Verification

Run these commands to verify the implementation:

```bash
# Build check
npm run build

# Start dev server
npm run dev
```

Expected:
- Home page shows generic content for non-logged-in users
- Logged-in users see personalized feed with filter tabs
- Filter tabs switch between For You / Following / Saved content
- Empty states show appropriate messages and CTAs

---

## Plan complete

**Plan saved to:** `docs/superpowers/plans/2026-04-01-personalized-home-plan.md`

**Two execution options:**

1. **Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?