import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const OLLAMA_BASE_URL = (process.env.OLLAMA_BASE_URL?.trim() || 'http://localhost:11434').replace(/\/+$/, '')
const GENERATOR_MODEL = process.env.RAG_GENERATOR_MODEL?.trim() || 'gemma3:12b'
const OUTPUT_PATH = path.resolve(process.cwd(), 'data/anoce-rag/generated/anoce-fashion-rag.jsonl')
const CREATED_AT = '2026-05-24'

type RagType = 'collection' | 'look' | 'designer_profile' | 'brand_profile' | 'editorial_article' | 'material_guide' | 'trend_guide' | 'faq' | 'glossary'

type ImageMeta = {
  url: string
  alt: string
  caption: string
  source: string | null
  image_type: string
  colors: string[]
  visible_items: string[]
  materials: string[]
  style_keywords: string[]
}

type RagDocument = {
  id: string
  type: RagType
  title: string
  content: string
  brand_slug: string | null
  category: string
  tags: string[]
  source_confidence: string
  url: string | null
  metadata: {
    source_title: string
    season: string
    year: number
    designer: string | null
    collection: string
    materials: string[]
    colors: string[]
    style_keywords: string[]
    query_aliases: string[]
    images: ImageMeta[]
  }
  language: string
  createdAt: string
}

const TOPIC_PLANS: Record<string, string[]> = {
  'Улирлын коллекц': [
    '2022 хаврын өнгөлөг коллекц',
    '2022 намрын ноолууран коллекц',
    '2023 зуны minimal коллекц',
    '2023 өвлийн давхарласан хувцас',
    '2024 хаврын пастель өнгө',
    '2024 намрын streetwear чиглэл',
    'хаврын өдөр тутмын look',
    'өвлийн дулаан материалтай look',
  ],
  'Look тайлбар': [
    'өнгөлөг хаврын look',
    'хар streetwear look',
    'minimal цагаан look',
    'oversized пальто',
    'ноолууран цамцтай look',
    'нимгэн даавуун зуны look',
    'denim casual look',
    'editorial зураг авалтын look',
  ],
  Материал: [
    'ноолуур',
    'ноос',
    'нимгэн даавуу',
    'denim',
    'арьс',
    'торго',
    'хөвөн даавуу',
    'давхарласан материал',
  ],
  'Өнгө ба silhouette': [
    'хар өнгийн minimal хувцас',
    'цагаан oversized silhouette',
    'пастель өнгөний зохицол',
    'тод ногоон accent',
    'саарал neutral palette',
    'бор намрын palette',
    'цэнхэр denim tone',
    'monochrome styling',
  ],
  'Зурагт archive metadata': [
    'look зураг дээрх өнгө таних',
    'зураг дээрх материал тайлбарлах',
    'collection cover зураг',
    'designer profile зураг',
    'editorial зураг авалтын тайлбар',
    'detail shot тайлбар',
    'хувцасны visible item жагсаалт',
    'photo caption бичих',
  ],
  FAQ: [
    'хаврын өнгөлөг хувцас хайх',
    'ноолууран материалтай look хайх',
    'minimal style санал болгох',
    'streetwear look хайх',
    'collection дотор material-аар хайх',
    'зурагтай look хэрхэн олох',
    'designer profile яаж хайх',
    'archive chatbot юу хийдэг вэ',
  ],
  'Editorial article': [
    'Монголын загварын архивын ач холбогдол',
    'улирлын collection унших арга',
    'look зураг тайлбарлах арга',
    'материал ба улирлын холбоо',
    'өнгөний чиг хандлагыг archive-д тэмдэглэх',
    'designer identity ба collection story',
    'editorial нийтлэл ба archive өгөгдөл',
    'fashion magazine platform-ийн хэрэглээ',
  ],
}

const ALL_TOPICS = Object.values(TOPIC_PLANS).flat()
const TOPIC_KEYS = Object.keys(TOPIC_PLANS)

