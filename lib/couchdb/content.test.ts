import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildCouchId,
  fromCouchArticle,
  fromCouchCollection,
  getAssetUrl,
  toCouchArticle,
  toCouchCollection,
} from "./content";

describe("CouchDB content mapping", () => {
  it("round-trips article fields used by editorial pages", () => {
    const doc = toCouchArticle({
      title: "Quiet Revolution",
      subtitle: "Cashmere story",
      body: "Body",
      category: "features",
      tags: ["cashmere"],
      designer_slug: "gobi",
      status: "published",
      cover_image: "/image.jpg",
      read_time: 7,
      author_name: "Editor",
      published_at: "2026-04-30T00:00:00.000Z",
    });

    assert.equal(doc._id, "article:quiet-revolution");
    assert.equal(doc.type, "article");
    assert.equal(doc.slug, "quiet-revolution");
    assert.equal(doc.author_name, "Editor");

    const article = fromCouchArticle(doc);
    assert.equal(article.slug, "quiet-revolution");
    assert.equal(article.coverImage, "/image.jpg");
    assert.equal(article.author, "Editor");
    assert.equal(article.readTime, 7);
  });

  it("round-trips collection fields and nested looks", () => {
    const doc = toCouchCollection({
      title: "Gobi FW 2026",
      designer_name: "Gobi",
      designer_slug: "gobi",
      season: "FW",
      year: 2026,
      description: "Collection",
      cover_image: "/cover.jpg",
      looks: [
        {
          id: "look-one",
          number: 1,
          image: "/look.jpg",
          description: "Coat",
          materials: ["cashmere"],
          tags: ["outerwear"],
        },
      ],
    });

    assert.equal(doc._id, "collection:gobi-fw-2026");
    assert.equal(doc.type, "collection");

    const collection = fromCouchCollection(doc);
    assert.equal(collection.slug, "gobi-fw-2026");
    assert.equal(collection.designer_name, "Gobi");
    assert.equal(collection.looks[0].materials[0], "cashmere");
  });

  it("builds stable IDs and attachment URLs", () => {
    assert.equal(buildCouchId("designer", "Gobi Cashmere"), "designer:gobi-cashmere");
    assert.equal(
      getAssetUrl({ _id: "asset:abc123", name: "cover image.jpg" }),
      "/api/content/assets/asset%3Aabc123/cover%20image.jpg",
    );
  });
});
