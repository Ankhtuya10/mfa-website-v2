'use client'

import {
  fetchContentArticle,
  fetchContentArticles,
  fetchContentCollection,
  fetchContentCollections,
  fetchContentDesigner,
  fetchContentDesigners,
} from '@/lib/content/client'
import { createClient } from './client'

// Backwards-compatible content helpers. Content now comes from CouchDB APIs;
// Supabase remains here only for user-specific bookmark data.

export async function getDesigners(tier?: string) {
  return fetchContentDesigners(tier)
}

export async function getDesignerBySlug(slug: string) {
  return fetchContentDesigner(slug)
}

export async function getCollections(filters?: { season?: string; designerSlug?: string }) {
  return fetchContentCollections(filters)
}

export async function getCollectionBySlug(slug: string) {
  return fetchContentCollection(slug)
}

export async function getArticles(filters?: { category?: string; status?: string }) {
  return fetchContentArticles(filters)
}

export async function getArticleBySlug(slug: string) {
  return fetchContentArticle(slug)
}

export async function getAllArticlesAdmin() {
  const response = await fetch('/api/admin/content/articles', { cache: 'no-store' })
  if (!response.ok) throw new Error('Failed to load admin articles')
  return response.json()
}

export async function searchAll(query: string) {
  const normalizedQuery = query.trim().toLowerCase()
  const [articles, collections, designers] = await Promise.all([
    getArticles({ status: 'published' }),
    getCollections(),
    getDesigners(),
  ])

  const includes = (...values: unknown[]) =>
    values
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(normalizedQuery)

  return {
    articles: articles
      .filter((article: any) => includes(article.title, article.subtitle, article.body, ...(article.tags || [])))
      .slice(0, 6),
    collections: collections
      .filter((collection: any) => includes(collection.title, collection.description, collection.designer_name))
      .slice(0, 6),
    designers: designers
      .filter((designer: any) => includes(designer.name, designer.bio, designer.short_bio))
      .slice(0, 6),
  }
}

export async function toggleBookmark(userId: string, contentId: string, contentType: string) {
  const supabase = createClient()
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
  }

  await supabase.from('bookmarks').insert({ user_id: userId, content_id: contentId, content_type: contentType })
  return true
}

export async function getUserBookmarks(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', userId)
  if (error) throw error
  return data
}
