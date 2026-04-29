import { NextResponse } from 'next/server'
import {
  ANOCE_CHATBOT_SYSTEM_PROMPT_MN,
  ANOCE_INSUFFICIENT_CONTEXT_MESSAGE_MN,
  buildAnoceChatPromptMn,
} from '@/lib/ai/anoce-prompt.mn'
import {
  formatAnoceRagContext,
  searchAnoceRagDocuments,
  type AnoceRagDocumentRow,
} from '@/lib/supabase/rag'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

type GeminiResponse = {
  candidates?: Array<{
    finishReason?: string
    content?: {
      parts?: Array<{ text?: string }>
    }
  }>
  usageMetadata?: {
    thoughtsTokenCount?: number
    candidatesTokenCount?: number
    totalTokenCount?: number
  }
  error?: {
    message?: string
  }
}

type GeminiAnswerResult = {
  answer: string
  finishReason: string | null
  usageMetadata?: GeminiResponse['usageMetadata']
}

type OllamaResponse = {
  message?: {
    content?: string
  }
  error?: string
}

type ModelAnswer = {
  answer: string
  provider: 'gemini' | 'ollama'
}

function getMessage(body: unknown) {
  if (!body || typeof body !== 'object' || !('message' in body)) return ''
  const message = (body as { message?: unknown }).message
  return typeof message === 'string' ? message.trim() : ''
}

