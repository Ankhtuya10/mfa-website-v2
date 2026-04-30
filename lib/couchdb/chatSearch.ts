/**
 * Live CouchDB search for the AI chatbot.
 * Scores articles, collections, and designers against the user's query
 * and returns them as formatted context strings — no Supabase needed.
 */

import { createContentRepository } from './repository'

// Common Mongolian stop-words that add no search value
const STOPWORDS = new Set([
  'ямар', 'байна', 'гэж', 'гэсэн', 'ба', 'юу', 'нь', 'ийн', 'ын', 'аас',
  'оос', 'уур', 'үүр', 'руу', 'луу', 'дах', 'дэх', 'тай', 'той', 'тэй',
  'дор', 'доор', 'хийх', 'хийсэн', 'байх', 'байсан', 'болох', 'болсон',
  'the', 'and', 'for', 'are', 'was', 'with', 'that', 'this', 'from',
])

export type ChatSearchResult = {
  type: 'article' | 'collection' | 'designer'
  score: number
  context: string
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFC')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t))
}

function scoreText(haystack: string, terms: string[]): number {
  const h = haystack.toLowerCase()
  let score = 0
  for (const term of terms) {
    if (h.includes(term)) {
      score += 1
      // Whole-word hit scores more
      if (new RegExp(`(^|\\s)${term}(\\s|$)`, 'i').test(h)) score += 2
    }
  }
  return score
}

// ─── formatters ──────────────────────────────────────────────────────────────

function formatArticle(a: any): string {
  const lines = [
    `[Нийтлэл] ${a.title}`,
    `Ангилал: ${a.category} | Зохиолч: ${a.author_name || a.author}`,
  ]
  if (a.subtitle) lines.push(`Дэд гарчиг: ${a.subtitle}`)
  if (a.published_at) {
    lines.push(
      `Огноо: ${new Date(a.published_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })}`,
    )
  }
  if (a.tags?.length) lines.push(`Тагууд: ${(a.tags as string[]).join(', ')}`)
  if (a.designer_slug) lines.push(`Холбоотой дизайнер: ${a.designer_slug}`)
  lines.push(`Линк: /editorial/${a.slug}`)
  if (a.body) {
    const excerpt = String(a.body).slice(0, 600)
    lines.push('', `Агуулга:\n${excerpt}${a.body.length > 600 ? '…' : ''}`)
  }
  return lines.join('\n')
}

function formatCollection(c: any): string {
  const looks: any[] = Array.isArray(c.looks) ? c.looks : []
  const lines = [
    `[Цуглуулга] ${c.title}`,
    `Дизайнер: ${c.designer_name} | Улирал: ${c.season} ${c.year}`,
  ]
  if (c.description) lines.push(`Тайлбар: ${c.description}`)
  lines.push(`Look тоо: ${looks.length}`)
  lines.push(`Линк: /archive/${c.slug}`)
  if (looks.length > 0) {
    lines.push('Looks:')
    for (const look of looks.slice(0, 5)) {
      const mats = Array.isArray(look.materials) ? look.materials.join(', ') : ''
      const desc = look.description ? look.description.slice(0, 120) : ''
      lines.push(
        `  Look ${look.number}${desc ? ': ' + desc : ''}${mats ? ' (' + mats + ')' : ''}`,
      )
    }
  }
  return lines.join('\n')
}

function formatDesigner(d: any): string {
  const lines = [
    `[Дизайнер] ${d.name}`,
    `Түвшин: ${d.tier} | Байгуулагдсан: ${d.founded || '?'} | Харьяалал: ${d.nationality || 'Монгол'}`,
  ]
  if (d.short_bio) lines.push(`Товч: ${d.short_bio}`)
  if (d.bio) lines.push(`Дэлгэрэнгүй: ${String(d.bio).slice(0, 400)}${d.bio.length > 400 ? '…' : ''}`)
  lines.push(`Линк: /designers/${d.slug}`)
  return lines.join('\n')
}

// ─── main search ─────────────────────────────────────────────────────────────

export async function searchLiveArchive(
  query: string,
  limit = 8,
): Promise<ChatSearchResult[]> {
  const terms = tokenize(query)
  if (terms.length === 0) return []

  const repo = createContentRepository()

  const [articles, collections, designers] = await Promise.all([
    repo.getArticles({ status: 'published' }).catch(() => []),
    repo.getCollections().catch(() => []),
    repo.getDesigners().catch(() => []),
  ])

  const results: ChatSearchResult[] = []

  for (const a of articles) {
    const hay = [a.title, a.subtitle, a.body, a.category, a.author_name, ...(a.tags || [])].join(' ')
    const score = scoreText(hay, terms)
    if (score > 0) {
      results.push({ type: 'article', score: score + 1, context: formatArticle(a) })
    }
  }

  for (const c of collections) {
    const looksText = (Array.isArray(c.looks) ? c.looks : [])
      .map((l: any) => `${l.description || ''} ${(l.materials || []).join(' ')} ${(l.tags || []).join(' ')}`)
      .join(' ')
    const hay = [c.title, c.description, c.designer_name, c.season, String(c.year), looksText].join(' ')
    const score = scoreText(hay, terms)
    if (score > 0) {
      results.push({ type: 'collection', score, context: formatCollection(c) })
    }
  }

  for (const d of designers) {
    const hay = [d.name, d.bio, d.short_bio, d.tier, d.nationality].join(' ')
    const score = scoreText(hay, terms)
    if (score > 0) {
      results.push({ type: 'designer', score, context: formatDesigner(d) })
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit)
}

export function formatLiveArchiveContext(results: ChatSearchResult[]): string {
  if (results.length === 0) return ''
  return results
    .map((r, i) => `# Архивын бичлэг ${i + 1} (${r.type})\n${r.context}`)
    .join('\n\n---\n\n')
}
