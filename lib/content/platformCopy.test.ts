import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  SEARCH_CONTENT_FILTER_LABEL,
  SEARCH_PLACEHOLDER,
} from "./platformCopy";

describe("platform copy", () => {
  it("uses professional fashion wording in the search placeholder", () => {
    assert.equal(
      SEARCH_PLACEHOLDER,
      "Ноолуур, FW2025, ногоон сүлжмэл look, Gobi гэж хайх...",
    );
    assert.doesNotMatch(SEARCH_PLACEHOLDER, /green knit/i);
    assert.doesNotMatch(SEARCH_PLACEHOLDER, /ногоон ноос/i);
  });

  it("labels search result type filters naturally", () => {
    assert.equal(SEARCH_CONTENT_FILTER_LABEL, "Үр дүн");
  });
});
