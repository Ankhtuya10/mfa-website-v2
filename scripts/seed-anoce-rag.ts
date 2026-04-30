import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  anoceRagDocumentsMn,
  type AnoceRagDocumentMn,
  type SourceConfidence,
} from "../lib/anoceRagDataset.mn";
import {
  anoceDemoArchiveCollectionsMn,
  type DemoArchiveCollection,
  type DemoArchiveLook,
} from "../lib/anoceDemoArchiveDataset.mn";
import {
  articles as mockArticles,
  collections as mockCollections,
  designers as mockDesigners,
} from "../lib/mockData";
import type { Article, Collection, Designer, Look } from "../lib/types";

type AnoceRagDocumentRow = {
  id: string;
  type: string;
  title: string;
  content: string;
  brand_slug: string | null;
  category: string | null;
  tags: string[];
  source_confidence: SourceConfidence;
  url: string | null;
  metadata: Record<string, unknown>;
};

type LiveDesigner = {
  id: string;
  slug: string;
  name: string;
  tier: string | null;
  bio: string | null;
  short_bio: string | null;
  founded: number | null;
};

type LiveLook = {
  id?: string;
  number: number;
  description: string | null;
  materials: string[] | null;
  tags: string[] | null;
};

type LiveCollection = {
  id: string;
  slug: string;
  title: string;
  designer_name: string;
  designer_slug: string;
  season: string;
  year: number;
  description: string | null;
  cover_image: string | null;
  looks?: LiveLook[];
};

type LiveArticle = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  category: string;
  author_name: string | null;
  body: string | null;
  status: string;
  designer_slug: string | null;
  tags: string[] | null;
  read_time: number | null;
  published_at: string | null;
};

function parseEnvValue(value: string) {
  const trimmed = value.trim();
  const quote = trimmed[0];

  if ((quote === '"' || quote === "'") && trimmed.endsWith(quote)) {
    return trimmed.slice(1, -1).replace(/\\n/g, "\n");
  }

  return trimmed;
}

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const match = line.match(/^(?:export\s+)?([\w.-]+)\s*=\s*(.*)$/);
    if (!match) continue;

    const [, key, value] = match;
    if (!process.env[key]) {
      process.env[key] = parseEnvValue(value);
    }
  }
}

function requireEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function uniqueStrings(
  values: Array<string | number | string[] | number[] | null | undefined>,
) {
  const strings = new Set<string>();

  for (const value of values) {
    const items = Array.isArray(value) ? value : [value];
    for (const item of items) {
      const normalized = String(item ?? "").trim();
      if (normalized) strings.add(normalized);
    }
  }

  return Array.from(strings);
}

function truncate(value: string, maxLength = 2400) {
  return value.length > maxLength
    ? `${value.slice(0, maxLength).trim()}...`
    : value;
}

function seasonAliases(season: string, year?: number) {
  const normalized = season.toUpperCase();
  const yearText = year ? String(year) : "";

  if (normalized === "SS") {
    return uniqueStrings([
      "SS",
      yearText && `SS${yearText}`,
      yearText && `SS ${yearText}`,
      "spring",
      "summer",
      "spring summer",
      "хавар",
      "зун",
      "хаврын",
      "havriin",
      "havriinh",
      "havar",
      "zun",
      yearText && `${yearText} оны хавар`,
      yearText && `${yearText} onii havar`,
      yearText && `${yearText} onii havriinh`,
    ]);
  }

  if (normalized === "FW") {
    return uniqueStrings([
      "FW",
      yearText && `FW${yearText}`,
      yearText && `FW ${yearText}`,
      "fall",
      "winter",
      "autumn winter",
      "намар",
      "өвөл",
      "өвлийн",
      "uvul",
      "uvliin",
      "namar",
      "namriin",
      yearText && `${yearText} оны өвөл`,
      yearText && `${yearText} onii uvul`,
      yearText && `${yearText} onii uvliin`,
    ]);
  }

  return uniqueStrings([season, yearText && `${season}${yearText}`]);
}

function commonArchiveAliases() {
  return [
    "collection",
    "collections",
    "tsugluulga",
    "цуглуулга",
    "archive",
    "look",
    "looks",
    "загвар",
    "zagvar",
    "хувцас",
    "huvtsas",
    "huvtsasnii",
    "mongol fashion",
    "mongol huvtsas",
    "монгол хувцас",
  ];
}

