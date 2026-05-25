import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { formatAnoceRagContext, type AnoceRagDocumentRow } from "./rag";

describe("Anoce RAG context formatting", () => {
  it("includes image metadata when documents have photo annotations", () => {
    const context = formatAnoceRagContext([
      {
        id: "rag-photo-1",
        type: "look",
        title: "Хаврын look",
        content: "Ноолуур, торго ашигласан хаврын look.",
        brand_slug: null,
        category: "Look тайлбар",
        tags: ["хавар", "ноолуур"],
        source_confidence: "synthetic_demo",
        url: null,
        metadata: {
          images: [
            {
              url: "/demo/archive/look-01.jpg",
              alt: "Ногоон ноолууртай хаврын look",
              caption: "Хаврын коллекцийн ногоон өнгөт look",
              image_type: "look",
              colors: ["ногоон"],
              visible_items: ["пальто", "өмд"],
              materials: ["ноолуур"],
              style_keywords: ["минимал"],
            },
          ],
        },
      } satisfies AnoceRagDocumentRow,
    ]);

    assert.match(context, /Зургийн мэдээлэл:/);
    assert.match(context, /\/demo\/archive\/look-01\.jpg/);
    assert.match(context, /Ногоон ноолууртай хаврын look/);
    assert.match(context, /өнгө=ногоон/);
    assert.match(context, /харагдах_эдлэл=пальто, өмд/);
  });

  it("does not expose English field labels to the chatbot prompt", () => {
    const context = formatAnoceRagContext([
      {
        id: "rag-mn-1",
        type: "material_guide",
        title: "Ноолуур",
        content: "Ноолуур нь өвлийн хувцсанд тохиромжтой материал.",
        brand_slug: null,
        category: "Материал",
        tags: ["ноолуур"],
        source_confidence: "synthetic_demo",
        url: null,
        metadata: null,
      } satisfies AnoceRagDocumentRow,
    ]);

    assert.doesNotMatch(context, /Document ID|Type:|Source confidence|Brand slug|Category:|Tags:/);
    assert.match(context, /Төрөл:/);
    assert.match(context, /Түлхүүр үг:/);
  });

  it("removes English-heavy source text before sending context to the model", () => {
    const context = formatAnoceRagContext([
      {
        id: "rag-en-1",
        type: "archive_collection",
        title: "Nomadic Bloom",
        content:
          "Type: Archive collection\nDescription: Nomadic Bloom follows the short spring of the Mongolian steppe.\nТайлбар: Монгол хаврын өнгө, ноолуурын давхарлалтай цуглуулга.",
        brand_slug: null,
        category: "collection-ss",
        tags: ["collection", "хавар"],
        source_confidence: "high",
        url: "/archive/nomadic-bloom",
        metadata: null,
      } satisfies AnoceRagDocumentRow,
    ]);

    assert.doesNotMatch(context, /Archive collection|Nomadic Bloom follows|Nomadic Bloom/);
    assert.match(context, /Архивын бичлэг/);
    assert.match(context, /Монгол хаврын өнгө/);
  });
});
