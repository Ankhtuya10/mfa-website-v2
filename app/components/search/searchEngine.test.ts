import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { groupRankedResults } from "./searchEngine";
import type { SearchResultItem } from "./types";

const baseItem = {
  id: "test",
  slug: "test",
  title: "Test",
  subtitle: "",
  image: "/test.jpg",
  href: "/test",
  meta: "",
  searchText: "test",
  tags: [],
} satisfies Omit<SearchResultItem, "category">;

describe("global search grouping", () => {
  it("does not expose a separate brands group", () => {
    const groups = groupRankedResults([
      { ...baseItem, id: "designer", category: "designers" },
      { ...baseItem, id: "brand", category: "brands" },
    ] as unknown as SearchResultItem[]);

    assert.deepEqual(Object.keys(groups).sort(), [
      "articles",
      "collections",
      "designers",
    ]);
    assert.equal(groups.designers.length, 1);
  });
});
