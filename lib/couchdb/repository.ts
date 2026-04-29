import {
  type ContentDocType,
  type ContentDocument,
  type CouchArticleDoc,
  type CouchAssetDoc,
  type CouchCollectionDoc,
  type CouchDesignerDoc,
  buildCouchId,
  fromCouchArticle,
  fromCouchAsset,
  fromCouchCollection,
  fromCouchDesigner,
  slugify,
  toCouchArticle,
  toCouchCollection,
  toCouchDesigner,
} from "./content";
import { CouchDbClient, CouchDbError, createCouchDbClient } from "./client";

type ArticleFilters = {
  category?: string;
  status?: string;
};

type CollectionFilters = {
  season?: string;
  designerSlug?: string;
};

const isNotFound = (error: unknown) =>
  error instanceof CouchDbError && error.status === 404;

const byName = <T extends { name?: string; title?: string }>(left: T, right: T) =>
  String(left.name || left.title || "").localeCompare(String(right.name || right.title || ""));

const byUpdatedDesc = <T extends { updated_at?: string; created_at?: string }>(left: T, right: T) =>
  new Date(right.updated_at || right.created_at || 0).getTime() -
  new Date(left.updated_at || left.created_at || 0).getTime();

const byPublishedDesc = <T extends { published_at?: string | null; created_at?: string }>(
  left: T,
  right: T,
) =>
  new Date(right.published_at || right.created_at || 0).getTime() -
  new Date(left.published_at || left.created_at || 0).getTime();

const byCollectionDateDesc = <T extends { year?: number; season?: string }>(left: T, right: T) => {
  if ((right.year || 0) !== (left.year || 0)) return (right.year || 0) - (left.year || 0);
  return String(right.season || "").localeCompare(String(left.season || ""));
};

export class ContentRepository {
  constructor(private readonly client: CouchDbClient = createCouchDbClient()) {}

