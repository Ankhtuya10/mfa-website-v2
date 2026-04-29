import { createAdminClient } from './admin'

export type AnoceRagDocumentRow = {
  id: string
  type: string
  title: string
  content: string
  brand_slug: string | null
  category: string | null
  tags: string[] | null
  source_confidence: string | null
  url: string | null
  metadata: Record<string, unknown> | null
  created_at?: string | null
}

const TABLE_NAME = 'anoce_rag_documents'
const SELECT_COLUMNS =
  'id,type,title,content,brand_slug,category,tags,source_confidence,url,metadata,created_at'
const TEXT_SEARCH_COLUMNS = ['title', 'content', 'category', 'brand_slug']
const DEFAULT_LIMIT = 8
const BROAD_TREND_TYPES = ['trend', 'trend_report']
const COLLECTION_TYPES = ['archive_collection', 'collection']
const LOOK_TYPES = ['archive_look', 'look']
const KEYWORD_EXPANSIONS: Array<{ triggers: string[]; terms: string[] }> = [
  {
    triggers: ['trend', 'trends', 'чиг хандлага', 'чиглэл', 'трэнд', 'одоогийн', 'одоо'],
    terms: ['trend', 'trends', 'чиг', 'чиглэл', 'чиг хандлага', 'style', 'загвар'],
  },
  {
    triggers: ['fashion', 'загвар', 'хувцас', 'style', 'zagvar', 'huvtsas'],
    terms: ['fashion', 'загвар', 'хувцас', 'style', 'zagvar', 'huvtsas'],
  },
  {
    triggers: ['cashmere', 'ноолуур', 'nooluur', 'nooluuriin'],
    terms: ['cashmere', 'ноолуур', 'nooluur', 'nooluuriin', 'gobi', 'goyo', 'goyol', 'evseg'],
  },
  {
    triggers: ['streetwear', 'street', 'гудамжны стиль', 'urban', 'gudamj', 'gudamjnii'],
    terms: ['streetwear', 'street', 'гудамжны стиль', 'urban', 'gudamj', 'gudamjnii', 'hoodie', 'denim'],
  },
  {
    triggers: ['deel', 'дээл'],
    terms: ['deel', 'дээл', 'silhouette', 'heritage', 'өв соёл'],
  },
  {
    triggers: ['silk', 'торго', 'torgo'],
    terms: ['silk', 'торго', 'torgo'],
  },
  {
    triggers: ['custom', 'made to order', 'made-to-order', 'захиалгат', 'zahialgat'],
    terms: ['custom', 'made to order', 'made-to-order', 'захиалгат', 'zahialgat', 'tailoring'],
  },
  {
    triggers: ['brand', 'brands', 'брэнд', 'брэндүүд', 'brend', 'brenduud', 'branduud'],
    terms: ['brand', 'brands', 'брэнд', 'брэндүүд', 'brend', 'brenduud', 'branduud'],
  },
  {
    triggers: ['collection', 'collections', 'цуглуулга', 'tsugluulga', 'onii', 'oni', 'year'],
    terms: ['collection', 'collections', 'цуглуулга', 'tsugluulga', 'он', 'оны', 'onii', 'oni', 'year'],
  },
  {
    triggers: ['havar', 'havriin', 'havriinh', 'хавар', 'хаврын', 'spring', 'ss'],
    terms: ['SS', 'spring', 'summer', 'хавар', 'хаврын', 'havar', 'havriin', 'havriinh'],
  },
  {
    triggers: ['zun', 'zunii', 'зун', 'зуны', 'summer', 'ss'],
    terms: ['SS', 'spring', 'summer', 'зун', 'зуны', 'zun', 'zunii'],
  },
  {
    triggers: ['uvul', 'uvliin', 'өвөл', 'өвлийн', 'winter', 'fw'],
    terms: ['FW', 'fall', 'winter', 'өвөл', 'өвлийн', 'uvul', 'uvliin'],
  },
  {
    triggers: ['namar', 'namriin', 'намар', 'намрын', 'fall', 'autumn', 'fw'],
    terms: ['FW', 'fall', 'autumn', 'winter', 'намар', 'намрын', 'namar', 'namriin'],
  },
  {
    triggers: ['mongol huvtsas', 'huvtsasnii', 'монгол хувцас', 'үндэсний хувцас'],
    terms: ['mongol huvtsas', 'huvtsasnii', 'монгол хувцас', 'үндэсний хувцас', 'дээл', 'deel', 'heritage'],
  },
]