const IMAGE_TYPES = ['cover', 'look', 'detail', 'editorial', 'designer_profile']

const CATEGORY_MN_BY_TYPE: Record<string, string> = {
  collection: "Улирлын коллекц",
  look: "Look тайлбар",
  designer_profile: "Дизайнерын танилцуулга",
  brand_profile: "Брэндийн танилцуулга",
  editorial_article: "Editorial нийтлэл",
  material_guide: "Материалын тайлбар",
  trend_guide: "Чиг хандлагын тайлбар",
  faq: "Түгээмэл асуулт",
  glossary: "Тайлбар толь",
};

function normalizeCategory(category: unknown, type: unknown): string {
  const raw = String(category || "").trim();
  if (/[А-Яа-яЁёӨөҮү]/.test(raw)) return raw;

  const typeKey = String(type || "").trim();
  return CATEGORY_MN_BY_TYPE[typeKey] || "Загварын архив";
}

function getArg(name: string, fallback: string): string {
  const idx = process.argv.indexOf(name)
  if (idx === -1) return fallback
  return process.argv[idx + 1] ?? fallback
}

function normalizeId(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
}

function pickTopic(index: number): { topicKey: string; topicLine: string } {
  const key = TOPIC_KEYS[index % TOPIC_KEYS.length]
  const lines = TOPIC_PLANS[key]
  const lineIdx = Math.floor(index / TOPIC_KEYS.length) % lines.length
  return { topicKey: key, topicLine: lines[lineIdx] }
}

function buildSeason(year: number): string {
  const seasons = ['хавар', 'зун', 'намар', 'өвөл']
  return seasons[year % 4]
}

function buildDemoImagePath(year: number, season: string, topic: string, idx: number): string {
  const slug = `${year}-${season}-${normalizeId(topic)}-look-${String(idx + 1).padStart(2, '0')}`
  return `/demo/archive/${slug}.jpg`
}

async function readExistingDocuments(filePath: string): Promise<{ lines: string[]; seenIds: Set<string>; seenTitles: Set<string> }> {
  try {
    const content = await readFile(filePath, 'utf-8')
    const lines = content.split('\n').filter(Boolean)
    const seenIds = new Set<string>()
    const seenTitles = new Set<string>()
    for (const line of lines) {
      try {
        const doc = JSON.parse(line) as RagDocument
        if (doc.id) seenIds.add(doc.id)
        if (doc.title) seenTitles.add(doc.title)
      } catch { /* skip unparseable lines */ }
    }
    return { lines, seenIds, seenTitles }
  } catch {
    return { lines: [], seenIds: new Set(), seenTitles: new Set() }
  }
}