function toAnoceRagDocumentRow(
  document: AnoceRagDocumentMn,
): AnoceRagDocumentRow {
  const metadata = document.metadata ?? {};
  const brandSlug = metadata.slug ?? null;
  const category =
    metadata.category ?? (document.type === "brand" ? null : document.type);

  return {
    id: document.id,
    type: document.type,
    title: document.title,
    content: document.content,
    brand_slug: typeof brandSlug === "string" ? brandSlug : null,
    category: typeof category === "string" ? category : null,
    tags: uniqueStrings([
      document.type,
      document.title,
      metadata.slug,
      metadata.tier,
      metadata.category,
      metadata.materials,
      metadata.moods,
      metadata.keywords,
      metadata.relatedBrandIds,
    ]),
    source_confidence: document.sourceConfidence,
    url: document.url || null,
    metadata: {
      ...metadata,
      sourceUrls: document.sourceUrls ?? [],
      sourceDataset: "curated-mongolian-rag",
    },
  };
}

function getMockDesignerBySlug(slug: string) {
  return mockDesigners.find((designer) => designer.slug === slug);
}

function normalizeCollection(
  collection: Collection | LiveCollection,
  source: "mock" | "supabase" | "couchdb",
) {
  if (source === "supabase" || source === "couchdb") {
    const liveCollection = collection as LiveCollection;
    return {
      id: liveCollection.id,
      slug: liveCollection.slug,
      title: liveCollection.title,
      designerName: liveCollection.designer_name,
      designerSlug: liveCollection.designer_slug,
      season: liveCollection.season,
      year: liveCollection.year,
      description: liveCollection.description ?? "",
      coverImage: liveCollection.cover_image ?? "",
      looks: liveCollection.looks ?? [],
    };
  }

  const mockCollection = collection as Collection;
  return {
    id: mockCollection.id,
    slug: mockCollection.slug,
    title: mockCollection.title,
    designerName: mockCollection.designerName,
    designerSlug: mockCollection.designerSlug,
    season: mockCollection.season,
    year: mockCollection.year,
    description: mockCollection.description,
    coverImage: mockCollection.coverImage,
    looks: mockCollection.looks,
  };
}

function normalizeLook(look: Look | LiveLook) {
  return {
    number: look.number,
    description: look.description ?? "",
    materials: look.materials ?? [],
    tags: look.tags ?? [],
  };
}

