/**
 * Migrates all data from local CouchDB → MongoDB Atlas + Supabase Storage
 * Run: node scripts/migrate-couch-to-mongo.mjs
 */

import { MongoClient } from "mongodb";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local
const envPath = resolve(__dirname, "../.env.local");
const env = Object.fromEntries(
  readFileSync(envPath, "utf-8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    }),
);

const COUCH_URL = env.COUCHDB_URL || "http://127.0.0.1:5984";
const COUCH_DB = env.COUCHDB_DATABASE || "anoce_content";
const COUCH_USER = env.COUCHDB_USERNAME || "anoce";
const COUCH_PASS = env.COUCHDB_PASSWORD || "1234";
const MONGO_URI = env.MONGODB_URI;
const MONGO_DB = env.MONGODB_DATABASE || "anoce_content";
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const STORAGE_BUCKET = "anoce-assets";

if (!MONGO_URI) throw new Error("MONGODB_URI missing from .env.local");
if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Supabase env vars missing from .env.local");

const couchBase = `${COUCH_URL}/${COUCH_DB}`;
const couchAuth = `Basic ${Buffer.from(`${COUCH_USER}:${COUCH_PASS}`).toString("base64")}`;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function couchFetch(path, opts = {}) {
  const res = await fetch(`${couchBase}${path}`, {
    ...opts,
    headers: { Authorization: couchAuth, ...(opts.headers || {}) },
  });
  if (!res.ok) throw new Error(`CouchDB ${path} → ${res.status}`);
  return res;
}

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.find((b) => b.name === STORAGE_BUCKET)) {
    const { error } = await supabase.storage.createBucket(STORAGE_BUCKET, { public: true });
    if (error) throw new Error(`Create bucket failed: ${error.message}`);
    console.log(`  ✓ Created Supabase bucket: ${STORAGE_BUCKET}`);
  } else {
    console.log(`  ✓ Supabase bucket exists: ${STORAGE_BUCKET}`);
  }
}

async function migrateAttachment(docId, attachmentName, contentType) {
  const res = await couchFetch(`/${encodeURIComponent(docId)}/${encodeURIComponent(attachmentName)}`);
  const buffer = await res.arrayBuffer();
  const path = `${docId}/${attachmentName}`;
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, buffer, { contentType, upsert: true });
  if (error) throw new Error(`Storage upload failed for ${path}: ${error.message}`);
  return path;
}

async function run() {
  console.log("\n🔄 CouchDB → MongoDB + Supabase migration\n");

  // 1. Ensure Supabase bucket
  console.log("Step 1: Supabase Storage bucket");
  await ensureBucket();

  // 2. Fetch all CouchDB docs
  console.log("\nStep 2: Fetching CouchDB docs...");
  const res = await couchFetch("/_all_docs?include_docs=true");
  const { rows } = await res.json();
  const docs = rows.map((r) => r.doc).filter((d) => !d._id.startsWith("_design/"));
  console.log(`  Found ${docs.length} documents`);

  // 3. Connect MongoDB
  console.log("\nStep 3: Connecting to MongoDB Atlas...");
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const col = client.db(MONGO_DB).collection("content");
  console.log("  ✓ Connected");

  // 4. Migrate docs
  console.log("\nStep 4: Migrating documents...\n");
  let ok = 0;
  let skipped = 0;
  let errors = 0;

  for (const doc of docs) {
    try {
      const { _rev, _attachments, ...rest } = doc;
      void _rev;

      // Upload attachments to Supabase Storage
      if (_attachments) {
        for (const [name, meta] of Object.entries(_attachments)) {
          process.stdout.write(`  [asset] ${doc._id} / ${name} ... `);
          await migrateAttachment(doc._id, name, meta.content_type);
          console.log("✓");
        }
      } else {
        console.log(`  [${rest.type || "doc"}] ${rest._id}`);
      }

      // Upsert into MongoDB
      await col.replaceOne({ _id: doc._id }, { ...rest }, { upsert: true });
      ok++;
    } catch (err) {
      console.error(`  ✗ ERROR: ${doc._id} — ${err.message}`);
      errors++;
    }
  }

  await client.close();

  console.log(`\n✅ Done — ${ok} migrated, ${skipped} skipped, ${errors} errors`);
  if (errors > 0) process.exit(1);
}

run().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
