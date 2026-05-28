import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ASSET_FOLDERS } from "@/lib/content/assetFolders";
import { CouchDbClient } from "./client";
import { ContentRepository } from "./repository";

const makeAsset = (index: number, folder: string) => ({
  _id: `asset:${index}`,
  type: "asset" as const,
  name: `${index}.jpg`,
  path: `${folder}/${index}.jpg`,
  folder,
  content_type: "image/jpeg",
  size: 1000,
  created_at: `2026-01-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`,
  updated_at: `2026-01-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`,
});

describe("ContentRepository assets", () => {
  it("does not lose assets after CouchDB's default 25-document find page", async () => {
    const docs = [
      makeAsset(0, ASSET_FOLDERS.background),
      ...Array.from({ length: 24 }, (_, index) =>
        makeAsset(index + 1, ASSET_FOLDERS.general),
      ),
      makeAsset(25, ASSET_FOLDERS.background),
    ];

    const client = {
      find: async (_selector: Record<string, unknown>, options?: { limit?: number }) =>
        docs.slice(0, options?.limit || 25),
    } as unknown as CouchDbClient;

    const assets = await new ContentRepository(client).listAssets(
      ASSET_FOLDERS.background,
    );

    assert.equal(assets.length, 2);
  });
});