function buildPrompt(batchSize: number, startIndex: number, existingTitles: Set<string>): string {
  const topicLines: string[] = []
  for (let i = 0; i < batchSize; i++) {
    const t = pickTopic(startIndex + i)
    topicLines.push(`  ${i + 1}. [${t.topicKey}] ${t.topicLine}`)
  }

  const existingSample = existingTitles.size > 0
    ? `\nAVOID repeating any of these existing titles:\n${Array.from(existingTitles).slice(-10).map(t => `- ${t}`).join('\n')}`
    : ''

  return [
    'You are a data generator for the Anoce Mongolian Fashion Archive RAG system.',
    'Return ONLY a valid JSON array. No markdown. No commentary. No code fences.',
    '',
    `Create ${batchSize} synthetic RAG documents. Each document describes a Mongolian fashion archive entry.`,
    '',
    'TOPICS TO GENERATE (one document per line):',
    ...topicLines,
    '',
    'REQUIRED FIELDS per object:',
    '- id: unique string starting with "gemma-fashion-" (e.g. "gemma-fashion-00001-topic-HASH")',
    '- type: one of "collection", "look", "designer_profile", "brand_profile", "editorial_article", "material_guide", "trend_guide", "faq", "glossary"',
    '- title: fluent Mongolian Cyrillic title',
    '- content: 120-180 words of natural Mongolian Cyrillic description',
    '- brand_slug: null or a kebab-case brand slug',
    '- category: Mongolian category label',
    '- tags: array of Mongolian and English search tags (5-15 tags)',
    '- source_confidence: "synthetic_demo"',
    '- url: null',
    '- metadata: object with all fields below',
    '',
    'METADATA FIELDS:',
    '- source_title: "Demo архивын бичлэг" or similar Mongolian title',
    '- season: Mongolian season name (хавар, зун, намар, өвөл)',
    '- year: 2022, 2023, or 2024',
    '- designer: null',
    '- collection: Mongolian collection name',
    '- materials: array of Mongolian material names',
    '- colors: array of Mongolian color names',
    '- style_keywords: array of Mongolian style keywords',
    '- query_aliases: array of at least 5 search aliases including Cyrillic Mongolian, Latin Mongolian (e.g. "havriin ongolog collection"), typo-tolerant Latin, and one English phrase. Example: ["2022 оны хаврын өнгөлөг коллекц", "2022 onii havriin ongolog collection", "2022 onii hawriin ungulug huvtsas", "spring 2022 mongolian fashion", "хаврын өнгөлөг хувцас"]',
    '- images: array of at least one image object with:',
    '  -- url: demo placeholder path like "/demo/archive/2022-havar-ongolog-look-01.jpg"',
    '  -- alt: Mongolian alt text',
    '  -- caption: Mongolian caption',
    '  -- source: null',
    '  -- image_type: one of "cover", "look", "detail", "editorial", "designer_profile"',
    '  -- colors: array of Mongolian color names visible in the image',
    '  -- visible_items: array of Mongolian item names (e.g. "гадуур цамц", "өмд")',
    '  -- materials: array of Mongolian material names',
    '  -- style_keywords: array of Mongolian style keywords',
    '',
    'LANGUAGE RULES:',
    '- All user-facing text MUST be fluent natural Mongolian Cyrillic. No stiff AI Mongolian.',
    '- Avoid: "энэхүү", "тус", "маш гоё", "өвөрмөц шийдэлтэй", "орчин үеийн хэв маягтай"',
    '- Use natural archive/editorial Mongolian: "2022 оны хаврын өнгөний чиглэлд...", "Энэ төрлийн look нь...", "Материалын хувьд...", "Өнгөний зохицол нь...", "Улирлын хэрэглээнд...", "Архивын хайлтад энэ бичлэг..."',
    '- English allowed only for: JSON field names, loan words when natural (look, editorial, archive, minimal, oversized, streetwear, silhouette), Latin Mongolian in query_aliases',
    '- Every content must be 120-180 words of natural Mongolian',
    '- Every document must include image metadata',
    '- Use placeholder demo image paths starting with /demo/archive/',
    '- Every image alt/caption must be Mongolian Cyrillic',
    '- Do not invent real brand facts. All records are synthetic demo.',
    '- language must be "mn"',
    '- createdAt must be "2026-05-24"',
    existingSample,
    '',
    'Return ONLY a valid JSON array. No markdown fences. No commentary.',
  ].join('\n')
}

function extractJsonArray(text: string): unknown[] {
  let cleaned = text.trim()
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  if (fenceMatch) cleaned = fenceMatch[1].trim()

  const start = cleaned.indexOf('[')
  const end = cleaned.lastIndexOf(']')
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Model output does not contain a valid JSON array.\nRaw output:\n' + text.slice(0, 500))
  }

  const json = cleaned.slice(start, end + 1)
  const parsed = JSON.parse(json) as unknown
  if (!Array.isArray(parsed)) {
    throw new Error('Parsed JSON is not an array.')
  }
  return parsed
}

const MOJIBAKE_PATTERN = /[�\uFFFD\uFFFE\uFFFF]|Ð|Ñ/g

function hasMojibake(text: string): boolean {
  return MOJIBAKE_PATTERN.test(text)
}

