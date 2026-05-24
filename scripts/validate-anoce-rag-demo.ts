import {
  anoceBrandsMn,
  anoceGuideDocumentsMn,
  anoceRagDocumentsMn,
  anoceTrendsMn,
  type SourceConfidence,
} from "../lib/anoceRagDataset.mn";
import { anoceDemoArchiveCollectionsMn } from "../lib/anoceDemoArchiveDataset.mn";
import {
  articles as mockArticles,
  collections as mockCollections,
  designers as mockDesigners,
} from "../lib/mockData";

type LocalRagDoc = {
  id: string;
  type: string;
  title: string;
  content: string;
  tags: string[];
  sourceConfidence: SourceConfidence;
};

const demoQuestions = [
  "Anoce гэж юу вэ?",
  "Монгол fashion-д одоо ямар trend байна вэ?",
  "Ноолуур ашигладаг Монгол брэндүүдийг санал болго.",
  "Дээлэн silhouette болон heritage-modern стиль ашигладаг брэндүүд аль вэ?",
  "Улаанбаатарын streetwear чиглэлийн брэндүүдийг харуул.",
  "2023 оны өвлийн ноолуур collection-ийн тухай хэл.",
  "Захиалгат хувцас эсвэл made-to-order чиглэлтэй record байна уу?",
  "Энэ chatbot мэдээлэл байхгүй үед яаж хариулдаг вэ?",
];

const stopWords = new Set([
  "гэж",
  "юу",
  "вэ",
  "аль",
  "ямар",
  "байна",
  "уу",
  "болон",
  "эсвэл",
  "энэ",
  "тухай",
  "хэл",
]);

