import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildAnoceChatPromptMn } from "./anoce-prompt.mn";

describe("Anoce Mongolian chat prompt", () => {
  it("uses Mongolian source headers instead of English section names", () => {
    const prompt = buildAnoceChatPromptMn(
      "Ноолуурын талаар хэл",
      "Шууд архивын баримт",
      "Мэдлэгийн сангийн баримт",
    );

    assert.doesNotMatch(prompt, /LIVE ARCHIVE|BRAND KNOWLEDGE|MONGOLIAN BRAND/i);
    assert.match(prompt, /ANOCE ШУУД АРХИВ/);
    assert.match(prompt, /МОНГОЛ ЗАГВАРЫН МЭДЛЭГИЙН САН/);
  });
});
