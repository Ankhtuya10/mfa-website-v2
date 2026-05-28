import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ARCHIVE_CATEGORY_OPTIONS,
  ARCHIVE_COLOR_OPTIONS,
  ARCHIVE_MATERIAL_OPTIONS,
  ARCHIVE_OCCASION_OPTIONS,
  ARCHIVE_SEASON_OPTIONS,
  deriveArchiveValues,
  mergeArchiveValues,
} from "./archiveTaxonomy";

describe("archive taxonomy", () => {
  it("includes broader real-world archive filters for admin and public archive", () => {
    assert.ok(
      ARCHIVE_CATEGORY_OPTIONS.some((option) => option.label === "Streetwear"),
    );
    assert.ok(
      ARCHIVE_CATEGORY_OPTIONS.some((option) => option.label === "Спорт хувцас"),
    );
    assert.ok(
      ARCHIVE_MATERIAL_OPTIONS.some((option) => option.label === "Mesh"),
    );
    assert.ok(
      ARCHIVE_COLOR_OPTIONS.some((option) => option.label === "Ягаан"),
    );
    assert.ok(
      ARCHIVE_OCCASION_OPTIONS.some((option) => option.label === "Office"),
    );
    assert.deepEqual(
      ARCHIVE_SEASON_OPTIONS.map((option) => option.value),
      ["SS", "FW", "Pre-Fall", "Resort"],
    );
  });

  it("derives taxonomy values from explicit collection fields and legacy text", () => {
    const values = deriveArchiveValues({
      categories: ["Streetwear"],
      materials: ["Mesh"],
      colors: ["Ягаан"],
      occasions: ["Sport"],
      description: "A tailored sport outfit in cotton fleece.",
      looks: [
        {
          tags: ["sneaker", "outerwear"],
          materials: ["denim"],
        },
      ],
    });

    assert.deepEqual(values.categories.sort(), [
      "Denim",
      "Streetwear",
      "Гадуур хувцас",
      "Гутал",
      "Оёдол/костюм",
      "Спорт хувцас",
    ]);
    assert.deepEqual(values.materials.sort(), [
      "Denim",
      "Fleece",
      "Mesh",
      "Хөвөн",
    ]);
    assert.deepEqual(values.colors, ["Ягаан"]);
    assert.deepEqual(values.occasions, ["Sport"]);
  });

  it("merges taxonomy values without duplicates", () => {
    assert.deepEqual(
      mergeArchiveValues(["Streetwear", "streetwear", "Спорт хувцас"], [
        "Streetwear",
      ]),
      ["Streetwear", "Спорт хувцас"],
    );
  });
});
