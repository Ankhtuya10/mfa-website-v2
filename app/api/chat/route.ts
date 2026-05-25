import { NextResponse } from "next/server";
import {
  ANOCE_CHATBOT_SYSTEM_PROMPT_MN,
  ANOCE_INSUFFICIENT_CONTEXT_MESSAGE_MN,
  buildAnoceChatPromptMn,
} from "@/lib/ai/anoce-prompt.mn";
import {
  searchLiveArchive,
  formatLiveArchiveContext,
} from "@/lib/couchdb/chatSearch";
import {
  formatAnoceRagContext,
  searchAnoceRagDocuments,
  type AnoceRagDocumentRow,
} from "@/lib/supabase/rag";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// ─── types ────────────────────────────────────────────────────────────────────

type GeminiResponse = {
  candidates?: Array<{
    finishReason?: string;
    content?: { parts?: Array<{ text?: string }> };
  }>;
  usageMetadata?: {
    thoughtsTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
  error?: { message?: string };
};

type GeminiAnswerResult = {
  answer: string;
  finishReason: string | null;
  usageMetadata?: GeminiResponse["usageMetadata"];
};

type OllamaResponse = {
  message?: { content?: string };
  error?: string;
};

type ModelAnswer = {
  answer: string;
  provider: "gemini" | "ollama";
};

// ─── helpers ─────────────────────────────────────────────────────────────────

function getMessage(body: unknown): string {
  if (!body || typeof body !== "object" || !("message" in body)) return "";
  const message = (body as { message?: unknown }).message;
  return typeof message === "string" ? message.trim() : "";
}

function normalizeIntentText(value: string) {
  return value
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isTrendQuestion(message: string) {
  const n = normalizeIntentText(message);
  return (
    /trend|trends|трэнд|чиг хандлага|чиглэл/.test(n) ||
    (n.includes("fashion") && n.includes("одоо")) ||
    (n.includes("загвар") && n.includes("одоо"))
  );
}

function isCollectionQuestion(message: string) {
  const n = normalizeIntentText(message);
  return (
    /\b(19|20)\d{2}\b/.test(n) ||
    /collection|collections|цуглуулга|tsugluulga|look|show|үзүүл|харуул/.test(
      n,
    ) ||
    /onii|oni|оны|он|havar|havriin|хавар|хаврын|uvul|uvliin|өвөл|өвлийн|ss|fw/.test(
      n,
    )
  );
}

function buildAnswerGuidance(message: string) {
  if (isCollectionQuestion(message)) {
    return [
      "[ЦУГЛУУЛГЫН ХАРИУЛТЫН ХЭЛБЭР]",
      "Хэрэглэгч цуглуулга, жил, улирал, look асуусан бол шууд архивын тохирох цуглуулга, look-уудыг ашигла.",
      "Дараах бүтэцтэй хариул:",
      "  Цуглуулгын нэр — Season Year",
      "  Дизайнер: ...",
      "  Товч: ...",
      "  Холбоос: ...",
      "Онцлох looks:",
      "  - Look N: тайлбар, материал",
      "Өгөгдсөн баримтад байхгүй цуглуулга, look, материал бүү зохио.",
      "Хариултаа зөвхөн Монгол хэлээр бич. Англи гарчиг, англи тайлбар бүү ашигла.",
    ].join("\n");
  }
  if (isTrendQuestion(message)) {
    return [
      "[ЧИГ ХАНДЛАГЫН ХАРИУЛТЫН ХЭЛБЭР]",
      "Монгол загварт давамгай чиглэлүүдийг өгөгдсөн баримт дээр үндэслэн тайлбарла.",
      "Шууд архив дахь нийтлэл, цуглуулгатай холбон хариул.",
      "Өгөгдсөн баримтад байхгүй брэнд, факт, чиг хандлага бүү нэм.",
      "Хариултаа зөвхөн Монгол хэлээр бич. Англи гарчиг, англи тайлбар бүү ашигла.",
    ].join("\n");
  }
  return [
    "[ХАРИУЛТЫН ӨНГӨ АЯС]",
    "Хариултыг 3-5 богино өгүүлбэр эсвэл мөрөөр бүрэн дуусга.",
    "Холбоотой Anoce URL байвал богино зөвлөмж болгон дурд.",
    "Хариултаа зөвхөн Монгол хэлээр бич. Англи гарчиг, англи тайлбар бүү ашигла.",
  ].join("\n");
}

function cleanFallbackExcerpt(content: string) {
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const preferred = lines.find((line) =>
    /^(Тайлбар:|Товч:|Товч танилцуулга:|Body excerpt:|Агуулга:|Bio:|Дэлгэрэнгүй:)/i.test(
      line,
    ),
  );

  const fallback = lines.find(
    (line) =>
      !/^(Төрөл:|Нэр:|Гарчиг:|Slug:|Tier:|Ангилал:|Байршил:|Итгэлцлийн түвшин:|Keyword:|Tags:|Anoce URL:|Type:|Category:|Document ID:|Source confidence:|Brand slug:|Баримтын дугаар:|Брэнд slug:|Түлхүүр үг:|Он:|Улирал:)/i.test(
        line,
      ),
  );

  return (preferred ?? fallback)
    ?.replace(
      /^(Тайлбар:|Товч:|Товч танилцуулга:|Body excerpt:|Агуулга:|Bio:|Дэлгэрэнгүй:)\s*/i,
      "",
    )
    .replace(/\s+/g, " ")
    .slice(0, 260);
}

function cleanLiveTitle(context: string) {
  return (
    context
      .split("\n")
      .map((line) => line.trim())
      .find(Boolean)
      ?.replace(/^\[[^\]]+\]\s*/, "") || "Архивын бичлэг"
  );
}

function cleanLiveExcerpt(context: string) {
  const lines = context
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const labeled = lines.find((line) =>
    /^(Тайлбар:|Дэд гарчиг:|Товч:|Дэлгэрэнгүй:|Агуулга:)/i.test(line),
  );

  if (labeled?.toLowerCase().startsWith("агуулга:")) {
    const index = lines.indexOf(labeled);
    return (lines[index + 1] || labeled)
      .replace(/^Агуулга:\s*/i, "")
      .replace(/\s+/g, " ")
      .slice(0, 260);
  }

  return labeled
    ?.replace(/^(Тайлбар:|Дэд гарчиг:|Товч:|Дэлгэрэнгүй:)\s*/i, "")
    .replace(/\s+/g, " ")
    .slice(0, 260);
}

function cleanLiveUrl(context: string) {
  return context.match(/(?:Линк|Anoce URL):\s*(\S+)/i)?.[1];
}

function buildFallbackAnswer(
  liveResults: Awaited<ReturnType<typeof searchLiveArchive>>,
  brandDocs: AnoceRagDocumentRow[],
) {
  const lines = ["Anoce архивын өгөгдөл дээр үндэслэвэл:"];

  if (liveResults.length > 0) {
    for (const r of liveResults.slice(0, 2)) {
      const title = cleanLiveTitle(r.context);
      const excerpt = cleanLiveExcerpt(r.context);
      const url = cleanLiveUrl(r.context);
      lines.push(
        `- ${title}${excerpt ? `: ${excerpt}` : ""}${url ? ` (${url})` : ""}`,
      );
    }
  }

  if (brandDocs.length > 0) {
    for (const doc of brandDocs.slice(0, 3)) {
      const excerpt = cleanFallbackExcerpt(doc.content);
      const url = doc.url ? ` (${doc.url})` : "";
      lines.push(`- ${doc.title}${excerpt ? `: ${excerpt}` : ""}${url}`);
    }
  }

  if (liveResults.length === 0 && brandDocs.length === 0) {
    return ANOCE_INSUFFICIENT_CONTEXT_MESSAGE_MN;
  }

  lines.push(
    "",
    "Эдгээр нь архивт байгаа context-оос шууд нэгтгэсэн товч хариу тул байхгүй баримт нэмээгүй.",
  );
  return lines.join("\n");
}

function looksIncomplete(answer: string) {
  if (!answer) return true;
  return !/[.!?\u3002\uff1f\uff01]$/.test(answer.trim());
}

function cleanModelAnswer(answer: string) {
  return answer
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/^[\s\S]*?\.\.\.done thinking\.\s*/i, "")
    .replace(/^Thinking\.\.\.[\s\S]*?(?:\n\s*)/i, "")
    .replace(/^\s*(Final answer:|Хариулт:)\s*/i, "")
    .trim();
}