function normalizeIntentText(value: string) {
  return value
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function isTrendQuestion(message: string) {
  const normalized = normalizeIntentText(message)
  return (
    /trend|trends|трэнд|чиг хандлага|чиглэл/.test(normalized) ||
    (normalized.includes('fashion') && normalized.includes('одоо')) ||
    (normalized.includes('загвар') && normalized.includes('одоо'))
  )
}

function isCollectionQuestion(message: string) {
  const normalized = normalizeIntentText(message)
  return (
    /\b(19|20)\d{2}\b/.test(normalized) ||
    /collection|collections|цуглуулга|tsugluulga|look|show|үзүүл|харуул/.test(normalized) ||
    /onii|oni|оны|он|havar|havriin|havriinh|хавар|хаврын|uvul|uvliin|өвөл|өвлийн|ss|fw/.test(normalized)
  )
}

function buildAnswerGuidance(message: string) {
  if (isCollectionQuestion(message)) {
    return [
      '[COLLECTION ANSWER FORMAT]',
      'Хэрэглэгч collection, жил, улирал, look, эсвэл "show" маягийн асуулт асуусан бол context-оос зөвхөн тохирох archive_collection болон archive_look бичлэгүүдийг ашигла.',
      'Хэрэв яг тохирох жил/улирал/сэдэв context-д байвал дараах бүтэцтэй хариул:',
      '',
      'Anoce архивт тохирох бичлэгүүд:',
      '1. Collection name — Season Year',
      '   Брэнд/эх сурвалж: ...',
      '   Товч: ...',
      '   URL: ...',
      '',
      'Онцлох looks:',
      '- Look 1: ...',
      '- Look 2: ...',
      '',
      'Хэрэв яг тохирох collection байхгүй боловч ойролцоо бичлэг байвал "яг энэ нөхцөлөөр бүртгэл олдсонгүй, ойролцоо нь:" гэж тодорхой хэл.',
      'Context-д байхгүй collection, жил, брэнд, look бүү зохио.',
      'Markdown bold/italic тэмдэглэгээ бүү ашигла.',
    ].join('\n')
  }

  if (isTrendQuestion(message)) {
    return [
      '[TREND ANSWER FORMAT]',
      'Хэрэв context хангалттай бол яг ийм бүтэцтэй, бүрэн хариул:',
      '"Товчоор хэлбэл, Anoce архивын өгөгдлөөс харахад Монгол fashion-д дараах чиглэлүүд давамгай байна:"',
      '',
      '1. Ноолуур ба luxury minimalism',
      'Context-д байгаа ноолуур, minimal, premium basic, winter layering холбоосыг 1-2 өгүүлбэрээр тайлбарла.',
      '',
      '2. Дээлээс санаа авсан silhouette',
      'Context-д байгаа дээл, heritage-modern, торго, ёслолын хувцасны холбоосыг тайлбарла.',
      '',
      '3. Ulaanbaatar streetwear',
      'Context-д байгаа hoodie, denim, graphic, comfort fit, youth casualwear чиглэлийг тайлбарла.',
      '',
      '4. Custom / made-to-order загвар',
      'Context-д байгаа custom sizing, made-to-order, boutique production холбоосыг тайлбарла.',
      '',
      'Холбоотой брэндүүд:',
      '- Context-д нэрлэгдсэн брэндүүдээс 3-6-г л жагсаа.',
      '',
      'Context-д байхгүй брэнд, факт, тренд бүү нэм.',
      'Markdown bold/italic тэмдэглэгээ бүү ашигла.',
    ].join('\n')
  }

  return [
    '[RESPONSE STYLE]',
    'Хариултыг 3-5 богино өгүүлбэр эсвэл bullet хэлбэрээр бүрэн дуусга.',
    'Өгүүлбэрийг дундаас нь тасалж болохгүй.',
    'Холбоотой Anoce URL context-д байвал богино зөвлөмж болгон дурд.',
    'Markdown bold/italic тэмдэглэгээ бүү ашигла.',
  ].join('\n')
}

function cleanFallbackExcerpt(content: string) {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .find((line) => !/^Төрөл:|^Tags:|^Anoce URL:/i.test(line))
    ?.replace(/\s+/g, ' ')
    .slice(0, 180)
}

function buildArchiveFallbackAnswer(documents: AnoceRagDocumentRow[]) {
  const topDocuments = documents.slice(0, 4)

  if (topDocuments.length === 0) return ANOCE_INSUFFICIENT_CONTEXT_MESSAGE_MN

  const lines = [
    'AI model түр хариулах боломжгүй байгаа тул Anoce архивын context-оос шууд товчиллоо:',
    '',
    ...topDocuments.map((document, index) => {
      const details = [
        document.category,
        document.brand_slug ? `брэнд: ${document.brand_slug}` : null,
        document.url ? `URL: ${document.url}` : null,
      ].filter(Boolean)

      const excerpt = cleanFallbackExcerpt(document.content)

      return [
        `${index + 1}. ${document.title}`,
        details.length ? `   ${details.join(' · ')}` : null,
        excerpt ? `   ${excerpt}` : null,
      ]
        .filter(Boolean)
        .join('\n')
    }),
    '',
    'Дээрх нь зөвхөн архивт олдсон бичлэгүүд дээр үндэслэсэн товч хариу.',
  ]

  return lines.join('\n')
}

function buildModelPrompt(message: string, context: string) {
  return [
    buildAnoceChatPromptMn(message, context),
    '',
    buildAnswerGuidance(message),
  ].join('\n')
}

function looksIncomplete(answer: string) {
  if (!answer) return true
  return !/[.!?\u3002\uff1f\uff01]$/.test(answer.trim())
}

function getProviderOrder() {
  const configuredProvider = process.env.ANOCE_AI_PROVIDER?.trim().toLowerCase()

  if (configuredProvider === 'ollama' || configuredProvider === 'local') return ['ollama'] as const
  if (configuredProvider === 'gemini' || configuredProvider === 'google') return ['gemini'] as const

  return ['gemini', 'ollama'] as const
}

function getGeminiModelName() {
  const configuredModel = process.env.GEMINI_MODEL?.trim()
  if (!configuredModel) return 'gemini-2.5-flash'

  return configuredModel
    .replace(/^models\//i, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
}

async function requestGeminiAnswer(prompt: string): Promise<GeminiAnswerResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) {
    return { answer: '', finishReason: null }
  }

  const model = getGeminiModelName()
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model,
  )}:generateContent?key=${encodeURIComponent(apiKey)}`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: ANOCE_CHATBOT_SYSTEM_PROMPT_MN }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.25,
        topP: 0.9,
        maxOutputTokens: 2048,
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    }),
  })

  const payload = (await response.json()) as GeminiResponse

  if (!response.ok) {
    throw new Error(payload.error?.message ?? 'Gemini request failed')
  }

  const candidate = payload.candidates?.[0]
  const answer = candidate?.content?.parts
    ?.map((part) => part.text ?? '')
    .join('')
    .trim()

  return {
    answer: answer || ANOCE_INSUFFICIENT_CONTEXT_MESSAGE_MN,
    finishReason: candidate?.finishReason ?? null,
    usageMetadata: payload.usageMetadata,
  }
}

async function generateGeminiAnswer(message: string, context: string) {
  if (!process.env.GEMINI_API_KEY?.trim()) return null

  const basePrompt = [
    buildAnoceChatPromptMn(message, context),
    '',
    buildAnswerGuidance(message),
  ].join('\n')

  const firstResult = await requestGeminiAnswer(basePrompt)

  if (firstResult.finishReason !== 'MAX_TOKENS' && !looksIncomplete(firstResult.answer)) {
    return firstResult.answer
  }

  console.warn('Gemini answer looked incomplete; retrying with shorter prompt.', {
    finishReason: firstResult.finishReason,
    usageMetadata: firstResult.usageMetadata,
  })

  const retryPrompt = [
    buildAnoceChatPromptMn(message, context),
    '',
    '[IMPORTANT]',
    'Өмнөх хариулт дутуу тасарсан байж магадгүй. Зөвхөн энэ context дээр үндэслээд хариултыг шинээр, маш товч, бүрэн өгүүлбэрээр дуусган бич.',
    'Markdown bold/italic тэмдэглэгээ бүү ашигла.',
    'Дээд тал нь 4 богино bullet ашигла.',
    buildAnswerGuidance(message),
  ].join('\n')

  const retryResult = await requestGeminiAnswer(retryPrompt)
  return retryResult.answer || firstResult.answer || ANOCE_INSUFFICIENT_CONTEXT_MESSAGE_MN
}

function getOllamaBaseUrl() {
  return (process.env.OLLAMA_BASE_URL?.trim() || 'http://127.0.0.1:11434').replace(/\/+$/, '')
}

function getOllamaModelName() {
  return process.env.OLLAMA_MODEL?.trim() || 'qwen2.5:7b-instruct'
}

async function requestOllamaAnswer(prompt: string) {
  const model = getOllamaModelName()
  const endpoint = `${getOllamaBaseUrl()}/api/chat`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(45_000),
    body: JSON.stringify({
      model,
      stream: false,
      messages: [
        {
          role: 'system',
          content: ANOCE_CHATBOT_SYSTEM_PROMPT_MN,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      options: {
        temperature: 0.25,
        top_p: 0.9,
        num_predict: 900,
      },
    }),
  })

  const payload = (await response.json().catch(() => ({}))) as OllamaResponse

  if (!response.ok) {
    throw new Error(payload.error ?? `Ollama request failed with ${response.status}`)
  }

  return payload.message?.content?.trim() || ''
}

async function generateOllamaAnswer(message: string, context: string) {
  const answer = await requestOllamaAnswer(buildModelPrompt(message, context))

  if (!looksIncomplete(answer)) return answer

  console.warn('Ollama answer looked incomplete; retrying with shorter prompt.')

  const retryPrompt = [
    buildAnoceChatPromptMn(message, context),
    '',
    '[IMPORTANT]',
    'Өмнөх хариулт дутуу тасарсан байж магадгүй. Зөвхөн энэ context дээр үндэслээд хариултыг шинээр, маш товч, бүрэн өгүүлбэрээр дуусган бич.',
    'Markdown bold/italic тэмдэглэгээ бүү ашигла.',
    'Дээд тал нь 4 богино bullet ашигла.',
  ].join('\n')

  return (await requestOllamaAnswer(retryPrompt)) || answer || ANOCE_INSUFFICIENT_CONTEXT_MESSAGE_MN
}

async function generateModelAnswer(message: string, context: string): Promise<ModelAnswer | null> {
  const providers = getProviderOrder()

  for (const provider of providers) {
    try {
      if (provider === 'gemini') {
        const answer = await generateGeminiAnswer(message, context)
        if (answer) return { answer, provider }
      }

      if (provider === 'ollama') {
        const answer = await generateOllamaAnswer(message, context)
        if (answer) return { answer, provider }
      }
    } catch (error) {
      console.warn(
        `Anoce ${provider} generation failed:`,
        error instanceof Error ? error.message : error,
      )
    }
  }

  return null
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Anoce AI чат ашиглахын тулд нэвтэрнэ үү.' }, { status: 401 })
  }

  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON body буруу байна.' }, { status: 400 })
  }

  const message = getMessage(body)

  if (!message) {
    return NextResponse.json({ error: 'message талбар заавал хэрэгтэй.' }, { status: 400 })
  }

  if (message.length > 2000) {
    return NextResponse.json({ error: 'message хэт урт байна.' }, { status: 400 })
  }

  const documents = await searchAnoceRagDocuments(message, 10)

  if (documents.length === 0) {
    return NextResponse.json({
      answer: ANOCE_INSUFFICIENT_CONTEXT_MESSAGE_MN,
      usedAI: false,
    })
  }

  const context = formatAnoceRagContext(documents)

  try {
    const modelAnswer = await generateModelAnswer(message, context)

    if (!modelAnswer) {
      return NextResponse.json({
        answer: buildArchiveFallbackAnswer(documents),
        usedAI: false,
      })
    }

    return NextResponse.json({
      answer: modelAnswer.answer,
      usedAI: true,
      provider: modelAnswer.provider,
    })
  } catch (error) {
    console.error('Anoce chatbot generation failed:', error)

    return NextResponse.json({
      answer: buildArchiveFallbackAnswer(documents),
      usedAI: false,
    })
  }
}
