export type CouchFindOptions = {
  sort?: Array<Record<string, "asc" | "desc">>;
  limit?: number;
  fields?: string[];
};

type CouchFindResponse<T> = {
  docs?: T[];
  warning?: string;
};

type CouchWriteResponse = {
  ok: boolean;
  id: string;
  rev: string;
};

export class CouchDbError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "CouchDbError";
    this.status = status;
  }
}

const trimSlashes = (value: string) => value.replace(/\/+$/, "");

export function getCouchConfig() {
  const url = process.env.COUCHDB_URL?.trim() || "http://127.0.0.1:5984";
  const database = process.env.COUCHDB_DATABASE?.trim() || "anoce_content";
  const username = process.env.COUCHDB_USERNAME?.trim();
  const password = process.env.COUCHDB_PASSWORD?.trim();

  return {
    url: trimSlashes(url),
    database,
    username,
    password,
  };
}

export class CouchDbClient {
  private baseUrl: string;
  private database: string;
  private authorization?: string;

  constructor(config = getCouchConfig()) {
    this.baseUrl = config.url;
    this.database = config.database;

    if (config.username && config.password) {
      this.authorization = `Basic ${Buffer.from(`${config.username}:${config.password}`).toString("base64")}`;
    }
  }

  private dbUrl(path = "") {
    const db = encodeURIComponent(this.database);
    return `${this.baseUrl}/${db}${path}`;
  }

  private async doRequest(path: string, init: RequestInit = {}) {
    const headers = new Headers(init.headers);
    if (this.authorization) headers.set("Authorization", this.authorization);
    const url = this.dbUrl(path);
    return fetch(url, { ...init, headers, cache: "no-store" });
  }

  async request(path: string, init: RequestInit = {}) {
    let response = await this.doRequest(path, init);

    // If the database doesn't exist yet, create it + indexes then retry once.
    if (response.status === 404) {
      const text = await response.text().catch(() => "");
      if (text.includes("Database does not exist")) {
        await this.ensureDatabase();
        await this.ensureIndexes();
        response = await this.doRequest(path, init);
      } else {
        // Genuine document-level 404 — surface it normally.
        throw new CouchDbError(text || "Not found", 404);
      }
    }

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new CouchDbError(
        text || `CouchDB request failed with ${response.status}`,
        response.status,
      );
    }

    return response;
  }

  async ensureDatabase() {
    const headers = new Headers();
    if (this.authorization) headers.set("Authorization", this.authorization);

    const response = await fetch(this.dbUrl(), {
      method: "PUT",
      headers,
      cache: "no-store",
    });

    if (response.ok || response.status === 412) return;

    const text = await response.text().catch(() => "");
    throw new CouchDbError(
      text || `Could not create CouchDB database`,
      response.status,
    );
  }

  async getDoc<T>(id: string) {
    const response = await this.request(`/${encodeURIComponent(id)}`);
    return (await response.json()) as T;
  }

  async find<T>(
    selector: Record<string, unknown>,
    options: CouchFindOptions = {},
  ) {
    const response = await this.request("/_find", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        selector,
        sort: options.sort,
        limit: options.limit,
        fields: options.fields,
      }),
    });

    const payload = (await response.json()) as CouchFindResponse<T>;
    return payload.docs || [];
  }

  async putDoc<T extends { _id: string; _rev?: string }>(doc: T) {
    const response = await this.request(`/${encodeURIComponent(doc._id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(doc),
    });

    return (await response.json()) as CouchWriteResponse;
  }

  async deleteDoc(id: string, rev: string) {
    const response = await this.request(
      `/${encodeURIComponent(id)}?rev=${encodeURIComponent(rev)}`,
      {
        method: "DELETE",
      },
    );

    return (await response.json()) as CouchWriteResponse;
  }

  async putAttachment(
    docId: string,
    rev: string,
    attachmentName: string,
    body: BodyInit,
    contentType: string,
  ) {
    const response = await this.request(
      `/${encodeURIComponent(docId)}/${encodeURIComponent(attachmentName)}?rev=${encodeURIComponent(rev)}`,
      {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body,
      },
    );

    return (await response.json()) as CouchWriteResponse;
  }

  async getAttachment(docId: string, attachmentName: string) {
    return this.request(
      `/${encodeURIComponent(docId)}/${encodeURIComponent(attachmentName)}`,
    );
  }

  async ensureIndexes() {
    const indexes = [
      {
        index: { fields: ["type", "slug"] },
        name: "type-slug-json",
        type: "json",
      },
      {
        index: { fields: ["type", "status", "published_at"] },
        name: "article-status-published-json",
        type: "json",
      },
      {
        index: { fields: ["type", "designer_slug", "year"] },
        name: "designer-year-json",
        type: "json",
      },
      {
        index: { fields: ["type", "folder", "created_at"] },
        name: "asset-folder-created-json",
        type: "json",
      },
    ];

    await Promise.all(
      indexes.map((index) =>
        this.request("/_index", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(index),
        }),
      ),
    );
  }
}

export const createCouchDbClient = () => new CouchDbClient();
