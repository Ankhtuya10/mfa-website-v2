import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ASSET_FOLDERS,
  ASSET_FOLDER_OPTIONS,
  normalizeAssetFolder,
} from "./assetFolders";

describe("asset folder taxonomy", () => {
  it("uses purpose-based folders for media organization", () => {
    assert.deepEqual(
      ASSET_FOLDER_OPTIONS.map((option) => option.value),
      [
        "background",
        "editorial",
        "collection",
        "designer",
        "general",
      ],
    );
  });

  it("normalizes legacy upload folders into the new taxonomy", () => {
    assert.equal(normalizeAssetFolder("usage"), ASSET_FOLDERS.background);
    assert.equal(normalizeAssetFolder("articles"), ASSET_FOLDERS.editorial);
    assert.equal(normalizeAssetFolder("collections"), ASSET_FOLDERS.collection);
    assert.equal(normalizeAssetFolder("designers"), ASSET_FOLDERS.designer);
    assert.equal(normalizeAssetFolder("assets"), ASSET_FOLDERS.general);
  });

  it("falls back to general for empty or unknown folders", () => {
    assert.equal(normalizeAssetFolder(""), ASSET_FOLDERS.general);
    assert.equal(normalizeAssetFolder("random"), ASSET_FOLDERS.general);
    assert.equal(normalizeAssetFolder(null), ASSET_FOLDERS.general);
  });
});
