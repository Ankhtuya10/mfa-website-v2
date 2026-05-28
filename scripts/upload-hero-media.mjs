import { readFileSync } from "fs";
import { basename } from "path";

const COUCHDB_URL = "http://127.0.0.1:5984";
const COUCHDB_DATABASE = "anoce_content";
const COUCHDB_USERNAME = "anoce";
const COUCHDB_PASSWORD = "1234";

const AUTH = Buffer.from(`${COUCHDB_USERNAME}:${COUCHDB_PASSWORD}`).toString("base64");
const BASE = `${COUCHDB_URL}/${COUCHDB_DATABASE}`;

function buildCouchId(type, suffix) {
  return `${type}:${type}-${suffix}`;
}

async function putDoc(doc) {
  const res = await fetch(`${BASE}/${encodeURIComponent(doc._id)}`, {
    method: "PUT",
    headers: {
      Authorization: `Basic ${AUTH}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(doc),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`putDoc ${doc._id}: ${res.status} ${body}`);
  }
  return res.json();
}

async function putAttachment(docId, rev, name, data, contentType) {
  const url = `${BASE}/${encodeURIComponent(docId)}/${encodeURIComponent(name)}?rev=${rev}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Basic ${AUTH}`,
      "Content-Type": contentType,
    },
    body: data,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`putAttachment ${name}: ${res.status} ${body}`);
  }
  return res.json();
}

async function uploadFile(filePath, folder, contentType) {
  const fileData = readFileSync(filePath);
  const originalName = basename(filePath);
  const stampedName = `${Date.now()}-${originalName}`;
  const now = new Date().toISOString();
  const docId = buildCouchId("asset", `${folder}-${stampedName}`);

  const doc = {
    _id: docId,
    type: "asset",
    name: stampedName,
    path: `${folder}/${stampedName}`,
    folder,
    content_type: contentType,
    size: fileData.length,
    created_at: now,
    updated_at: now,
  };

  console.log(`Creating doc: ${docId}`);
  const created = await putDoc(doc);

  console.log(`Uploading attachment: ${stampedName}`);
  const attached = await putAttachment(docId, created.rev, stampedName, fileData, contentType);

  const encodedId = encodeURIComponent(docId);
  const encodedName = encodeURIComponent(stampedName);
  const url = `/api/content/assets/${encodedId}/${encodedName}`;

  console.log(`Done: ${url}`);
  return { docId, name: stampedName, url };
}

const imgResult = await uploadFile(
  "/Users/anocea/Documents/background/background.jpg",
  "usage",
  "image/jpeg"
);

const vidResult = await uploadFile(
  "/Users/anocea/Documents/background/video.mp4",
  "usage",
  "video/mp4"
);

console.log("\n=== RESULTS ===");
console.log("IMAGE URL:", imgResult.url);
console.log("VIDEO URL:", vidResult.url);
console.log("\nPaste into lib/usageMedia.ts:");
console.log(`export const USAGE_MEDIA = {
  jennieImage: "${imgResult.url}",
  jennieVideo: "${vidResult.url}",
} as const;`);