const CYRILLIC_PATTERN = /[А-Яа-яЁё]/

function hasMongolianCyrillic(text: string): boolean {
  return CYRILLIC_PATTERN.test(text)
}

function countMongolianWords(text: string): number {
  const words = text.split(/[\s,.\n!?]+/).filter(Boolean)
  let count = 0
  for (const word of words) {
    if (CYRILLIC_PATTERN.test(word)) count++
  }
  return count
}

function generateFallbackId(idx: number, topic: string): string {
  const hash = createHash('md5').update(`${idx}-${topic}-${Date.now()}`).digest('hex').slice(0, 8)
  return `gemma-fashion-${String(idx + 1).padStart(5, '0')}-${normalizeId(topic)}-${hash}`
}

function generateQueryAliases(title: string, season: string, year: number, collection: string, tags: string[]): string[] {
  const seasonLatin: Record<string, string> = { хавар: 'havar', зун: 'zun', намар: 'namar', өвөл: 'uvul' }
  const latinSeason = seasonLatin[season] || season

  const aliases: string[] = [
    `${year} оны ${season} ${title}`,
    `${year} onii ${latinSeason} ${title}`,
    `${year} onii ${latinSeason} ${collection}`,
    `${season} ${year} mongolian fashion`,
  ]

  const engTags = tags.filter(t => /^[a-zA-Z]/.test(t)).slice(0, 2)
  for (const tag of engTags) {
    aliases.push(`${season} ${year} ${tag}`)
  }

  aliases.push(`${year}-${latinSeason}-${normalizeId(collection)}`)
  aliases.push(`${title} ${season} ${year}`)

  return aliases
}

function generateDemoImage(year: number, season: string, topic: string): ImageMeta {
  const id = normalizeId(`${year}-${season}-${topic}-${Math.random().toString(36).slice(2, 6)}`)
  return {
    url: `/demo/archive/${id}.jpg`,
    alt: `${year} оны ${season} загварын demo зураг: ${topic}`,
    caption: `${year} оны ${season} коллекцын ${topic}. Зураг нь загварын archive-д зориулсан demo бичлэг.`,
    source: null,
    image_type: 'cover',
    colors: [],
    visible_items: [],
    materials: [],
    style_keywords: [],
  }
}