function looksLowQualityAnswer(answer: string) {
  const words = answer
    .toLowerCase()
    .match(/[\p{L}\p{N}]{3,}/gu);
  if (!words || words.length < 18) return false;

  const counts = new Map<string, number>();
  for (const word of words) counts.set(word, (counts.get(word) ?? 0) + 1);
  const maxCount = Math.max(...counts.values());
  const uniqueRatio = counts.size / words.length;

  return maxCount >= 6 || uniqueRatio < 0.35;
}

function looksEnglishHeavyAnswer(answer: string) {
  const latinLetters = answer.match(/[A-Za-z]/g)?.length ?? 0;
  const cyrillicLetters = answer.match(/[А-Яа-яЁёӨөҮү]/g)?.length ?? 0;
  if (latinLetters < 18) return false;
  return latinLetters > cyrillicLetters * 0.18;
}

// ─── provider helpers ─────────────────────────────────────────────────────────

function getProviderOrder(): Array<"gemini" | "ollama"> {
  const p = process.env.ANOCE_AI_PROVIDER?.trim().toLowerCase();
  if (p === "ollama" || p === "local" || p === "gemma") return ["ollama"];
  if (p === "gemini" || p === "google") return ["gemini"];
  return ["gemini", "ollama"];
}

function getGeminiModel() {
  return (process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash")
    .replace(/^models\//i, "")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

// ─── Gemini ────────────────────────────────────────────────────────────────────

async function requestGemini(prompt: string): Promise<GeminiAnswerResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return { answer: "", finishReason: null };

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(getGeminiModel())}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: ANOCE_CHATBOT_SYSTEM_PROMPT_MN }] },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.25,
        topP: 0.9,
        maxOutputTokens: 2048,
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  });

  const payload = (await res.json()) as GeminiResponse;
  if (!res.ok)
    throw new Error(payload.error?.message ?? "Gemini request failed");

  const candidate = payload.candidates?.[0];
  const answer = candidate?.content?.parts
    ?.map((p) => p.text ?? "")
    .join("")
    .trim();
  return {
    answer: answer || ANOCE_INSUFFICIENT_CONTEXT_MESSAGE_MN,
    finishReason: candidate?.finishReason ?? null,
    usageMetadata: payload.usageMetadata,
  };
}