function collectionRows(
  collection: Collection | LiveCollection,
  source: "mock" | "supabase" | "couchdb",
  sourceConfidence: SourceConfidence,
) {
  const normalized = normalizeCollection(collection, source);
  const aliases = seasonAliases(normalized.season, normalized.year);
  const looks = normalized.looks.map(normalizeLook);
  const materials = looks.flatMap((look) => look.materials);
  const lookTags = looks.flatMap((look) => look.tags);
  const lookSummary = looks
    .map(
      (look) =>
        `Look ${look.number}: ${look.description} Материал: ${look.materials.join(", ") || "бүртгэлгүй"}. Tags: ${look.tags.join(", ") || "байхгүй"}.`,
    )
    .join("\n");

  const baseTags = uniqueStrings([
    "archive_collection",
    "collection",
    commonArchiveAliases(),
    normalized.title,
    normalized.slug,
    normalized.designerName,
    normalized.designerSlug,
    normalized.season,
    normalized.year,
    aliases,
    materials,
    lookTags,
  ]);

  const rows: AnoceRagDocumentRow[] = [
    {
      id: `rag-archive-collection-${normalized.slug}`,
      type: "archive_collection",
      title: `${normalized.title} (${normalized.season} ${normalized.year})`,
      content: [
        "Төрөл: Archive collection",
        `Гарчиг: ${normalized.title}`,
        `Брэнд/дизайнер: ${normalized.designerName}`,
        `Slug: ${normalized.slug}`,
        `Улирал: ${normalized.season}`,
        `Он: ${normalized.year}`,
        `Улирлын alias: ${aliases.join(", ")}`,
        `Тайлбар: ${normalized.description || "Тайлбар бүртгэгдээгүй."}`,
        `Looks: ${looks.length}`,
        lookSummary,
        `Anoce URL: /archive/${normalized.slug}`,
      ].join("\n"),
      brand_slug: normalized.designerSlug || null,
      category: `collection-${normalized.season.toLowerCase()}`,
      tags: baseTags,
      source_confidence: sourceConfidence,
      url: `/archive/${normalized.slug}`,
      metadata: {
        sourceDataset:
          source === "supabase" ? "supabase-archive" : "mock-archive",
        source,
        collectionId: normalized.id,
        slug: normalized.slug,
        designerName: normalized.designerName,
        designerSlug: normalized.designerSlug,
        season: normalized.season,
        year: normalized.year,
        coverImage: normalized.coverImage,
        materials: uniqueStrings(materials),
        lookTags: uniqueStrings(lookTags),
      },
    },
  ];

  for (const look of looks) {
    rows.push({
      id: `rag-archive-look-${normalized.slug}-${look.number}`,
      type: "archive_look",
      title: `${normalized.title} Look ${look.number}`,
      content: [
        "Төрөл: Archive look",
        `Collection: ${normalized.title}`,
        `Брэнд/дизайнер: ${normalized.designerName}`,
        `Улирал/он: ${normalized.season} ${normalized.year}`,
        `Look number: ${look.number}`,
        `Тайлбар: ${look.description || "Тайлбар бүртгэгдээгүй."}`,
        `Материал: ${look.materials.join(", ") || "бүртгэлгүй"}`,
        `Tags: ${look.tags.join(", ") || "байхгүй"}`,
        `Anoce URL: /archive/${normalized.slug}`,
      ].join("\n"),
      brand_slug: normalized.designerSlug || null,
      category: `look-${normalized.season.toLowerCase()}`,
      tags: uniqueStrings([
        "archive_look",
        "look",
        commonArchiveAliases(),
        normalized.title,
        normalized.slug,
        normalized.designerName,
        normalized.season,
        normalized.year,
        aliases,
        look.materials,
        look.tags,
      ]),
      source_confidence: sourceConfidence,
      url: `/archive/${normalized.slug}`,
      metadata: {
        sourceDataset:
          source === "supabase" ? "supabase-archive" : "mock-archive",
        source,
        collectionId: normalized.id,
        collectionSlug: normalized.slug,
        designerName: normalized.designerName,
        designerSlug: normalized.designerSlug,
        season: normalized.season,
        year: normalized.year,
        lookNumber: look.number,
        materials: look.materials,
        lookTags: look.tags,
      },
    });
  }

  return rows;
}

function demoCollectionRows(collection: DemoArchiveCollection) {
  const aliases = seasonAliases(collection.season, collection.year);
  const materials = collection.looks.flatMap((look) => look.materialsMn);
  const lookTags = collection.looks.flatMap((look) => look.tags);
  const lookSummary = collection.looks
    .map(
      (look) =>
        `Look ${look.number}: ${look.title}. ${look.descriptionMn} Материал: ${look.materialsMn.join(", ")}. Tags: ${look.tags.join(", ")}.`,
    )
    .join("\n");

  const rows: AnoceRagDocumentRow[] = [
    {
      id: `rag-demo-collection-${collection.slug}`,
      type: "archive_collection",
      title: `${collection.titleMn} (${collection.season} ${collection.year})`,
      content: [
        "Төрөл: Archive collection",
        "Тайлбар: Энэ нь Anoce demo archive record бөгөөд багш/шалгалтын demo асуултад зориулсан editorial dataset бичлэг.",
        `Гарчиг: ${collection.titleMn}`,
        `English title: ${collection.title}`,
        `Брэнд/дизайнер: ${collection.designerName}`,
        `Slug: ${collection.slug}`,
        `Улирал: ${collection.season} / ${collection.seasonMn}`,
        `Он: ${collection.year}`,
        `Category: ${collection.category}`,
        `Mood: ${collection.moodMn.join(", ")}`,
        `Latin aliases: ${collection.latinAliases.join(", ")}`,
        `Товч: ${collection.summaryMn}`,
        lookSummary,
        "Anoce URL: /archive",
      ].join("\n"),
      brand_slug: collection.designerSlug,
      category: collection.category,
      tags: uniqueStrings([
        "archive_collection",
        "demo_archive",
        "collection",
        commonArchiveAliases(),
        collection.title,
        collection.titleMn,
        collection.slug,
        collection.designerName,
        collection.designerSlug,
        collection.season,
        collection.seasonMn,
        collection.year,
        collection.category,
        aliases,
        collection.tags,
        collection.latinAliases,
        collection.moodMn,
        materials,
        lookTags,
      ]),
      source_confidence: "medium",
      url: "/archive",
      metadata: {
        sourceDataset: "anoce-demo-archive",
        demoRecord: true,
        collectionId: collection.id,
        slug: collection.slug,
        designerName: collection.designerName,
        designerSlug: collection.designerSlug,
        season: collection.season,
        seasonMn: collection.seasonMn,
        year: collection.year,
        category: collection.category,
        moods: collection.moodMn,
        materials: uniqueStrings(materials),
        lookTags: uniqueStrings(lookTags),
        latinAliases: collection.latinAliases,
      },
    },
  ];

  for (const look of collection.looks) {
    rows.push(demoLookRow(collection, look, aliases));
  }

  return rows;
}