function normalizeSearchText(value: string) {
  return value
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getSearchTerms(query: string) {
  const normalized = normalizeSearchText(query)
  if (!normalized) return []

  const terms = new Set<string>([normalized])
  normalized
    .split(' ')
    .filter((term) => term.length > 1)
    .forEach((term) => terms.add(term))

  for (const expansion of KEYWORD_EXPANSIONS) {
    if (expansion.triggers.some((trigger) => normalized.includes(trigger))) {
      expansion.terms.forEach((term) => terms.add(term))
    }
  }

  if (isBroadTrendQuestion(query)) {
    ;[
      'ноолуур',
      'luxury',
      'minimal',
      'дээл',
      'streetwear',
      'custom',
      'made to order',
      'heritage',
      'торго',
    ].forEach((term) => terms.add(term))
  }

  return Array.from(terms).slice(0, 24)
}

function isBroadTrendQuestion(query: string) {
  const normalized = normalizeSearchText(query)
  return (
    /trend|trends|трэнд|чиг хандлага|чиглэл/.test(normalized) ||
    (normalized.includes('fashion') && normalized.includes('одоо')) ||
    (normalized.includes('загвар') && normalized.includes('одоо'))
  )
}

function isTrendDocument(document: AnoceRagDocumentRow) {
  return BROAD_TREND_TYPES.includes(document.type)
}

function isCollectionQuestion(query: string) {
  const normalized = normalizeSearchText(query)
  return (
    /\b(19|20)\d{2}\b/.test(normalized) ||
    /collection|collections|цуглуулга|tsugluulga|look|show|үзүүл|харуул/.test(normalized) ||
    /onii|oni|оны|он|havar|havriin|havriinh|хавар|хаврын|uvul|uvliin|өвөл|өвлийн|ss|fw/.test(normalized)
  )
}

function isCollectionDocument(document: AnoceRagDocumentRow) {
  return COLLECTION_TYPES.includes(document.type)
}

function isLookDocument(document: AnoceRagDocumentRow) {
  return LOOK_TYPES.includes(document.type)
}

function buildIlikeOrFilter(terms: string[]) {
  return terms
    .flatMap((term) => TEXT_SEARCH_COLUMNS.map((column) => `${column}.ilike.*${term}*`))
    .join(',')
}

function scoreDocument(document: AnoceRagDocumentRow, terms: string[], query: string) {
  const title = normalizeSearchText(document.title)
  const content = normalizeSearchText(document.content)
  const category = normalizeSearchText(document.category ?? '')
  const brandSlug = normalizeSearchText(document.brand_slug ?? '')
  const tags = normalizeSearchText((document.tags ?? []).join(' '))
  const trendQuestion = isBroadTrendQuestion(query)
  const collectionQuestion = isCollectionQuestion(query)

  let score = 0

  for (const term of terms) {
    if (title === term) score += 16
    if (title.includes(term)) score += 10
    if (tags.includes(term)) score += 8
    if (brandSlug.includes(term)) score += 7
    if (category.includes(term)) score += 5
    if (content.includes(term)) score += 2
  }

  if (document.source_confidence === 'high') score += 1
  if (document.source_confidence === 'low') score -= 1
  if (trendQuestion && isTrendDocument(document)) score += 30
  if (collectionQuestion && isCollectionDocument(document)) score += 32
  if (collectionQuestion && isLookDocument(document)) score += 12
  if (trendQuestion && document.type === 'guide') score -= 6

  return score
}

async function fetchTextMatches(terms: string[], limit: number) {
  const supabase = createAdminClient()
  const filter = buildIlikeOrFilter(terms)

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select(SELECT_COLUMNS)
    .or(filter)
    .limit(Math.max(limit * 8, 80))

  if (error) throw error
  return (data ?? []) as AnoceRagDocumentRow[]
}

async function fetchTagMatches(terms: string[], limit: number) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select(SELECT_COLUMNS)
    .overlaps('tags', terms)
    .limit(Math.max(limit * 8, 80))

  if (error) throw error
  return (data ?? []) as AnoceRagDocumentRow[]
}

