import type { SearchGroups, SearchResultItem, SeasonFilter } from './types'
import { createClient } from '@/lib/supabase/client'

export const TRENDING_TAGS = ['cashmere', 'fw2025', 'gobi', 'ulaanbaatar', 'wool', 'emerald', 'winter']
export const RECENT_HISTORY_KEY = 'anoce_explore_recent_searches'

const SYNONYM_MAP: Record<string, string[]> = {
  winter: ['fw', 'fall winter', 'autumn winter', 'fall/winter'],
  summer: ['ss', 'spring summer', 'spring/summer'],
  cashmer: ['cashmere'],
  woolen: ['wool'],
  emerald: ['green'],
  green: ['emerald', 'sage', 'forest'],
  archive: ['past', 'previous', 'older'],
  current: ['latest', 'new', 'season'],
}

export const normalizeText = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()

export const levenshtein = (a: string, b: string) => {
  const matrix = Array.from({ length: b.length + 1 }, (_, row) =>
    Array.from({ length: a.length + 1 }, (_, col) => (row === 0 ? col : col === 0 ? row : 0))
  )

  for (let row = 1; row <= b.length; row += 1) {
    for (let col = 1; col <= a.length; col += 1) {
      const cost = a[col - 1] === b[row - 1] ? 0 : 1
      matrix[row][col] = Math.min(matrix[row - 1][col] + 1, matrix[row][col - 1] + 1, matrix[row - 1][col - 1] + cost)
    }
  }

  return matrix[b.length][a.length]
}

export const tokenize = (value: string) => normalizeText(value).split(' ').filter(Boolean)

export const expandQueryTerms = (query: string) => {
  const tokens = tokenize(query)
  const expanded = new Set(tokens)

  tokens.forEach((token) => {
    expanded.add(token)
    Object.entries(SYNONYM_MAP).forEach(([key, synonyms]) => {
      if (token === key || synonyms.includes(token)) {
        expanded.add(key)
        synonyms.forEach((synonym) => expanded.add(synonym))
      }
    })
  })

  return Array.from(expanded)
}

export const fetchSearchIndex = async (): Promise<SearchResultItem[]> => {
  const supabase = createClient()

  const [{ data: articles }, { data: collections }, { data: designers }] = await Promise.all([
    supabase
      .from('articles')
      .select('id, slug, title, subtitle, cover_image, author_name, read_time, body, tags, status')
      .eq('status', 'published')
      .order('published_at', { ascending: false }),
    supabase
      .from('collections')
      .select('id, slug, title, description, designer_name, season, year, cover_image, looks(materials, tags)'),
    supabase
      .from('designers')
      .select('id, slug, name, tier, bio, short_bio, cover_image, founded'),
  ])

  const articleItems: SearchResultItem[] = (articles || []).map((article: any) => ({
    id: `article-${article.id}`,
    slug: article.slug,
    title: article.title,
    subtitle: article.subtitle || '',
    image: article.cover_image || '',
    href: `/editorial/${article.slug}`,
    category: 'articles',
    meta: `${article.author_name || 'Editorial'} · ${article.read_time || 5} min read`,
    searchText: [article.title, article.subtitle, article.body, article.author_name, ...(article.tags || [])].join(' '),
    tags: article.tags || [],
  }))

  const collectionItems: SearchResultItem[] = (collections || []).map((collection: any) => {
    const looks = Array.isArray(collection.looks) ? collection.looks : []
    const materialTags = looks.flatMap((look: any) => (Array.isArray(look?.materials) ? look.materials : []))
    const lookTags = looks.flatMap((look: any) => (Array.isArray(look?.tags) ? look.tags : []))
    const seasonLabel = `${collection.season || ''}${collection.year || ''}`

    return {
      id: `collection-${collection.id}`,
      slug: collection.slug,
      title: collection.title,
      subtitle: collection.description || '',
      image: collection.cover_image || '',
      href: `/archive/${collection.slug}`,
      category: 'collections',
      meta: `${collection.designer_name || 'Unknown'} · ${collection.season || ''} ${collection.year || ''}`.trim(),
      searchText: [
        collection.title,
        collection.description,
        collection.designer_name,
        collection.season,
        `${collection.season || ''}${collection.year || ''}`,
        `${collection.year || ''}`,
        ...materialTags,
        ...lookTags,
      ].join(' '),
      tags: [...lookTags, ...materialTags],
      seasonLabel,
    }
  })

  const designerItems: SearchResultItem[] = (designers || []).map((designer: any) => ({
    id: `designer-${designer.id}`,
    slug: designer.slug,
    title: designer.name,
    subtitle: designer.short_bio || '',
    image: designer.cover_image || '',
    href: `/designers/${designer.slug}`,
    category: 'designers',
    meta: `${designer.name} · ${designer.tier || ''}`.trim(),
    searchText: [designer.name, designer.bio, designer.short_bio, `${designer.founded || ''}`].join(' '),
    tags: [designer.tier || ''],
  }))

  const brandItems: SearchResultItem[] = (designers || []).map((designer: any) => ({
    id: `brand-${designer.id}`,
    slug: designer.slug,
    title: designer.name,
    subtitle: designer.short_bio || '',
    image: designer.cover_image || '',
    href: `/designers/${designer.slug}`,
    category: 'brands',
    meta: `${designer.name} · Founded ${designer.founded || '—'}`,
    searchText: [designer.name, designer.bio, designer.short_bio].join(' '),
    tags: [designer.tier || ''],
  }))

  return [...articleItems, ...collectionItems, ...designerItems, ...brandItems].filter(
    (item) => item.slug && item.title && item.image
  )
}

