import { existsSync, readFileSync } from 'node:fs'
import { readFile as readFileAsync } from 'node:fs/promises'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const VALID_PATH = path.resolve(process.cwd(), 'data/anoce-rag/validated/anoce-fashion-rag.valid.jsonl')

type RagDocument = {
  id: string
  type: string
  title: string
  content: string
  brand_slug: string | null
  category: string
  tags: string[]
  source_confidence: string
  url: string | null
  metadata: Record<string, unknown>
}

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (!existsSync(envPath)) return

  const content = readFileSync(envPath, 'utf-8')
  const lines = content.split(/\r?\n/)
  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const match = line.match(/^(?:export\s+)?([\w.-]+)\s*=\s*(.*)$/)
    if (!match) continue
    const [, key, value] = match
    if (!process.env[key]) {
      process.env[key] = value.replace(/^["']|["']$/g, '')
    }
  }
}

async function main() {
  loadEnvLocal()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }

  let content: string
  try {
    content = await readFileAsync(VALID_PATH, 'utf-8')
  } catch {
    throw new Error(`Validated file not found: ${VALID_PATH}\nRun npm run rag:validate first.`)
  }

  const lines = content.split('\n').filter(Boolean)
  if (lines.length === 0) {
    console.log('No validated documents to import.')
    return
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const batchSize = 100
  let imported = 0

  for (let i = 0; i < lines.length; i += batchSize) {
    const batch = lines.slice(i, i + batchSize)
    const rows: RagDocument[] = []

    for (const line of batch) {
      try {
        const parsed = JSON.parse(line) as RagDocument
        rows.push({
          id: parsed.id,
          type: parsed.type,
          title: parsed.title,
          content: parsed.content,
          brand_slug: parsed.brand_slug ?? null,
          category: parsed.category ?? null,
          tags: Array.isArray(parsed.tags) ? parsed.tags : [],
          source_confidence: parsed.source_confidence || 'synthetic_demo',
          url: parsed.url ?? null,
          metadata: (parsed.metadata && typeof parsed.metadata === 'object' ? parsed.metadata : {}) as Record<string, unknown>,
        })
      } catch {
        console.warn(`Skipping unparseable line ${i + batch.indexOf(line) + 1}`)
      }
    }

    if (rows.length === 0) continue

    const { error } = await supabase
      .from('anoce_rag_documents')
      .upsert(rows, { onConflict: 'id' })

    if (error) {
      throw new Error(`Supabase upsert error at batch ${i}: ${error.message}`)
    }

    imported += rows.length
    console.log(`Imported ${imported}/${lines.length}`)
  }

  console.log(`Done. Imported ${imported} documents into anoce_rag_documents.`)
  console.log('')
  console.log('Note: language and createdAt fields were stripped (table schema does not include them).')
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err))
  process.exit(1)
})