async function generateGemini(
  message: string,
  liveContext: string,
  brandContext: string,
) {
  if (!process.env.GEMINI_API_KEY?.trim()) return null;

  const prompt = [
    buildAnoceChatPromptMn(message, liveContext, brandContext),
    "",
    buildAnswerGuidance(message),
  ].join("\n");
  const first = await requestGemini(prompt);

  if (
    first.finishReason !== "MAX_TOKENS" &&
    !looksIncomplete(first.answer) &&
    !looksEnglishHeavyAnswer(first.answer)
  ) {
    return first.answer;
  }

  console.warn("Gemini answer needed retry; enforcing Mongolian-only output.");
  const retryPrompt = [
    buildAnoceChatPromptMn(message, liveContext, brandContext),
    "",
    "[ЧУХАЛ] Өмнөх хариултыг зөвхөн Монгол хэлээр дахин бич. Англи өгүүлбэр, англи гарчиг, англи тайлбар бүү үлдээ. Брэндийн нэр болон холбоос зайлшгүй бол хэвээр байж болно. Маш товч, дээд тал нь 4 мөр.",
    buildAnswerGuidance(message),
  ].join("\n");

  const retry = await requestGemini(retryPrompt);
  return retry.answer || first.answer || ANOCE_INSUFFICIENT_CONTEXT_MESSAGE_MN;
}

// ─── Ollama ───────────────────────────────────────────────────────────────────

async function requestOllama(prompt: string): Promise<string> {
  const baseUrl = (
    process.env.OLLAMA_BASE_URL?.trim() || "http://127.0.0.1:11434"
  ).replace(/\/+$/, "");
  const model = process.env.OLLAMA_MODEL?.trim() || "llama3.1:8b";

  const res = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(
      Number(process.env.OLLAMA_TIMEOUT_MS?.trim() || 120_000),
    ),
    body: JSON.stringify({
      model,
      stream: false,
      think: false,
      messages: [
        { role: "system", content: ANOCE_CHATBOT_SYSTEM_PROMPT_MN },
        { role: "user", content: prompt },
      ],
      options: { temperature: 0.2, top_p: 0.85, num_predict: 700 },
    }),
  });

  const payload = (await res.json().catch(() => ({}))) as OllamaResponse;
  if (!res.ok)
    throw new Error(payload.error ?? `Ollama failed with ${res.status}`);
  return cleanModelAnswer(payload.message?.content ?? "");
}

