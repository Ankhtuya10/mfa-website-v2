import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const GENERATED_PATH = path.resolve(process.cwd(), 'data/anoce-rag/generated/anoce-fashion-rag.jsonl')
const VALID_PATH = path.resolve(process.cwd(), 'data/anoce-rag/validated/anoce-fashion-rag.valid.jsonl')
const REJECTED_PATH = path.resolve(process.cwd(), 'data/anoce-rag/rejected/anoce-fashion-rag.rejected.jsonl')

type RejectReason =
  | 'invalid_json'
  | 'duplicate_id'
  | 'repeated_content'
  | 'mostly_english'
  | 'too_little_mongolian'
  | 'no_mongolian_title'
  | 'no_mongolian_category'
  | 'bad_image_metadata'
  | 'missing_fields'
  | 'mojibake'

type RejectedLine = {
  line: number
  content: string
  reason: RejectReason
  detail: string
}

const CYRILLIC_PATTERN = /[А-Яа-яЁё]/
const MOJIBAKE_PATTERN = /[�\uFFFD\uFFFE\uFFFF]|Ð|Ñ/g

function hasMojibake(text: string): boolean {
  return MOJIBAKE_PATTERN.test(text)
}

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

function isMostlyEnglish(text: string): boolean {
  const totalChars = text.replace(/\s/g, '').length
  if (totalChars === 0) return true

  const latinChars = (text.match(/[a-zA-Z]/g) || []).length
  const cyrillicChars = (text.match(/[А-Яа-яЁё]/g) || []).length

  if (cyrillicChars === 0 && latinChars > 10) return true
  if (latinChars > cyrillicChars * 2 && cyrillicChars < 20) return true

  return false
}

function validateImageMetadata(obj: Record<string, unknown>): { valid: boolean; error?: string } {
  if (!obj.url || typeof obj.url !== 'string') {
    return { valid: false, error: 'Missing image url' }
  }

  if (obj.url.startsWith('http://') || obj.url.startsWith('https://')) {
    return { valid: false, error: `External URL not allowed: ${obj.url.slice(0, 80)}` }
  }

  if (!obj.url.startsWith('/')) {
    return { valid: false, error: `Image url must start with /, got: ${obj.url.slice(0, 80)}` }
  }

  if (typeof obj.alt !== 'string' || !hasMongolianCyrillic(obj.alt)) {
    return { valid: false, error: `Image alt missing or not Mongolian: "${String(obj.alt || '').slice(0, 60)}"` }
  }

  if (typeof obj.caption !== 'string' || !hasMongolianCyrillic(obj.caption)) {
    return { valid: false, error: `Image caption missing or not Mongolian: "${String(obj.caption || '').slice(0, 60)}"` }
  }

  if (hasMojibake(obj.alt) || hasMojibake(String(obj.caption || ''))) {
    return { valid: false, error: 'Image alt/caption contains mojibake' }
  }

  return { valid: true }
}