function validateDocument(value: unknown, fallbackId: string): RagDocument {
  if (!value || typeof value !== 'object') {
    throw new Error('Document is not an object')
  }

  const doc = value as Record<string, unknown>
  const id = fallbackId
  const type = (doc.type as string) || 'faq'
  const title = typeof doc.title === 'string' ? doc.title.trim() : ''
  const content = typeof doc.content === 'string' ? doc.content.trim() : ''
  const category = normalizeCategory(doc.category, doc.type)
  const brandSlug = typeof doc.brand_slug === 'string' ? doc.brand_slug : null
  const sourceConfidence = (doc.source_confidence as string) || 'synthetic_demo'
  const url = typeof doc.url === 'string' ? doc.url : null
  const tagsRaw = doc.tags
  const tags = Array.isArray(tagsRaw) ? tagsRaw.map(String) : [category || 'demo', 'mongolian fashion', 'synthetic']
  const rawMeta = doc.metadata
  const metadata = rawMeta && typeof rawMeta === 'object' ? rawMeta as Record<string, unknown> : {}

  if (!hasMongolianCyrillic(title)) {
    throw new Error(`Title lacks Mongolian Cyrillic: "${title.slice(0, 50)}"`)
  }
  if (!content || content.length < 350) {
    throw new Error(`Content too short (${content.length} chars, need 350): "${content.slice(0, 60)}..."`)
  }
  if (!hasMongolianCyrillic(content)) {
    throw new Error('Content lacks Mongolian Cyrillic')
  }
  if (countMongolianWords(content) < 30) {
    throw new Error(`Content has only ${countMongolianWords(content)} Mongolian Cyrillic words (need 30)`)
  }
  if (hasMojibake(title) || hasMojibake(content) || hasMojibake(category)) {
    throw new Error('Title/content/category contains mojibake characters')
  }

  if (!id.startsWith('gemma-fashion-')) {
    throw new Error(`ID must start with gemma-fashion-, got: ${id.slice(0, 30)}`)
  }

  const validTypes: RagType[] = ['collection', 'look', 'designer_profile', 'brand_profile', 'editorial_article', 'material_guide', 'trend_guide', 'faq', 'glossary']
  const validType = validTypes.includes(type as RagType) ? (type as RagType) : 'faq'

  const sourceTitle = typeof metadata.source_title === 'string' ? metadata.source_title : 'Demo архивын бичлэг'
  const season = typeof metadata.season === 'string' ? metadata.season : buildSeason(2022)
  const year = typeof metadata.year === 'number' ? metadata.year : 2022
  const designer = typeof metadata.designer === 'string' ? metadata.designer : null
  const collection = typeof metadata.collection === 'string' ? metadata.collection : category

  const materials = Array.isArray(metadata.materials) ? metadata.materials.map(String) : []
  const colors = Array.isArray(metadata.colors) ? metadata.colors.map(String) : []
  const styleKeywords = Array.isArray(metadata.style_keywords) ? metadata.style_keywords.map(String) : []

  const rawAliases = metadata.query_aliases
  const queryAliases = Array.isArray(rawAliases) && rawAliases.length >= 3
    ? rawAliases.map(String)
    : generateQueryAliases(title, season, year, collection, tags)

  const rawImages = metadata.images
  let images: ImageMeta[]
  if (Array.isArray(rawImages) && rawImages.length > 0) {
    images = rawImages.map((img: unknown) => {
      const i = img as Record<string, unknown>
      const imgType = typeof i.image_type === 'string' ? i.image_type : 'cover'
      const imgColors = Array.isArray(i.colors) ? i.colors.map(String) : colors
      const imgItems = Array.isArray(i.visible_items) ? i.visible_items.map(String) : []
      const imgMaterials = Array.isArray(i.materials) ? i.materials.map(String) : materials
      const imgStyleKeywords = Array.isArray(i.style_keywords) ? i.style_keywords.map(String) : styleKeywords

      const alt = typeof i.alt === 'string' ? i.alt : `${year} оны ${season} загварын архив`
      const caption = typeof i.caption === 'string' ? i.caption : `${year} оны ${season} коллекцын demo бичлэг.`

      if (hasMojibake(alt) || hasMojibake(caption)) {
        throw new Error('Image alt/caption contains mojibake')
      }

      return {
        url: typeof i.url === 'string' && i.url.startsWith('/') ? i.url : buildDemoImagePath(year, season, title, 1),
        alt,
        caption,
        source: typeof i.source === 'string' ? i.source : null,
        image_type: IMAGE_TYPES.includes(imgType) ? imgType : 'cover',
        colors: imgColors,
        visible_items: imgItems,
        materials: imgMaterials,
        style_keywords: imgStyleKeywords,
      }
    })
  } else if (['collection', 'look', 'editorial_article', 'designer_profile'].includes(validType)) {
    images = [generateDemoImage(year, season, title)]
  } else {
    images = []
  }

  for (const img of images) {
    if (!hasMongolianCyrillic(img.alt)) {
      throw new Error(`Image alt lacks Mongolian Cyrillic: "${img.alt.slice(0, 50)}"`)
    }
    if (!hasMongolianCyrillic(img.caption)) {
      throw new Error(`Image caption lacks Mongolian Cyrillic: "${img.caption.slice(0, 50)}"`)
    }
  }

  return {
    id,
    type: validType,
    title,
    content,
    brand_slug: brandSlug,
    category,
    tags,
    source_confidence: sourceConfidence,
    url,
    metadata: {
      source_title: sourceTitle,
      season,
      year,
      designer,
      collection,
      materials,
      colors,
      style_keywords: styleKeywords,
      query_aliases: queryAliases,
      images,
    },
    language: 'mn',
    createdAt: CREATED_AT,
  }
}

