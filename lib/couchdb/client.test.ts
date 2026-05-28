import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { CouchDbClient } from "./client";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("CouchDB client", () => {
  it("forwards range headers when fetching attachments", async () => {
    let capturedRange: string | null = null;

    globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      capturedRange = new Headers(init?.headers).get("Range");
      return new Response("chunk", {
        status: 206,
        headers: {
          "Content-Type": "video/mp4",
          "Content-Range": "bytes 0-4/10",
        },
      });
    }) as typeof fetch;

    const client = new CouchDbClient({
      url: "http://127.0.0.1:5984",
      database: "anoce_content",
      username: undefined,
      password: undefined,
    });

    await client.getAttachment("asset:video", "video.mp4", {
      headers: { Range: "bytes=0-4" },
    });

    assert.equal(capturedRange, "bytes=0-4");
  });
});
