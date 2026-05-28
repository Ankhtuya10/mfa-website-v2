import {
  type ContentDocType,
  type ContentDocument,
  type CouchArticleDoc,
  type CouchAssetDoc,
  type CouchCollectionDoc,
  type CouchDesignerDoc,
  type FeaturedSlot,
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
import { ASSET_FOLDERS, normalizeAssetFolder } from "@/lib/content/assetFolders";

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

const CONTENT_LIST_LIMIT = 1000;

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
    return this.client.find<T>({ type }, { limit: CONTENT_LIST_LIMIT });
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
    const normalizedFolder = folder ? normalizeAssetFolder(folder) : undefined;
    const docs = await this.findByType<CouchAssetDoc>("asset");
    return docs
      .filter((doc) => !normalizedFolder || normalizeAssetFolder(doc.folder) === normalizedFolder)
      .sort(byUpdatedDesc)
      .map(fromCouchAsset);
  }

  async createAsset(file: File, folder: string = ASSET_FOLDERS.general) {
    const cleanFolder = normalizeAssetFolder(folder);
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

  async deleteAsset(id: string) {
    const doc = await this.getDoc<CouchAssetDoc>(id);
    if (!doc?._rev) return false;
    await this.client.deleteDoc(doc._id, doc._rev);
    return true;
  }

  async updateAssetFeatured(id: string, slot: FeaturedSlot | null) {
    const allDocs = await this.findByType<CouchAssetDoc>("asset");
    const now = new Date().toISOString();

    // clear previous occupant of this slot
    if (slot !== null) {
      for (const doc of allDocs) {
        if (doc.featured === slot && doc._id !== id) {
          await this.client.putDoc({ ...doc, featured: null, updated_at: now });
        }
      }
    }

    const target = allDocs.find((d) => d._id === id);
    if (!target) throw new Error(`Asset not found: ${id}`);

    const updated = await this.client.putDoc({ ...target, featured: slot, updated_at: now });
    return fromCouchAsset({ ...target, featured: slot ?? undefined, _rev: updated.rev });
  }

  async getFeaturedMedia() {
    const docs = await this.findByType<CouchAssetDoc>("asset");
    const result: Partial<Record<FeaturedSlot, ReturnType<typeof fromCouchAsset>>> = {};
    for (const doc of docs) {
      if (doc.featured) result[doc.featured] = fromCouchAsset(doc);
    }
    return result;
  }

  async getAssetAttachment(id: string, name: string, init: RequestInit = {}) {
    return this.client.getAttachment(
      decodeURIComponent(id),
      decodeURIComponent(name),
      init,
    );
  }

  async getFeaturedDiscover() {
    const settings = await this.getDoc<{
      _id: string; _rev?: string; type: string; featured_id: string; featured_type: "collection" | "article";
    }>("settings:featured-discover").catch(() => null);

    if (!settings) return null;

    if (settings.featured_type === "collection") {
      const col = await this.getDoc<CouchCollectionDoc>(settings.featured_id).catch(() => null);
      if (!col) return null;
      return {
        type: "collection" as const,
        id: col._id,
        title: col.title,
        description: col.description || "",
        season: col.season,
        year: col.year,
        slug: col.slug,
        designer_name: col.designer_name,
      };
    } else {
      const article = await this.getDoc<CouchArticleDoc>(settings.featured_id).catch(() => null);
      if (!article) return null;
      return {
        type: "article" as const,
        id: article._id,
        title: article.title,
        description: article.subtitle || (typeof article.body === "string" ? article.body.slice(0, 220) : "") || "",
        slug: article.slug,
        season: null,
        year: null,
      };
    }
  }

  async setFeaturedDiscover(
    id: string,
    type: "collection" | "article",
    opts: { heroVideoId?: string | null; discoverVideoId?: string | null; discoverImageId?: string | null } = {},
  ) {
    // 1. Persist settings doc
    const existing = await this.getDoc<{ _id: string; _rev?: string }>("settings:featured-discover").catch(() => null);
    await this.client.putDoc({
      _id: "settings:featured-discover",
      ...(existing?._rev ? { _rev: existing._rev } : {}),
      type: "settings",
      key: "featured-discover",
      featured_id: id,
      featured_type: type,
      updated_at: new Date().toISOString(),
    });

    // 2. Set hero_image from cover_image of the content
    const content = type === "collection"
      ? await this.getDoc<CouchCollectionDoc>(id).catch(() => null)
      : await this.getDoc<CouchArticleDoc>(id).catch(() => null);

    const coverUrl: string | null | undefined =
      content && "cover_image" in content ? (content as { cover_image?: string | null }).cover_image : null;

    if (coverUrl) {
      // URL: /api/content/assets/{encodedId}/{encodedName}
      const parts = coverUrl.split("/");
      if (parts[3] === "assets" && parts[4]) {
        const assetId = decodeURIComponent(parts[4]);
        await this.updateAssetFeatured(assetId, "hero_image").catch(() => {});
      }
    }

    // 3. Optionally set hero_video
    if (opts.heroVideoId) {
      await this.updateAssetFeatured(opts.heroVideoId, "hero_video").catch(() => {});
    }

    // 4. Optionally set discover_video
    if (opts.discoverVideoId) {
      await this.updateAssetFeatured(opts.discoverVideoId, "discover_video").catch(() => {});
    }

    // 5. Optionally set discover_image
    if (opts.discoverImageId) {
      await this.updateAssetFeatured(opts.discoverImageId, "discover_image").catch(() => {});
    }
  }

  async getHeroQuotes(): Promise<{ text: string; author: string }[]> {
    const doc = await this.getDoc<{
      _id: string; _rev?: string; type: string; quotes: { text: string; author: string }[];
    }>("settings:hero-quotes").catch(() => null);
    return doc?.quotes ?? [];
  }

  async setHeroQuotes(quotes: { text: string; author: string }[]) {
    const existing = await this.getDoc<{ _id: string; _rev?: string }>("settings:hero-quotes").catch(() => null);
    await this.client.putDoc({
      _id: "settings:hero-quotes",
      ...(existing?._rev ? { _rev: existing._rev } : {}),
      type: "settings",
      key: "hero-quotes",
      quotes,
      updated_at: new Date().toISOString(),
    });
  }
}

export const createContentRepository = () => new ContentRepository();
