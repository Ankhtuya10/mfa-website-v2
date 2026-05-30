import { MongoClient, Db, Collection } from "mongodb";
import { createAdminClient } from "@/lib/supabase/admin";

type StringIdDoc = { _id: string } & Record<string, unknown>;

const STORAGE_BUCKET = "anoce-assets";

const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

export function getMongoConfig() {
  const uri = process.env.MONGODB_URI?.trim() ?? "";
  const database = process.env.MONGODB_DATABASE?.trim() ?? "anoce_content";
  if (!uri) throw new Error("MONGODB_URI is not set");
  return { uri, database };
}

function createClient(uri: string): Promise<MongoClient> {
  const client = new MongoClient(uri, {
    maxPoolSize: 1,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
    socketTimeoutMS: 20000,
  });
  return client.connect();
}

async function getDb(): Promise<Db> {
  const { uri, database } = getMongoConfig();
  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = createClient(uri).catch((err) => {
      globalWithMongo._mongoClientPromise = undefined;
      throw err;
    });
  }
  try {
    const client = await globalWithMongo._mongoClientPromise;
    return client.db(database);
  } catch (err) {
    globalWithMongo._mongoClientPromise = undefined;
    throw err;
  }
}

function col(db: Db): Collection<StringIdDoc> {
  return db.collection<StringIdDoc>("content");
}

export class CouchDbError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "CouchDbError";
    this.status = status;
  }
}

export class CouchDbClient {
  async getDoc<T>(id: string): Promise<T> {
    const db = await getDb();
    const doc = await col(db).findOne({ _id: id });
    if (!doc) throw new CouchDbError("Not found", 404);
    return doc as unknown as T;
  }

  async find<T>(selector: Record<string, unknown>, options: { limit?: number } = {}): Promise<T[]> {
    const db = await getDb();
    let cursor = col(db).find(selector);
    if (options.limit) cursor = cursor.limit(options.limit);
    return (await cursor.toArray()) as unknown as T[];
  }

  async putDoc<T extends { _id: string; _rev?: string }>(doc: T): Promise<{ ok: boolean; id: string; rev: string }> {
    const db = await getDb();
    const { _rev, ...rest } = doc as Record<string, unknown>;
    void _rev;
    await col(db).replaceOne({ _id: doc._id }, rest as StringIdDoc, { upsert: true });
    return { ok: true, id: doc._id, rev: "" };
  }

  async deleteDoc(id: string, _rev?: string): Promise<{ ok: boolean; id: string; rev: string }> {
    const db = await getDb();
    await col(db).deleteOne({ _id: id });
    return { ok: true, id, rev: "" };
  }

  async putAttachment(
    docId: string,
    _rev: string,
    attachmentName: string,
    body: BodyInit,
    contentType: string,
  ): Promise<{ ok: boolean; id: string; rev: string }> {
    const supabase = createAdminClient();
    const arrayBuffer = body instanceof ArrayBuffer ? body : await new Response(body).arrayBuffer();
    const path = `${docId}/${attachmentName}`;
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, arrayBuffer, { contentType, upsert: true });
    if (error) throw new CouchDbError(error.message, 500);
    return { ok: true, id: docId, rev: "" };
  }

  async getAttachment(docId: string, attachmentName: string, init: RequestInit = {}): Promise<Response> {
    const supabase = createAdminClient();
    const path = `${docId}/${attachmentName}`;
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    const rangeHeader = (init.headers as Record<string, string> | undefined)?.["Range"];
    return fetch(data.publicUrl, {
      headers: rangeHeader ? { Range: rangeHeader } : {},
    });
  }

  async ensureDatabase(): Promise<void> {
    const db = await getDb();
    const collections = await db.listCollections({ name: "content" }).toArray();
    if (collections.length === 0) {
      await db.createCollection("content");
    }
    const supabase = createAdminClient();
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find((b) => b.name === STORAGE_BUCKET)) {
      await supabase.storage.createBucket(STORAGE_BUCKET, { public: true });
    }
  }

  async ensureIndexes(): Promise<void> {
    const db = await getDb();
    await Promise.all([
      col(db).createIndex({ type: 1, slug: 1 }),
      col(db).createIndex({ type: 1, status: 1, published_at: 1 }),
      col(db).createIndex({ type: 1, designer_slug: 1, year: 1 }),
      col(db).createIndex({ type: 1, folder: 1, created_at: 1 }),
    ]);
  }
}

export const createCouchDbClient = () => new CouchDbClient();