async function fetchTrendDocuments(limit: number) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select(SELECT_COLUMNS)
    .in('type', BROAD_TREND_TYPES)
    .limit(limit)

  if (error) throw error
  return (data ?? []) as AnoceRagDocumentRow[]
}

async function fetchCollectionDocuments(limit: number) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select(SELECT_COLUMNS)
    .in('type', [...COLLECTION_TYPES, ...LOOK_TYPES])
    .limit(Math.max(limit * 8, 80))

  if (error) throw error
  return (data ?? []) as AnoceRagDocumentRow[]
}

export async function searchAnoceRagDocuments(query: string, limit = DEFAULT_LIMIT) {
  const terms = getSearchTerms(query)
  if (terms.length === 0) return []

  try {
    const trendQuestion = isBroadTrendQuestion(query)
    const collectionQuestion = isCollectionQuestion(query)
    const [textMatches, tagMatches, trendMatches, collectionMatches] = await Promise.all([
      fetchTextMatches(terms, limit),
      fetchTagMatches(terms, limit).catch(() => []),
      trendQuestion ? fetchTrendDocuments(Math.max(limit, 10)).catch(() => []) : Promise.resolve([]),
      collectionQuestion ? fetchCollectionDocuments(Math.max(limit, 10)).catch(() => []) : Promise.resolve([]),
    ])

    const documentsById = new Map<string, AnoceRagDocumentRow>()
    for (const document of [...textMatches, ...tagMatches]) {
      documentsById.set(document.id, document)
    }
    for (const document of trendMatches) {
      documentsById.set(document.id, document)
    }
    for (const document of collectionMatches) {
      documentsById.set(document.id, document)
    }

    return Array.from(documentsById.values())
      .map((document) => ({ document, score: scoreDocument(document, terms, query) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => {
        if (collectionQuestion && isCollectionDocument(a.document) !== isCollectionDocument(b.document)) {
          return isCollectionDocument(a.document) ? -1 : 1
        }

        if (trendQuestion && isTrendDocument(a.document) !== isTrendDocument(b.document)) {
          return isTrendDocument(a.document) ? -1 : 1
        }

        return b.score - a.score
      })
      .slice(0, limit)
      .map(({ document }) => document)
  } catch (error) {
    console.warn('Anoce RAG search failed:', error instanceof Error ? error.message : error)
    return []
  }
}

export async function buildAnoceRagContext(query: string, limit = DEFAULT_LIMIT) {
  const documents = await searchAnoceRagDocuments(query, limit)
  if (documents.length === 0) return ''

  return formatAnoceRagContext(documents)
}

export function formatAnoceRagContext(documents: AnoceRagDocumentRow[]) {
  return documents
    .map((document, index) =>
      [
        `# Эх сурвалж ${index + 1}: ${document.title}`,
        `Document ID: ${document.id}`,
        `Type: ${document.type}`,
        `Source confidence: ${document.source_confidence ?? 'medium'}`,
        `Anoce URL: ${document.url ?? 'байхгүй'}`,
        `Brand slug: ${document.brand_slug ?? 'байхгүй'}`,
        `Category: ${document.category ?? 'байхгүй'}`,
        `Tags: ${(document.tags ?? []).join(', ') || 'байхгүй'}`,
        '',
        document.content,
      ].join('\n'),
    )
    .join('\n\n---\n\n')
}