  private async getDoc<T>(id: string) {
    try {
      return await this.client.getDoc<T>(decodeURIComponent(id));
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  }

  private async findOne<T extends ContentDocument>(
    type: ContentDocType,
    selector: Record<string, unknown>,
  ) {
    const docs = await this.client.find<T>({ type, ...selector }, { limit: 1 });
    return docs[0] || null;
  }

  private async findByType<T extends ContentDocument>(type: ContentDocType) {
    return this.client.find<T>({ type });
  }

  private async preserveRevision<T extends ContentDocument>(doc: T) {
    const existing =
      (await this.getDoc<T>(doc._id)) ||
      (("slug" in doc && typeof doc.slug === "string")
        ? await this.findOne<T>(doc.type, { slug: doc.slug })
        : null);

    if (!existing) return doc;

    return {
      ...doc,
      _id: existing._id,
      _rev: existing._rev,
      created_at: existing.created_at || doc.created_at,
      updated_at: new Date().toISOString(),
    };
  }

  async ensureReady() {
    await this.client.ensureDatabase();
    await this.client.ensureIndexes();
  }

  async getDesigners(tier?: string) {
    const docs = await this.findByType<CouchDesignerDoc>("designer");
    return docs
      .filter((doc) => !tier || tier === "all" || doc.tier === tier)
      .sort(byName)
      .map(fromCouchDesigner);
  }

  async getDesignerBySlug(slug: string) {
    const doc = await this.findOne<CouchDesignerDoc>("designer", { slug });
    return doc ? fromCouchDesigner(doc) : null;
  }

  async getDesignerById(id: string) {
    const doc = await this.getDoc<CouchDesignerDoc>(id);
    return doc ? fromCouchDesigner(doc) : null;
  }

  async upsertDesigner(input: Record<string, unknown>) {
    const doc = await this.preserveRevision(toCouchDesigner(input));
    const result = await this.client.putDoc(doc);
    return fromCouchDesigner({ ...doc, _rev: result.rev });
  }

  async deleteDesigner(id: string) {
    const doc = await this.getDoc<CouchDesignerDoc>(id);
    if (!doc?._rev) return false;
    await this.client.deleteDoc(doc._id, doc._rev);
    return true;
  }

  async getCollections(filters: CollectionFilters = {}) {
    const docs = await this.findByType<CouchCollectionDoc>("collection");
    return docs
      .filter((doc) => {
        const seasonMatch =
          !filters.season || doc.season.toLowerCase() === filters.season.toLowerCase();
        const designerMatch = !filters.designerSlug || doc.designer_slug === filters.designerSlug;
        return seasonMatch && designerMatch;
      })
      .sort(byCollectionDateDesc)
      .map(fromCouchCollection);
  }

  async getCollectionBySlug(slug: string) {
    const doc = await this.findOne<CouchCollectionDoc>("collection", { slug });
    return doc ? fromCouchCollection(doc) : null;
  }

  async getCollectionById(id: string) {
    const doc = await this.getDoc<CouchCollectionDoc>(id);
    return doc ? fromCouchCollection(doc) : null;
  }

  async upsertCollection(input: Record<string, unknown>) {
    const doc = await this.preserveRevision(toCouchCollection(input));
    const result = await this.client.putDoc(doc);
    return fromCouchCollection({ ...doc, _rev: result.rev });
  }

  async deleteCollection(id: string) {
    const doc = await this.getDoc<CouchCollectionDoc>(id);
    if (!doc?._rev) return false;
    await this.client.deleteDoc(doc._id, doc._rev);
    return true;
  }

  async getArticles(filters: ArticleFilters = {}) {
    const docs = await this.findByType<CouchArticleDoc>("article");
    return docs
      .filter((doc) => {
        const status = filters.status || "published";
        const statusMatch = status === "all" || doc.status === status;
        const categoryMatch =
          !filters.category || filters.category === "all" || doc.category === filters.category;
        return statusMatch && categoryMatch;
      })
      .sort((left, right) =>
        filters.status === "all" ? byUpdatedDesc(left, right) : byPublishedDesc(left, right),
      )
      .map(fromCouchArticle);
  }

  async getArticleBySlug(slug: string, options: { includeDrafts?: boolean } = {}) {
    const doc = await this.findOne<CouchArticleDoc>("article", { slug });
    if (!doc || (!options.includeDrafts && doc.status !== "published")) return null;
    return fromCouchArticle(doc);
  }

  async getArticleById(id: string) {
    const doc = await this.getDoc<CouchArticleDoc>(id);
    return doc ? fromCouchArticle(doc) : null;
  }

  async upsertArticle(input: Record<string, unknown>) {
    const doc = await this.preserveRevision(toCouchArticle(input));
    const result = await this.client.putDoc(doc);
    return fromCouchArticle({ ...doc, _rev: result.rev });
  }

  async deleteArticle(id: string) {
    const doc = await this.getDoc<CouchArticleDoc>(id);
    if (!doc?._rev) return false;
    await this.client.deleteDoc(doc._id, doc._rev);
    return true;
  }

  async listAssets(folder?: string) {
    const docs = await this.findByType<CouchAssetDoc>("asset");
    return docs
      .filter((doc) => !folder || doc.folder === folder)
      .sort(byUpdatedDesc)
      .map(fromCouchAsset);
  }

  async createAsset(file: File, folder = "assets") {
    const cleanFolder = slugify(folder) || "assets";
    const safeName = file.name.replace(/[^\w.\- ]+/g, "-").replace(/\s+/g, " ").trim();
    const stampedName = `${Date.now()}-${safeName || "asset"}`;
    const now = new Date().toISOString();
    const doc: CouchAssetDoc = {
      _id: buildCouchId("asset", `${cleanFolder}-${stampedName}`),
      type: "asset",
      name: stampedName,
      path: `${cleanFolder}/${stampedName}`,
      folder: cleanFolder,
      content_type: file.type || "application/octet-stream",
      size: file.size,
      created_at: now,
      updated_at: now,
    };

    const created = await this.client.putDoc(doc);
    const attachment = await this.client.putAttachment(
      doc._id,
      created.rev,
      doc.name,
      await file.arrayBuffer(),
      doc.content_type,
    );

    return fromCouchAsset({ ...doc, _rev: attachment.rev });
  }

  async getAssetAttachment(id: string, name: string) {
    return this.client.getAttachment(decodeURIComponent(id), decodeURIComponent(name));
  }
}

export const createContentRepository = () => new ContentRepository();
