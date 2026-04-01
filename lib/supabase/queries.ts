import { createClient } from './client'

const supabase = createClient()

// ── DESIGNERS ──
export async function getDesigners(tier?: string) {
  let query = supabase.from('designers').select('*').order('name')
  if (tier && tier !== 'all') query = query.eq('tier', tier)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getDesignerBySlug(slug: string) {
  const { data, error } = await supabase
    .from('designers')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) throw error
  return data
}

// ── COLLECTIONS ──
export async function getCollections(filters?: { season?: string; designerSlug?: string }) {
  let query = supabase
    .from('collections')
    .select('*, looks(count)')
    .order('year', { ascending: false })
  if (filters?.season) query = query.eq('season', filters.season.slice(0, 2).toUpperCase())
  if (filters?.designerSlug) query = query.eq('designer_slug', filters.designerSlug)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getCollectionBySlug(slug: string) {
  const { data, error } = await supabase
    .from('collections')
    .select('*, looks(*)')
    .eq('slug', slug)
    .single()
  if (error) throw error
  return data
}

// ── ARTICLES ──
export async function getArticles(filters?: { category?: string; status?: string }) {
  let query = supabase
    .from('articles')
    .select('*')
    .order('published_at', { ascending: false })
  if (filters?.category && filters.category !== 'all')
    query = query.eq('category', filters.category)
  if (filters?.status) query = query.eq('status', filters.status)
  else query = query.eq('status', 'published')
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getArticleBySlug(slug: string) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) throw error
  return data
}

// ── ADMIN: all articles including drafts ──
export async function getAllArticlesAdmin() {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// ── SEARCH ──
export async function searchAll(query: string) {
  const q = `%${query}%`
  const [articlesRes, collectionsRes, designersRes] = await Promise.all([
    supabase.from('articles').select('*').or(`title.ilike.${q},body.ilike.${q}`).eq('status', 'published').limit(6),
    supabase.from('collections').select('*').or(`title.ilike.${q},description.ilike.${q},designer_name.ilike.${q}`).limit(6),
    supabase.from('designers').select('*').or(`name.ilike.${q},bio.ilike.${q}`).limit(6),
  ])
  return {
    articles: articlesRes.data || [],
    collections: collectionsRes.data || [],
    designers: designersRes.data || [],
  }
}

// ── BOOKMARKS ──
export async function toggleBookmark(userId: string, contentId: string, contentType: string) {
  const { data: existing } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', userId)
    .eq('content_id', contentId)
    .eq('content_type', contentType)
    .single()

  if (existing) {
    await supabase.from('bookmarks').delete().eq('id', existing.id)
    return false
  } else {
    await supabase.from('bookmarks').insert({ user_id: userId, content_id: contentId, content_type: contentType })
    return true
  }
}

export async function getUserBookmarks(userId: string) {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', userId)
  if (error) throw error
  return data
}