async function generateOllama(
  message: string,
  liveContext: string,
  brandContext: string,
) {
  const prompt = [
    buildAnoceChatPromptMn(message, liveContext, brandContext),
    "",
    buildAnswerGuidance(message),
  ].join("\n");
  const answer = await requestOllama(prompt);

  if (
    !looksIncomplete(answer) &&
    !looksLowQualityAnswer(answer) &&
    !looksEnglishHeavyAnswer(answer)
  ) return answer;

  console.warn("Ollama answer needed retry; enforcing Mongolian-only output.");
  const retryPrompt = [
    buildAnoceChatPromptMn(message, liveContext, brandContext),
    "",
    "[ЧУХАЛ] Өмнөх хариултыг зөвхөн Монгол хэлээр дахин бич. Англи өгүүлбэр, англи гарчиг, англи тайлбар бүү үлдээ. Брэндийн нэр болон холбоос зайлшгүй бол хэвээр байж болно. Маш товч, дээд тал нь 4 мөр.",
  ].join("\n");

  const retry = await requestOllama(retryPrompt);
  if (
    retry &&
    !looksIncomplete(retry) &&
    !looksLowQualityAnswer(retry) &&
    !looksEnglishHeavyAnswer(retry)
  ) {
    return retry;
  }

  console.warn("Ollama answer failed quality checks; using fallback summary.");
  return "";
}

// ─── orchestrator ─────────────────────────────────────────────────────────────

async function generateAnswer(
  message: string,
  liveContext: string,
  brandContext: string,
): Promise<ModelAnswer | null> {
  for (const provider of getProviderOrder()) {
    try {
      if (provider === "gemini") {
        const answer = await generateGemini(message, liveContext, brandContext);
        if (answer) return { answer, provider };
      }
      if (provider === "ollama") {
        const answer = await generateOllama(message, liveContext, brandContext);
        if (answer) return { answer, provider };
      }
    } catch (err) {
      console.warn(
        `Anoce ${provider} failed:`,
        err instanceof Error ? err.message : err,
      );
    }
  }
  return null;
}

// ─── route ────────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Anoce AI чат ашиглахын тулд нэвтэрнэ үү." },
      { status: 401 },
    );
  }

  // Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "JSON body буруу байна." },
      { status: 400 },
    );
  }

  const message = getMessage(body);
  if (!message)
    return NextResponse.json(
      { error: "message талбар заавал хэрэгтэй." },
      { status: 400 },
    );
  if (message.length > 2000)
    return NextResponse.json(
      { error: "message хэт урт байна." },
      { status: 400 },
    );

  // ── Search both sources in parallel ──────────────────────────────────────
  const [liveResults, brandDocs] = await Promise.all([
    // 1. Live CouchDB archive — always fresh
    searchLiveArchive(message, 8).catch((err) => {
      console.warn("Live archive search failed:", err);
      return [];
    }),
    // 2. Supabase brand/trend knowledge — static curated data
    searchAnoceRagDocuments(message, 6).catch(() => []),
  ]);

  const liveContext = formatLiveArchiveContext(liveResults);
  const brandContext = formatAnoceRagContext(brandDocs);

  // If neither source found anything, return early
  if (!liveContext && !brandContext) {
    return NextResponse.json({
      answer: ANOCE_INSUFFICIENT_CONTEXT_MESSAGE_MN,
      usedAI: false,
    });
  }

  // ── Generate answer ───────────────────────────────────────────────────────
  try {
    const result = await generateAnswer(message, liveContext, brandContext);

    if (!result) {
      return NextResponse.json({
        answer: buildFallbackAnswer(liveResults, brandDocs),
        usedAI: false,
      });
    }

    return NextResponse.json({
      answer: result.answer,
      usedAI: true,
      provider: result.provider,
      sources: {
        liveArchive: liveResults.length,
        brandKnowledge: brandDocs.length,
      },
    });
  } catch (err) {
    console.error("Anoce chatbot error:", err);
    return NextResponse.json({
      answer: buildFallbackAnswer(liveResults, brandDocs),
      usedAI: false,
    });
  }
}