function demoLookRow(
  collection: DemoArchiveCollection,
  look: DemoArchiveLook,
  aliases: string[],
): AnoceRagDocumentRow {
  return {
    id: `rag-demo-look-${collection.slug}-${look.number}`,
    type: "archive_look",
    title: `${collection.titleMn} Look ${look.number}: ${look.title}`,
    content: [
      "Төрөл: Archive look",
      "Тайлбар: Энэ нь Anoce demo archive record-ийн look бичлэг.",
      `Collection: ${collection.titleMn}`,
      `Брэнд/дизайнер: ${collection.designerName}`,
      `Улирал/он: ${collection.season} ${collection.year} / ${collection.seasonMn}`,
      `Look number: ${look.number}`,
      `Look title: ${look.title}`,
      `Тайлбар: ${look.descriptionMn}`,
      `Материал: ${look.materialsMn.join(", ")}`,
      `Tags: ${look.tags.join(", ")}`,
      "Anoce URL: /archive",
    ].join("\n"),
    brand_slug: collection.designerSlug,
    category: `${collection.category}-look`,
    tags: uniqueStrings([
      "archive_look",
      "demo_archive",
      "look",
      commonArchiveAliases(),
      collection.title,
      collection.titleMn,
      collection.slug,
      collection.season,
      collection.seasonMn,
      collection.year,
      collection.category,
      aliases,
      collection.tags,
      collection.latinAliases,
      look.title,
      look.materialsMn,
      look.tags,
    ]),
    source_confidence: "medium",
    url: "/archive",
    metadata: {
      sourceDataset: "anoce-demo-archive",
      demoRecord: true,
      collectionId: collection.id,
      collectionSlug: collection.slug,
      designerName: collection.designerName,
      designerSlug: collection.designerSlug,
      season: collection.season,
      seasonMn: collection.seasonMn,
      year: collection.year,
      lookNumber: look.number,
      materials: look.materialsMn,
      lookTags: look.tags,
    },
  };
}

function designerRow(
  designer: Designer | LiveDesigner,
  source: "mock" | "supabase" | "couchdb",
): AnoceRagDocumentRow {
  const normalized =
    source === "supabase" || source === "couchdb"
      ? {
          id: (designer as LiveDesigner).id,
          slug: (designer as LiveDesigner).slug,
          name: (designer as LiveDesigner).name,
          tier: (designer as LiveDesigner).tier ?? "",
          bio: (designer as LiveDesigner).bio ?? "",
          shortBio: (designer as LiveDesigner).short_bio ?? "",
          founded: (designer as LiveDesigner).founded ?? undefined,
        }
      : {
          id: (designer as Designer).id,
          slug: (designer as Designer).slug,
          name: (designer as Designer).name,
          tier: (designer as Designer).tier,
          bio: (designer as Designer).bio,
          shortBio: (designer as Designer).shortBio,
          founded: (designer as Designer).founded,
        };

  return {
    id: `rag-archive-designer-${normalized.slug}`,
    type: "designer_profile",
    title: normalized.name,
    content: [
      "Төрөл: Designer profile",
      `Нэр: ${normalized.name}`,
      `Slug: ${normalized.slug}`,
      `Tier: ${normalized.tier || "бүртгэлгүй"}`,
      `Байгуулагдсан он: ${normalized.founded ?? "бүртгэлгүй"}`,
      `Товч: ${normalized.shortBio || "бүртгэлгүй"}`,
      `Bio: ${normalized.bio || "бүртгэлгүй"}`,
      `Anoce URL: /designers/${normalized.slug}`,
    ].join("\n"),
    brand_slug: normalized.slug,
    category: "designer-profile",
    tags: uniqueStrings([
      "designer",
      "brand",
      "profile",
      "брэнд",
      "дизайнер",
      "brend",
      normalized.name,
      normalized.slug,
      normalized.tier,
      normalized.founded,
    ]),
    source_confidence:
      source === "supabase" || source === "couchdb" ? "high" : "medium",
    url: `/designers/${normalized.slug}`,
    metadata: {
      sourceDataset:
        source === "supabase" ? "supabase-archive" : "mock-archive",
      source,
      designerId: normalized.id,
      slug: normalized.slug,
      tier: normalized.tier,
      founded: normalized.founded,
    },
  };
}

