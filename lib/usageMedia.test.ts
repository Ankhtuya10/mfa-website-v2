import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { USAGE_MEDIA } from "./usageMedia";

describe("usage media assets", () => {
  it("serves homepage media from CouchDB asset routes", () => {
    assert.match(USAGE_MEDIA.jennieImage, /^\/api\/content\/assets\//);
    assert.match(USAGE_MEDIA.jennieVideo, /^\/api\/content\/assets\//);
    assert.match(USAGE_MEDIA.jennieVideo, /jenniebg\.mp4$/);
    assert.doesNotMatch(USAGE_MEDIA.jennieImage, /supabase\.co/);
    assert.doesNotMatch(USAGE_MEDIA.jennieVideo, /supabase\.co/);
  });
});