async function main() {
  await mkdir(path.dirname(VALID_PATH), { recursive: true })
  await mkdir(path.dirname(REJECTED_PATH), { recursive: true })

  let rawContent: string
  try {
    rawContent = await readFile(GENERATED_PATH, 'utf-8')
  } catch {
    console.error(`Generated file not found: ${GENERATED_PATH}`)
    console.error('Run npm run rag:generate first.')
    process.exit(1)
  }

  const lines = rawContent.split('\n').filter(Boolean)
  const validLines: string[] = []
  const rejectedLines: RejectedLine[] = []
  const seenIds = new Set<string>()
  const seenContentHashes = new Set<string>()
  const counters = {
    total: lines.length,
    valid: 0,
    rejected: 0,
    duplicate_id: 0,
    invalid_json: 0,
    mostly_english: 0,
    repeated_content: 0,
    too_little_mongolian: 0,
    no_mongolian_title: 0,
    no_mongolian_category: 0,
    bad_image_metadata: 0,
    missing_fields: 0,
    mojibake: 0,
  }

  function addRejected(lineIdx: number, content: string, reason: RejectReason, detail: string) {
    rejectedLines.push({ line: lineIdx + 1, content, reason, detail })
    counters[reason]++
    counters.rejected++
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i]

    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(rawLine) as Record<string, unknown>
    } catch {
      addRejected(i, rawLine, 'invalid_json', `JSON parse error`)
      continue
    }

    if (typeof parsed !== 'object' || parsed === null) {
      addRejected(i, rawLine, 'invalid_json', 'Parsed value is not an object')
      continue
    }

    if (typeof parsed.id !== 'string' || !parsed.id) {
      addRejected(i, rawLine, 'missing_fields', 'Missing or empty id field')
      continue
    }

    if (seenIds.has(parsed.id)) {
      addRejected(i, rawLine, 'duplicate_id', `Duplicate id: ${parsed.id}`)
      continue
    }

    if (typeof parsed.title !== 'string' || !parsed.title) {
      addRejected(i, rawLine, 'missing_fields', 'Missing or empty title')
      continue
    }

    if (typeof parsed.content !== 'string' || !parsed.content) {
      addRejected(i, rawLine, 'missing_fields', 'Missing or empty content')
      continue
    }

    if (typeof parsed.category !== 'string' || !parsed.category) {
      addRejected(i, rawLine, 'missing_fields', 'Missing or empty category')
      continue
    }

    if (!hasMongolianCyrillic(parsed.title)) {
      addRejected(i, rawLine, 'no_mongolian_title', `Title not Mongolian: "${parsed.title.slice(0, 60)}"`)
      continue
    }

    if (!hasMongolianCyrillic(parsed.category)) {
      addRejected(i, rawLine, 'no_mongolian_category', `Category not Mongolian: "${parsed.category.slice(0, 60)}"`)
      continue
    }

    if (hasMojibake(String(parsed.title)) || hasMojibake(String(parsed.content)) || hasMojibake(String(parsed.category))) {
      addRejected(i, rawLine, 'mojibake', 'Title/content/category contains mojibake characters')
      continue
    }

    if (isMostlyEnglish(parsed.content)) {
      addRejected(i, rawLine, 'mostly_english', `Content is mostly English`)
      continue
    }

    if (countMongolianWords(parsed.content) < 30) {
      addRejected(i, rawLine, 'too_little_mongolian', `Only ${countMongolianWords(parsed.content)} Mongolian words (need 30)`)
      continue
    }

    const contentHash = createSimpleHash(parsed.content)
    if (seenContentHashes.has(contentHash)) {
      addRejected(i, rawLine, 'repeated_content', 'Duplicate content (identical or near-identical)')
      continue
    }

    const rawMeta = parsed.metadata
    const metadata = rawMeta && typeof rawMeta === 'object' ? rawMeta as Record<string, unknown> : {}

    const rawImages = metadata.images
    if (rawImages !== undefined) {
      if (!Array.isArray(rawImages)) {
        addRejected(i, rawLine, 'bad_image_metadata', 'metadata.images must be an array if present')
        continue
      }

      let hasBadImage = false
      for (let j = 0; j < rawImages.length; j++) {
        const img = rawImages[j]
        if (!img || typeof img !== 'object') {
          addRejected(i, rawLine, 'bad_image_metadata', `Image at index ${j} is not an object`)
          hasBadImage = true
          break
        }
        const result = validateImageMetadata(img as Record<string, unknown>)
        if (!result.valid) {
          addRejected(i, rawLine, 'bad_image_metadata', `Image ${j}: ${result.error}`)
          hasBadImage = true
          break
        }
      }
      if (hasBadImage) continue
    }

    seenIds.add(parsed.id)
    seenContentHashes.add(contentHash)
    validLines.push(rawLine)
    counters.valid++
  }

  await writeFile(VALID_PATH, validLines.join('\n') + (validLines.length > 0 ? '\n' : ''), 'utf-8')

  const rejectedText = rejectedLines.map(r => JSON.stringify(r)).join('\n')
  await writeFile(REJECTED_PATH, rejectedText + (rejectedLines.length > 0 ? '\n' : ''), 'utf-8')

  console.log('Validation complete')
  console.log(`  total:             ${counters.total}`)
  console.log(`  valid:             ${counters.valid}`)
  console.log(`  rejected:          ${counters.rejected}`)
  console.log(`  duplicate_id:      ${counters.duplicate_id}`)
  console.log(`  invalid_json:      ${counters.invalid_json}`)
  console.log(`  mostly_english:    ${counters.mostly_english}`)
  console.log(`  repeated_content:  ${counters.repeated_content}`)
  console.log(`  too_little_mongolian: ${counters.too_little_mongolian}`)
  console.log(`  no_mongolian_title:   ${counters.no_mongolian_title}`)
  console.log(`  no_mongolian_category: ${counters.no_mongolian_category}`)
  console.log(`  bad_image_metadata:   ${counters.bad_image_metadata}`)
  console.log(`  missing_fields:    ${counters.missing_fields}`)
  console.log(`  mojibake:          ${counters.mojibake}`)
  console.log('')
  console.log(`Valid:  ${VALID_PATH}`)
  console.log(`Rejected: ${REJECTED_PATH}`)
}

function createSimpleHash(text: string): string {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return String(hash)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err))
  process.exit(1)
})