function articleRow(
  article: Article | LiveArticle,
  source: "mock" | "supabase" | "couchdb",
): AnoceRagDocumentRow | null {
  const normalized =
    source === "supabase" || source === "couchdb"
      ? {
          id: (article as LiveArticle).id,
          slug: (article as LiveArticle).slug,
          title: (article as LiveArticle).title,
          subtitle: (article as LiveArticle).subtitle ?? "",
          category: (article as LiveArticle).category,
          author: (article as LiveArticle).author_name ?? "",
          publishedAt: (article as LiveArticle).published_at ?? "",
          designerSlug: (article as LiveArticle).designer_slug ?? "",
          tags: (article as LiveArticle).tags ?? [],
          readTime: (article as LiveArticle).read_time ?? undefined,
          body: (article as LiveArticle).body ?? "",
          status: (article as LiveArticle).status,
        }
      : {
          id: (article as Article).id,
          slug: (article as Article).slug,
          title: (article as Article).title,
          subtitle: (article as Article).subtitle,
          category: (article as Article).category,
          author: (article as Article).author,
          publishedAt: (article as Article).publishedAt,
          designerSlug: (article as Article).designerSlug ?? "",
          tags: (article as Article).tags,
          readTime: (article as Article).readTime,
          body: (article as Article).body,
          status: (article as Article).status,
        };

  if (normalized.status !== "published") return null;

  return {
    id: `rag-archive-article-${normalized.slug}`,
    type: "editorial_article",
    title: normalized.title,
    content: [
      "Төрөл: Editorial article",
      `Гарчиг: ${normalized.title}`,
      `Subtitle: ${normalized.subtitle}`,
      `Ангилал: ${normalized.category}`,
      `Нийтлэгч: ${normalized.author || "бүртгэлгүй"}`,
      `Огноо: ${normalized.publishedAt || "бүртгэлгүй"}`,
      `Холбоотой дизайнер: ${normalized.designerSlug || "байхгүй"}`,
      `Tags: ${normalized.tags.join(", ")}`,
      `Body excerpt: ${truncate(normalized.body)}`,
      `Anoce URL: /editorial/${normalized.slug}`,
    ].join("\n"),
    brand_slug: normalized.designerSlug || null,
    category: `article-${normalized.category}`,
    tags: uniqueStrings([
      "article",
      "editorial",
      "нийтлэл",
      normalized.title,
      normalized.slug,
      normalized.subtitle,
      normalized.category,
      normalized.designerSlug,
      normalized.tags,
      normalized.publishedAt?.slice(0, 4),
    ]),
    source_confidence:
      source === "supabase" || source === "couchdb" ? "high" : "medium",
    url: `/editorial/${normalized.slug}`,
    metadata: {
      sourceDataset:
        source === "supabase" ? "supabase-archive" : "mock-archive",
      source,
      articleId: normalized.id,
      slug: normalized.slug,
      category: normalized.category,
      designerSlug: normalized.designerSlug,
      tags: normalized.tags,
      readTime: normalized.readTime,
      publishedAt: normalized.publishedAt,
    },
  };
}

