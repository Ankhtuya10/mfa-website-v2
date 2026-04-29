import type { Article, Collection, Designer, Look } from "@/lib/types";

export type ContentDocType = "article" | "collection" | "designer" | "asset";

export type CouchBaseDoc = {
  _id: string;
  _rev?: string;
  type: ContentDocType;
  created_at?: string;
  updated_at?: string;
};

export type CouchDesignerDoc = CouchBaseDoc & {
  type: "designer";
  slug: string;
  name: string;
  brand?: string;
  tier: "high-end" | "contemporary" | "emerging";
  bio?: string;
  short_bio?: string;
  profile_image?: string;
  cover_image?: string;
  founded?: number;
  active_seasons?: number;
  nationality?: string;
  social_links?: { instagram?: string; website?: string };
};

export type CouchLookDoc = {
  id: string;
  number: number;
  image: string;
  description: string;
  materials: string[];
  tags: string[];
};

export type CouchCollectionDoc = CouchBaseDoc & {
  type: "collection";
  slug: string;
  title: string;
  designer_id?: string;
  designer_name: string;
  designer_slug: string;
  season: string;
  year: number;
  description?: string;
  cover_image?: string;
  looks: CouchLookDoc[];
};

export type CouchArticleDoc = CouchBaseDoc & {
  type: "article";
  slug: string;
  title: string;
  subtitle?: string;
  category: "features" | "interviews" | "news" | "trends";
  author_id?: string | null;
  author_name: string;
  cover_image?: string | null;
  cover_image_vertical?: string | null;
  body?: string;
  status: "draft" | "review" | "published";
  designer_slug?: string | null;
  tags: string[];
  read_time: number;
  published_at?: string | null;
  credits?: {
    photographer?: string;
    stylist?: string;
    model?: string;
    creativeDirector?: string;
    location?: string;
    date?: string;
    equipment?: string;
  };
  related_looks?: Array<{
    lookId: string;
    lookNumber: number;
    image: string;
    collectionSlug: string;
    collectionName: string;
  }>;
};

export type CouchAssetDoc = CouchBaseDoc & {
  type: "asset";
  name: string;
  path: string;
  folder: string;
  content_type: string;
  size: number;
};

export type ContentDocument =
  | CouchArticleDoc
  | CouchCollectionDoc
  | CouchDesignerDoc
  | CouchAssetDoc;

export const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const buildCouchId = (type: ContentDocType, value: string) =>
  `${type}:${slugify(value) || Date.now()}`;

const nowIso = () => new Date().toISOString();

const resolveDocId = (
  type: ContentDocType,
  rawId: unknown,
  stableValue: string,
) => {
  if (typeof rawId === "string" && rawId.startsWith(`${type}:`)) return rawId;
  return buildCouchId(type, stableValue);
};

const toArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

export const toCouchDesigner = (
  input: Partial<Designer> & Record<string, unknown>,
): CouchDesignerDoc => {
  const slug = String(input.slug || slugify(String(input.name || "")));

  return {
    _id: resolveDocId("designer", input.id, slug || String(input.name || "")),
    type: "designer",
    slug,
    name: String(input.name || ""),
    brand: typeof input.brand === "string" ? input.brand : String(input.name || ""),
    tier: (input.tier as CouchDesignerDoc["tier"]) || "emerging",
    bio: String(input.bio || ""),
    short_bio: String(input.short_bio || input.shortBio || ""),
    profile_image: String(input.profile_image || input.profileImage || ""),
    cover_image: String(input.cover_image || input.coverImage || ""),
    founded: Number(input.founded) || undefined,
    active_seasons: Number(input.active_seasons || input.activeSeasons) || undefined,
    nationality: String(input.nationality || "Mongolian"),
    social_links:
      (input.social_links as CouchDesignerDoc["social_links"]) ||
      (input.socialLinks as CouchDesignerDoc["social_links"]) ||
      {},
    created_at: String(input.created_at || nowIso()),
    updated_at: String(input.updated_at || nowIso()),
  };
};

export const fromCouchDesigner = (doc: CouchDesignerDoc) => ({
  id: doc._id,
  _id: doc._id,
  _rev: doc._rev,
  slug: doc.slug,
  name: doc.name,
  brand: doc.brand || doc.name,
  tier: doc.tier,
  bio: doc.bio || "",
  short_bio: doc.short_bio || "",
  shortBio: doc.short_bio || "",
  profile_image: doc.profile_image || "",
  profileImage: doc.profile_image || "",
  cover_image: doc.cover_image || "",
  coverImage: doc.cover_image || "",
  activeSeasons: doc.active_seasons || 0,
  active_seasons: doc.active_seasons || 0,
  nationality: doc.nationality || "Mongolian",
  founded: doc.founded || 0,
  socialLinks: doc.social_links || {},
  created_at: doc.created_at,
  updated_at: doc.updated_at,
});