async function generateBatch(batchSize: number, startIndex: number, existingTitles: Set<string>): Promise<RagDocument[]> {
  const prompt = buildPrompt(batchSize, startIndex, existingTitles)

  const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(180_000),
    body: JSON.stringify({
      model: GENERATOR_MODEL,
      prompt,
      stream: false,
      options: {
        temperature: 0.35,
        num_predict: 4200,
      },
    }),
  })

  if (!res.ok) {
    const errBody = await res.text().catch(() => '')
    throw new Error(`Ollama API error ${res.status}: ${errBody.slice(0, 200)}`)
  }

  const payload = await res.json() as { response?: string; error?: string }
  if (payload.error) {
    throw new Error(`Ollama error: ${payload.error}`)
  }

  const rawText = (payload.response || '').trim()
  if (!rawText) {
    throw new Error('Ollama returned empty response')
  }

  const rawDocs = extractJsonArray(rawText)
  const docs: RagDocument[] = []

  for (let i = 0; i < rawDocs.length; i++) {
    const fallbackId = generateFallbackId(startIndex + i, pickTopic(startIndex + i).topicKey)
    try {
      const validated = validateDocument(rawDocs[i], fallbackId)
      docs.push(validated)
    } catch (err) {
      console.warn(`  Document ${startIndex + i + 1} rejected: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return docs
}

async function main() {
  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true })

  const targetCount = Math.max(1, parseInt(getArg('--count', '100'), 10) || 100)
  const batchSize = Math.max(1, Math.min(10, parseInt(getArg('--batch', '3'), 10) || 3))

  console.log(`Target: ${targetCount} documents | Batch: ${batchSize} | Model: ${GENERATOR_MODEL}`)

  const existing = await readExistingDocuments(OUTPUT_PATH)
  const existingCount = existing.lines.length
  const needCount = Math.max(0, targetCount - existingCount)

  if (needCount === 0) {
    console.log(`Already have ${existingCount}/${targetCount} documents. Nothing to generate.`)
    return
  }

  console.log(`Existing: ${existingCount} | Need to generate: ${needCount}`)

  let generated = 0
  let consecutiveFailures = 0
  const maxConsecutiveFailures = 5

  while (generated < needCount) {
    const currentBatchSize = Math.min(batchSize, needCount - generated)
    const startIdx = existingCount + generated

    console.log(`Generating batch at index ${startIdx} (batch size ${currentBatchSize})...`)

    try {
      const docs = await generateBatch(currentBatchSize, startIdx, existing.seenTitles)

      if (docs.length === 0) {
        consecutiveFailures++
        console.warn(`  Batch produced 0 valid documents. Consecutive failures: ${consecutiveFailures}/${maxConsecutiveFailures}`)
        if (consecutiveFailures >= maxConsecutiveFailures) {
          throw new Error(`Stopped after ${maxConsecutiveFailures} consecutive batch failures. Check model output quality.`)
        }
        continue
      }

      consecutiveFailures = 0

      for (const doc of docs) {
        const line = JSON.stringify(doc)
        await writeFile(OUTPUT_PATH, line + '\n', { flag: 'a', encoding: 'utf-8' })
        existing.seenIds.add(doc.id)
        existing.seenTitles.add(doc.title)
        generated++
      }

      console.log(`  Generated ${generated}/${needCount}`)
    } catch (err) {
      consecutiveFailures++
      console.warn(`  Batch error: ${err instanceof Error ? err.message : String(err)}`)
      if (consecutiveFailures >= maxConsecutiveFailures) {
        throw new Error(`Stopped after ${maxConsecutiveFailures} consecutive batch failures. Last error: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
  }

  console.log(`Done. Total documents in ${OUTPUT_PATH}: ${existingCount + generated}`)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err))
  process.exit(1)
})
