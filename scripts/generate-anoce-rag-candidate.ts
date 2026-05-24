import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

type RagType = "brand" | "trend" | "guide";
type SourceConfidence = "high" | "medium" | "low";

type GeneratedRagDocument = {
  id: string;
  type: RagType;
  title: string;
  content: string;
  sourceConfidence: SourceConfidence;
  url: string;
  sourceUrls?: string[];
  metadata: {
    brandId?: string;
    trendId?: string;
    slug?: string;
    tier?: string;
    category?: string;
    materials?: string[];
    moods?: string[];
    keywords?: string[];
    relatedBrandIds?: string[];
  };
  verificationNotes: string[];
  needsManualReview: boolean;
};

type OllamaResponse = {
  message?: { content?: string };
  error?: string;
};

function argValue(name: string) {
  const index = process.argv.indexOf(name);
  if (index === -1) return "";
  return process.argv[index + 1] ?? "";
}

function firstPositionalArg() {
  return process.argv.slice(2).find((arg) => !arg.startsWith("--")) ?? "";
}

function requireInputPath() {
  const inputPath = argValue("--input") || firstPositionalArg();
  if (!inputPath) {
    throw new Error(
      "Usage: npm run generate:rag-candidate -- --input source-notes.md --type brand",
    );
  }

  const absolutePath = path.resolve(inputPath);
  if (!existsSync(absolutePath)) {
    throw new Error(`Input file not found: ${absolutePath}`);
  }

  return absolutePath;
}

function getRequestedType(): RagType {
  const value = (argValue("--type") || "brand").toLowerCase();
  if (value === "brand" || value === "trend" || value === "guide") {
    return value;
  }
  throw new Error("--type must be one of: brand, trend, guide");
}

function extractJsonObject(text: string) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenced?.[1] ?? trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Ollama model did not return a JSON object.");
  }
  return candidate.slice(start, end + 1);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function validateCandidate(value: unknown): GeneratedRagDocument {
  if (!value || typeof value !== "object") {
    throw new Error("Generated candidate is not an object.");
  }

  const doc = value as Partial<GeneratedRagDocument>;
  const requiredStrings = ["id", "type", "title", "content", "sourceConfidence", "url"] as const;
  for (const key of requiredStrings) {
    if (typeof doc[key] !== "string" || doc[key]?.trim() === "") {
      throw new Error(`Generated candidate is missing string field: ${key}`);
    }
  }

  if (!["brand", "trend", "guide"].includes(doc.type ?? "")) {
    throw new Error("Generated candidate type must be brand, trend, or guide.");
  }

  if (!["high", "medium", "low"].includes(doc.sourceConfidence ?? "")) {
    throw new Error("Generated sourceConfidence must be high, medium, or low.");
  }

  if (!doc.metadata || typeof doc.metadata !== "object") {
    throw new Error("Generated candidate is missing metadata.");
  }

  const metadata = doc.metadata as GeneratedRagDocument["metadata"];
  for (const key of ["materials", "moods", "keywords", "relatedBrandIds"] as const) {
    if (metadata[key] !== undefined && !isStringArray(metadata[key])) {
      throw new Error(`metadata.${key} must be a string array.`);
    }
  }

  if (doc.sourceUrls !== undefined && !isStringArray(doc.sourceUrls)) {
    throw new Error("sourceUrls must be a string array.");
  }

  if (!isStringArray(doc.verificationNotes)) {
    throw new Error("verificationNotes must be a string array.");
  }

  return {
    id: doc.id!,
    type: doc.type as RagType,
    title: doc.title!,
    content: doc.content!,
    sourceConfidence: doc.sourceConfidence as SourceConfidence,
    url: doc.url!,
    sourceUrls: doc.sourceUrls ?? [],
    metadata,
    verificationNotes: doc.verificationNotes,
    needsManualReview: doc.needsManualReview !== false,
  };
}