export const toCouchCollection = (
  input: Partial<Collection> & Record<string, unknown>,
): CouchCollectionDoc => {
  const title = String(input.title || "");
  const slug = String(input.slug || slugify(title));
  const looks = Array.isArray(input.looks) ? input.looks : [];

  return {
    _id: resolveDocId("collection", input.id, slug || title),
    type: "collection",
    slug,
    title,
    designer_id: String(input.designer_id || input.designerId || ""),
    designer_name: String(input.designer_name || input.designerName || ""),
    designer_slug: String(input.designer_slug || input.designerSlug || ""),
    season: String(input.season || "SS"),
    year: Number(input.year) || new Date().getFullYear(),
    description: String(input.description || ""),
    cover_image: String(input.cover_image || input.coverImage || ""),
    looks: looks.map((look, index) => {
      const item = look as Partial<Look> & Record<string, unknown>;
      return {
        id: String(item.id || `${slug}-look-${index + 1}`),
        number: Number(item.number) || index + 1,
        image: String(item.image || ""),
        description: String(item.description || ""),
        materials: toArray(item.materials),
        tags: toArray(item.tags),
      };
    }),
    created_at: String(input.created_at || nowIso()),
    updated_at: String(input.updated_at || nowIso()),
  };
};

export const fromCouchCollection = (doc: CouchCollectionDoc) => ({
  id: doc._id,
  _id: doc._id,
  _rev: doc._rev,
  slug: doc.slug,
  title: doc.title,
  designer_id: doc.designer_id || "",
  designerId: doc.designer_id || "",
  designer_name: doc.designer_name,
  designerName: doc.designer_name,
  designer_slug: doc.designer_slug,
  designerSlug: doc.designer_slug,
  season: doc.season,
  year: doc.year,
  description: doc.description || "",
  cover_image: doc.cover_image || "",
  coverImage: doc.cover_image || "",
  looks: doc.looks || [],
  created_at: doc.created_at,
  updated_at: doc.updated_at,
});

export const toCouchArticle = (
  input: Partial<Article> & Record<string, unknown>,
): CouchArticleDoc => {
  const title = String(input.title || "");
  const slug = String(input.slug || slugify(title));
  const status = String(input.status || "draft") as CouchArticleDoc["status"];
  const publishedAt = input.published_at || input.publishedAt;

  return {
    _id: resolveDocId("article", input.id, slug || title),
    type: "article",
    slug,
    title,
    subtitle: String(input.subtitle || ""),
    category: (input.category as CouchArticleDoc["category"]) || "features",
    author_id: typeof input.author_id === "string" ? input.author_id : null,
    author_name: String(input.author_name || input.author || "Editorial"),
    cover_image: String(input.cover_image || input.coverImage || ""),
    cover_image_vertical: String(input.cover_image_vertical || input.coverImageVertical || ""),
    body: String(input.body || ""),
    status,
    designer_slug:
      typeof input.designer_slug === "string"
        ? input.designer_slug
        : typeof input.designerSlug === "string"
          ? input.designerSlug
          : null,
    tags: toArray(input.tags),
    read_time: Number(input.read_time || input.readTime) || 5,
    published_at:
      typeof publishedAt === "string"
        ? publishedAt
        : status === "published"
          ? nowIso()
          : null,
    credits: input.credits as CouchArticleDoc["credits"],
    related_looks:
      (input.related_looks as CouchArticleDoc["related_looks"]) ||
      (input.relatedLooks as CouchArticleDoc["related_looks"]) ||
      [],
    created_at: String(input.created_at || nowIso()),
    updated_at: String(input.updated_at || nowIso()),
  };
};

export const fromCouchArticle = (doc: CouchArticleDoc) => ({
  id: doc._id,
  _id: doc._id,
  _rev: doc._rev,
  slug: doc.slug,
  title: doc.title,
  subtitle: doc.subtitle || "",
  category: doc.category,
  author: doc.author_name,
  author_name: doc.author_name,
  author_id: doc.author_id || null,
  publishedAt: doc.published_at || "",
  published_at: doc.published_at || null,
  coverImage: doc.cover_image || "",
  cover_image: doc.cover_image || "",
  coverImageVertical: doc.cover_image_vertical || "",
  cover_image_vertical: doc.cover_image_vertical || "",
  designerSlug: doc.designer_slug || undefined,
  designer_slug: doc.designer_slug || null,
  tags: doc.tags || [],
  readTime: doc.read_time || 5,
  read_time: doc.read_time || 5,
  body: doc.body || "",
  status: doc.status,
  credits: doc.credits || {},
  relatedLooks: doc.related_looks || [],
  related_looks: doc.related_looks || [],
  created_at: doc.created_at,
  updated_at: doc.updated_at,
});

export const getAssetUrl = (asset: Pick<CouchAssetDoc, "_id" | "name">) =>
  `/api/content/assets/${encodeURIComponent(asset._id)}/${encodeURIComponent(asset.name)}`;

export const fromCouchAsset = (doc: CouchAssetDoc) => ({
  id: doc._id,
  _id: doc._id,
  _rev: doc._rev,
  name: doc.name,
  path: doc.path,
  folder: doc.folder,
  url: getAssetUrl(doc),
  size: doc.size,
  content_type: doc.content_type,
  contentType: doc.content_type,
  created_at: doc.created_at || null,
  updated_at: doc.updated_at || null,
});