export const scoreResult = (item: SearchResultItem, query: string) => {
  const normalizedQuery = normalizeText(query)
  if (!normalizedQuery) return 0

  const searchBlob = normalizeText(item.searchText)
  const titleBlob = normalizeText(item.title)
  const subtitleBlob = normalizeText(item.subtitle)
  const metaBlob = normalizeText(item.meta)
  const itemTokens = tokenize(`${item.title} ${item.subtitle} ${item.searchText} ${item.tags.join(' ')}`)
  const queryTerms = expandQueryTerms(query)

  let score = 0

  queryTerms.forEach((term) => {
    if (!term) return

    if (titleBlob.includes(term)) score += 20
    if (subtitleBlob.includes(term)) score += 12
    if (metaBlob.includes(term)) score += 10
    if (searchBlob.includes(term)) score += 6
    if (item.tags.some((tag) => normalizeText(tag).includes(term))) score += 8
    if (item.seasonLabel && normalizeText(item.seasonLabel).includes(term)) score += 10

    itemTokens.forEach((token) => {
      const distance = levenshtein(term, token)
      if (distance === 1) score += 5
      if (distance === 2 && term.length > 4) score += 2
    })
  })

  if (titleBlob.startsWith(normalizedQuery)) score += 14
  if (searchBlob.includes(normalizedQuery)) score += 8

  return score
}

export const applySeasonFilter = (items: SearchResultItem[], seasonFilter: SeasonFilter) => {
  if (seasonFilter === 'all') return items

  return items.filter((item) => {
    if (item.category !== 'collections' || !item.seasonLabel) return true

    const normalizedSeason = item.seasonLabel.toLowerCase()
    if (seasonFilter === 'current') {
      return normalizedSeason.includes('ss2025') || normalizedSeason.includes('fw2025')
    }

    return !normalizedSeason.includes('ss2025') && !normalizedSeason.includes('fw2025')
  })
}

export const rankResults = (query: string, source: SearchResultItem[], seasonFilter: SeasonFilter = 'all') => {
  if (query.length < 2) return []

  return applySeasonFilter(source, seasonFilter)
    .map((item) => ({ item, score: scoreResult(item, query) }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .map((entry) => entry.item)
}

export const groupRankedResults = (items: SearchResultItem[]): SearchGroups => ({
  articles: items.filter((item) => item.category === 'articles'),
  collections: items.filter((item) => item.category === 'collections'),
  designers: items.filter((item) => item.category === 'designers'),
  brands: items.filter((item) => item.category === 'brands'),
})