async function fetchLiveArchiveRows(_supabase: SupabaseClient) {
  // Content now lives in CouchDB, not Supabase.
  // We talk directly to CouchDB using the same client the app uses.
  const { createContentRepository } = await import("../lib/couchdb/repository");
  const repo = createContentRepository();
  const rows: AnoceRagDocumentRow[] = [];

  const [designers, collections, articles] = await Promise.all([
    repo.getDesigners().catch((e: Error) => {
      console.warn("CouchDB designers failed:", e.message);
      return [];
    }),
    repo.getCollections().catch((e: Error) => {
      console.warn("CouchDB collections failed:", e.message);
      return [];
    }),
    repo.getArticles({ status: "published" }).catch((e: Error) => {
      console.warn("CouchDB articles failed:", e.message);
      return [];
    }),
  ]);

  for (const d of designers) {
    const live: LiveDesigner = {
      id: d.id,
      slug: d.slug,
      name: d.name,
      tier: d.tier,
      bio: d.bio,
      short_bio: d.short_bio || d.shortBio,
      founded: d.founded,
    };
    rows.push(designerRow(live, "couchdb"));
  }

  for (const c of collections) {
    const looks = (c.looks || []).map((l: any) => ({
      number: l.number,
      description: l.description,
      materials: l.materials || [],
      tags: l.tags || [],
    }));
    const live: LiveCollection = {
      id: c.id,
      slug: c.slug,
      title: c.title,
      designer_name: c.designer_name,
      designer_slug: c.designer_slug,
      season: c.season,
      year: c.year,
      description: c.description,
      cover_image: c.cover_image,
      looks,
    };
    rows.push(...collectionRows(live, "couchdb", "high"));
  }

  for (const a of articles) {
    const live: LiveArticle = {
      id: a.id,
      slug: a.slug,
      title: a.title,
      subtitle: a.subtitle,
      category: a.category,
      author_name: a.author_name || a.author,
      body: a.body,
      status: a.status,
      designer_slug: a.designer_slug,
      tags: a.tags || [],
      read_time: a.read_time || a.readTime,
      published_at: a.published_at || a.publishedAt,
    };
    const row = articleRow(live, "couchdb");
    if (row) rows.push(row);
  }

  console.log(
    `  CouchDB: ${designers.length} designers, ${collections.length} collections, ${articles.length} articles`,
  );
  return rows;
}

function buildLocalArchiveRows() {
  const rows: AnoceRagDocumentRow[] = [];

  rows.push(...mockDesigners.map((designer) => designerRow(designer, "mock")));

  for (const collection of mockCollections) {
    rows.push(...collectionRows(collection, "mock", "medium"));
  }

  for (const article of mockArticles) {
    const row = articleRow(article, "mock");
    if (row) rows.push(row);
  }

  for (const collection of anoceDemoArchiveCollectionsMn) {
    rows.push(...demoCollectionRows(collection));
  }

  return rows;
}

function dedupeRows(rows: AnoceRagDocumentRow[]) {
  const byId = new Map<string, AnoceRagDocumentRow>();
  for (const row of rows) byId.set(row.id, row);
  return Array.from(byId.values());
}

async function main() {
  loadEnvLocal();

  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (anonKey && serviceRoleKey === anonKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY must be the service role key, not the anon key.",
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const curatedRows = anoceRagDocumentsMn.map(toAnoceRagDocumentRow);
  const localArchiveRows = buildLocalArchiveRows();
  const liveArchiveRows = await fetchLiveArchiveRows(supabase);
  const rows = dedupeRows([
    ...curatedRows,
    ...localArchiveRows,
    ...liveArchiveRows,
  ]);

  if (rows.length === 0) {
    throw new Error("No Anoce RAG documents were generated.");
  }

  const { data, error } = await supabase
    .from("anoce_rag_documents")
    .upsert(rows, { onConflict: "id" })
    .select("id");

  if (error) {
    throw new Error(`Failed to seed anoce_rag_documents: ${error.message}`);
  }

  console.log(
    `Inserted/updated ${data?.length ?? rows.length} Anoce RAG rows.`,
  );
  console.log(`Curated Mongolian docs: ${curatedRows.length}`);
  console.log(`Local archive/demo docs: ${localArchiveRows.length}`);
  console.log(`Live Supabase archive docs: ${liveArchiveRows.length}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