function buildPrompt(sourceNotes: string, requestedType: RagType) {
  return [
    "You are a strict data curator for Anoce, a Mongolian fashion archive RAG chatbot.",
    "Generate exactly one high-quality RAG candidate record from the source notes.",
    "",
    "Rules:",
    "- Return JSON only. No markdown, no explanation.",
    "- Write title and content in Mongolian unless a brand name must stay in English.",
    "- Do not invent founder names, founding years, awards, collaborations, prices, or stock status.",
    "- If a fact is not directly present in the notes, mark it in verificationNotes instead of adding it as fact.",
    "- Prefer sourceConfidence high only when the notes include official/source-backed facts.",
    "- Use medium for demo/editorial summaries or partially verified public notes.",
    "- Use low when the notes are vague or mostly social media presence.",
    "- Make metadata.keywords bilingual when useful: Mongolian, English, romanized spellings.",
    "- Keep content factual, compact, searchable, and suitable for RAG retrieval.",
    "- Use this fashion glossary when translating product/material terms:",
    "  dresses = даашинз",
    "  blouses = blouse, цамц",
    "  skirts = юбка",
    "  light outerwear = хөнгөн гадуур хувцас",
    "  silk = торго",
    "  cotton = хөвөн",
    "  satin = сатин",
    "  womenswear = эмэгтэй хувцас",
    "- If you are unsure about a fashion term, keep the English term instead of inventing a Mongolian word.",
    "- Do not use incorrect translations such as 'эрэг' for skirt or 'сэв' for silk.",
    "",
    "Return this JSON shape:",
    JSON.stringify(
      {
        id: `rag-${requestedType}-kebab-case-name`,
        type: requestedType,
        title: "Монгол гарчиг эсвэл brand name",
        content: "Төрөл: ...\\nНэр/Гарчиг: ...\\nТовч: ...\\nKeyword: ...",
        sourceConfidence: "medium",
        url: "/designers/example",
        sourceUrls: ["https://example.mn/"],
        metadata: {
          slug: "example",
          tier: "контемпорари",
          category: "womenswear",
          materials: ["ноолуур"],
          moods: ["minimal"],
          keywords: ["example", "монгол брэнд"],
          relatedBrandIds: [],
        },
        verificationNotes: ["Manual review needed for founding year."],
        needsManualReview: true,
      },
      null,
      2,
    ),
    "",
    "[REQUESTED TYPE]",
    requestedType,
    "",
    "[SOURCE NOTES]",
    sourceNotes,
  ].join("\n");
}

async function callOllama(prompt: string) {
  const baseUrl = (
    process.env.OLLAMA_BASE_URL?.trim() || "http://127.0.0.1:11434"
  ).replace(/\/+$/, "");
  const model = process.env.OLLAMA_MODEL?.trim() || "llama3.1:8b";

  const res = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(120_000),
    body: JSON.stringify({
      model,
      stream: false,
      messages: [
        {
          role: "system",
          content:
            "You create verified RAG candidate JSON for a Mongolian fashion archive. You never invent facts.",
        },
        { role: "user", content: prompt },
      ],
      options: {
        temperature: 0.15,
        top_p: 0.8,
        num_predict: 1800,
      },
    }),
  });

  const payload = (await res.json().catch(() => ({}))) as OllamaResponse;
  if (!res.ok) {
    throw new Error(payload.error ?? `Ollama failed with ${res.status}`);
  }

  return payload.message?.content?.trim() ?? "";
}

function writeCandidate(candidate: GeneratedRagDocument, inputPath: string) {
  const outputArg = argValue("--output");
  const outputPath =
    outputArg ||
    path.join(
      process.cwd(),
      "generated",
      "rag-candidates",
      `${path.basename(inputPath, path.extname(inputPath))}.json`,
    );
  const absoluteOutputPath = path.resolve(outputPath);
  mkdirSync(path.dirname(absoluteOutputPath), { recursive: true });
  writeFileSync(absoluteOutputPath, `${JSON.stringify(candidate, null, 2)}\n`, "utf8");
  return absoluteOutputPath;
}

async function main() {
  const inputPath = requireInputPath();
  const requestedType = getRequestedType();
  const sourceNotes = readFileSync(inputPath, "utf8").trim();
  if (!sourceNotes) throw new Error(`Input file is empty: ${inputPath}`);

  const prompt = buildPrompt(sourceNotes, requestedType);
  const answer = await callOllama(prompt);
  const parsed = JSON.parse(extractJsonObject(answer)) as unknown;
  const candidate = validateCandidate(parsed);
  const outputPath = writeCandidate(candidate, inputPath);

  console.log(`Generated RAG candidate: ${outputPath}`);
  console.log(`Model review required: ${candidate.needsManualReview ? "yes" : "no"}`);
  console.log(`Source confidence: ${candidate.sourceConfidence}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