function normalize(value: string) {
  return value
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function termsFor(query: string) {
  const normalized = normalize(query);
  const terms = new Set(
    normalized
      .split(" ")
      .filter((term) => term.length > 1 && !stopWords.has(term)),
  );

  const expansions: Array<[RegExp, string[]]> = [
    [/anoce|платформ/, ["anoce", "платформ", "дижитал", "archive"]],
    [/rag|chatbot|чатбот/, ["rag", "chatbot", "context", "dataset"]],
    [/trend|трэнд|чиг/, ["trend", "трэнд", "чиг", "fashion"]],
    [/ноолуур|cashmere/, ["ноолуур", "cashmere", "gobi", "goyo", "evseg"]],
    [/дээл|heritage/, ["дээл", "deel", "heritage", "торго", "хатгамал"]],
    [/streetwear|street|улаанбаатар/, ["streetwear", "street", "urban", "hoodie", "denim"]],
    [/2023|өвөл|winter|fw/, ["2023", "өвөл", "winter", "fw", "cashmere"]],
    [/захиалгат|custom|made/, ["захиалгат", "custom", "made-to-order", "tailoring"]],
    [/мэдээлэл|байхгүй|зохиох/, ["context", "хязгаар", "зохиохгүй", "safety"]],
  ];

  for (const [pattern, extraTerms] of expansions) {
    if (pattern.test(normalized)) extraTerms.forEach((term) => terms.add(term));
  }

  return Array.from(terms);
}

function scoreDoc(query: string, doc: LocalRagDoc) {
  const terms = termsFor(query);
  const title = normalize(doc.title);
  const tagText = normalize(doc.tags.join(" "));
  const content = normalize(doc.content);

  let score = 0;
  for (const term of terms) {
    const normalizedTerm = normalize(term);
    if (title.includes(normalizedTerm)) score += 10;
    if (tagText.includes(normalizedTerm)) score += 6;
    if (content.includes(normalizedTerm)) score += 2;
  }

  if (doc.sourceConfidence === "high") score += 1;
  if (doc.sourceConfidence === "low") score -= 1;
  return score;
}

function demoArchiveDocs(): LocalRagDoc[] {
  return anoceDemoArchiveCollectionsMn.flatMap((collection) => {
    const collectionDoc: LocalRagDoc = {
      id: `rag-demo-collection-${collection.slug}`,
      type: "archive_collection",
      title: `${collection.titleMn} (${collection.season} ${collection.year})`,
      content: [
        collection.title,
        collection.summaryMn,
        collection.moodMn.join(", "),
        collection.looks
          .map(
            (look) =>
              `Look ${look.number}: ${look.title}. ${look.descriptionMn}. ${look.materialsMn.join(", ")}.`,
          )
          .join("\n"),
      ].join("\n"),
      tags: [
        "archive_collection",
        "demo_archive",
        collection.title,
        collection.titleMn,
        collection.slug,
        collection.season,
        collection.seasonMn,
        String(collection.year),
        collection.category,
        ...collection.tags,
        ...collection.latinAliases,
        ...collection.moodMn,
        ...collection.looks.flatMap((look) => [...look.tags, ...look.materialsMn]),
      ],
      sourceConfidence: "medium",
    };

    const lookDocs = collection.looks.map<LocalRagDoc>((look) => ({
      id: `rag-demo-look-${collection.slug}-${look.number}`,
      type: "archive_look",
      title: `${collection.titleMn} Look ${look.number}: ${look.title}`,
      content: `${collection.titleMn}. ${look.descriptionMn}. Материал: ${look.materialsMn.join(", ")}.`,
      tags: [
        "archive_look",
        "demo_archive",
        "look",
        collection.title,
        collection.titleMn,
        collection.season,
        collection.seasonMn,
        String(collection.year),
        collection.category,
        ...collection.tags,
        ...collection.latinAliases,
        look.title,
        ...look.materialsMn,
        ...look.tags,
      ],
      sourceConfidence: "medium",
    }));

    return [collectionDoc, ...lookDocs];
  });
}

function mockArchiveDocs(): LocalRagDoc[] {
  const designerDocs = mockDesigners.map<LocalRagDoc>((designer) => ({
    id: `rag-archive-designer-${designer.slug}`,
    type: "designer_profile",
    title: designer.name,
    content: `${designer.shortBio}\n${designer.bio}`,
    tags: [
      "designer",
      "brand",
      "дизайнер",
      designer.name,
      designer.slug,
      designer.brand,
      designer.tier,
      String(designer.founded),
    ],
    sourceConfidence: "medium",
  }));

  const collectionDocs = mockCollections.flatMap<LocalRagDoc>((collection) => [
    {
      id: `rag-archive-collection-${collection.slug}`,
      type: "archive_collection",
      title: `${collection.title} (${collection.season} ${collection.year})`,
      content: [
        collection.description,
        collection.looks
          .map(
            (look) =>
              `Look ${look.number}: ${look.description}. ${look.materials.join(", ")}.`,
          )
          .join("\n"),
      ].join("\n"),
      tags: [
        "collection",
        collection.title,
        collection.slug,
        collection.designerName,
        collection.season,
        String(collection.year),
        ...collection.looks.flatMap((look) => [...look.tags, ...look.materials]),
      ],
      sourceConfidence: "medium",
    },
    ...collection.looks.map<LocalRagDoc>((look) => ({
      id: `rag-archive-look-${collection.slug}-${look.number}`,
      type: "archive_look",
      title: `${collection.title} Look ${look.number}`,
      content: `${look.description}. ${look.materials.join(", ")}.`,
      tags: [
        "look",
        collection.title,
        collection.slug,
        collection.season,
        String(collection.year),
        ...look.tags,
        ...look.materials,
      ],
      sourceConfidence: "medium",
    })),
  ]);

  const articleDocs = mockArticles
    .filter((article) => article.status === "published")
    .map<LocalRagDoc>((article) => ({
      id: `rag-archive-article-${article.slug}`,
      type: "editorial_article",
      title: article.title,
      content: `${article.subtitle}\n${article.body}`,
      tags: [
        "article",
        "editorial",
        "нийтлэл",
        article.title,
        article.slug,
        article.category,
        article.designerSlug ?? "",
        ...article.tags,
        article.publishedAt.slice(0, 4),
      ],
      sourceConfidence: "medium",
    }));

  return [...designerDocs, ...collectionDocs, ...articleDocs];
}

function localDocs() {
  const curatedDocs = anoceRagDocumentsMn.map<LocalRagDoc>((doc) => ({
    id: doc.id,
    type: doc.type,
    title: doc.title,
    content: doc.content,
    tags: [
      doc.type,
      doc.title,
      doc.metadata.slug ?? "",
      doc.metadata.tier ?? "",
      doc.metadata.category ?? "",
      ...(doc.metadata.materials ?? []),
      ...(doc.metadata.moods ?? []),
      ...(doc.metadata.keywords ?? []),
      ...(doc.metadata.relatedBrandIds ?? []),
    ].filter(Boolean) as string[],
    sourceConfidence: doc.sourceConfidence,
  }));

  return [...curatedDocs, ...mockArchiveDocs(), ...demoArchiveDocs()];
}

function main() {
  const docs = localDocs();
  const counts = docs.reduce<Record<string, number>>((acc, doc) => {
    acc[doc.type] = (acc[doc.type] ?? 0) + 1;
    return acc;
  }, {});

  console.log("Anoce RAG defense demo coverage");
  console.log("--------------------------------");
  console.log(`Curated brands: ${anoceBrandsMn.length}`);
  console.log(`Curated trends: ${anoceTrendsMn.length}`);
  console.log(`Guide records: ${anoceGuideDocumentsMn.length + 1}`);
  console.log(`Demo archive collections: ${anoceDemoArchiveCollectionsMn.length}`);
  console.log(`Total local seedable docs before live CouchDB: ${docs.length}`);
  console.log("");
  console.log("Document type counts:");
  for (const [type, count] of Object.entries(counts).sort()) {
    console.log(`- ${type}: ${count}`);
  }

  console.log("");
  console.log("Demo question retrieval check:");

  let hasFailure = false;
  for (const question of demoQuestions) {
    const matches = docs
      .map((doc) => ({ doc, score: scoreDoc(question, doc) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    if (matches.length === 0) hasFailure = true;

    console.log("");
    console.log(`Q: ${question}`);
    if (matches.length === 0) {
      console.log("  FAIL: no local RAG match");
      continue;
    }

    for (const { doc, score } of matches) {
      console.log(`  OK ${score.toString().padStart(2, " ")} | ${doc.type} | ${doc.title}`);
    }
  }

  if (hasFailure) {
    process.exitCode = 1;
  }
}

main();
