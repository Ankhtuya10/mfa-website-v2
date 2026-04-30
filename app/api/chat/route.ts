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
      "[COLLECTION ANSWER FORMAT]",
      "Хэрэглэгч collection, жил, улирал, look асуусан бол LIVE ARCHIVE-ийн тохирох цуглуулга, look-уудыг ашигла.",
      "Дараах бүтэцтэй хариул:",
      "  Цуглуулгын нэр — Season Year",
      "  Дизайнер: ...",
      "  Товч: ...",
      "  URL: ...",
      "Онцлох looks:",
      "  - Look N: тайлбар (материал)",
      "Context-д байхгүй collection, look, материал бүү зохио.",
      "Markdown тэмдэглэгээ бүү ашигла.",
    ].join("\n");
  }
  if (isTrendQuestion(message)) {
    return [
      "[TREND ANSWER FORMAT]",
      "Монгол fashion-д давамгай чиглэлүүдийг context дээр үндэслэн тайлбарла.",
      "LIVE ARCHIVE дахь нийтлэл, цуглуулгатай холбон хариул.",
      "Context-д байхгүй брэнд, факт, тренд бүү нэм.",
      "Markdown тэмдэглэгээ бүү ашигла.",
    ].join("\n");
  }
  return [
    "[RESPONSE STYLE]",
    "Хариултыг 3-5 богино өгүүлбэр эсвэл bullet хэлбэрээр бүрэн дуусга.",
    "Холбоотой Anoce URL байвал богино зөвлөмж болгон дурд.",
    "Markdown тэмдэглэгээ бүү ашигла.",
  ].join("\n");
}

function cleanFallbackExcerpt(content: string) {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .find((line) => !/^(Төрөл:|Tags:|Anoce URL:|Type:|Category:)/i.test(line))
    ?.replace(/\s+/g, " ")
    .slice(0, 200);
}

function buildFallbackAnswer(
  liveResults: Awaited<ReturnType<typeof searchLiveArchive>>,
  brandDocs: AnoceRagDocumentRow[],
) {
  const lines = [
    "AI model түр хариулах боломжгүй. Архивын өгөгдлөөс товчлоход:",
  ];

  if (liveResults.length > 0) {
    lines.push("");
    for (const [i, r] of liveResults.slice(0, 3).entries()) {
      const firstLine = r.context.split("\n")[0] || "";
      lines.push(`${i + 1}. ${firstLine}`);
    }
  }

  if (brandDocs.length > 0) {
    lines.push("");
    for (const [i, doc] of brandDocs.slice(0, 2).entries()) {
      const excerpt = cleanFallbackExcerpt(doc.content);
      lines.push(
        `${liveResults.length + i + 1}. ${doc.title}${excerpt ? " — " + excerpt : ""}`,
      );
    }
  }

  if (liveResults.length === 0 && brandDocs.length === 0) {
    return ANOCE_INSUFFICIENT_CONTEXT_MESSAGE_MN;
  }

  lines.push("", "Дээрх нь архивын бичлэгүүд дээр үндэслэсэн товч хариу.");
  return lines.join("\n");
}

function looksIncomplete(answer: string) {
  if (!answer) return true;
  return !/[.!?\u3002\uff1f\uff01]$/.test(answer.trim());
}

// ─── provider helpers ─────────────────────────────────────────────────────────

function getProviderOrder(): Array<"gemini" | "ollama"> {
  const p = process.env.ANOCE_AI_PROVIDER?.trim().toLowerCase();
  if (p === "ollama" || p === "local") return ["ollama"];
  if (p === "gemini" || p === "google") return ["gemini"];
  return ["gemini", "ollama"];
}

function getGeminiModel() {
  return (process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash")
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

  if (first.finishReason !== "MAX_TOKENS" && !looksIncomplete(first.answer)) {
    return first.answer;
  }

  console.warn("Gemini answer looked incomplete; retrying.");
  const retryPrompt = [
    buildAnoceChatPromptMn(message, liveContext, brandContext),
    "",
    "[IMPORTANT] Өмнөх хариулт дутуу тасарсан. Маш товч, бүрэн өгүүлбэрээр дуусган бич. Дээд тал нь 4 bullet.",
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
  const model = process.env.OLLAMA_MODEL?.trim() || "qwen2.5:7b-instruct";

  const res = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(45_000),
    body: JSON.stringify({
      model,
      stream: false,
      messages: [
        { role: "system", content: ANOCE_CHATBOT_SYSTEM_PROMPT_MN },
        { role: "user", content: prompt },
      ],
      options: { temperature: 0.25, top_p: 0.9, num_predict: 900 },
    }),
  });

  const payload = (await res.json().catch(() => ({}))) as OllamaResponse;
  if (!res.ok)
    throw new Error(payload.error ?? `Ollama failed with ${res.status}`);
  return payload.message?.content?.trim() || "";
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

  if (!looksIncomplete(answer)) return answer;

  console.warn("Ollama answer looked incomplete; retrying.");
  const retryPrompt = [
    buildAnoceChatPromptMn(message, liveContext, brandContext),
    "",
    "[IMPORTANT] Өмнөх хариулт дутуу. Маш товч, бүрэн өгүүлбэрээр дуусган бич. Дээд тал нь 4 bullet.",
  ].join("\n");

  return (
    (await requestOllama(retryPrompt)) ||
    answer ||
    ANOCE_INSUFFICIENT_CONTEXT_MESSAGE_MN
  );
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
