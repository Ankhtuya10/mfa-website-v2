import { NextResponse } from "next/server";
import { createContentRepository } from "@/lib/couchdb/repository";
import { jsonError } from "../utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const repo = createContentRepository();
    const [articles, collections, designers] = await Promise.all([
      repo.getArticles({ status: "published" }),
      repo.getCollections(),
      repo.getDesigners(),
    ]);

    const articleItems = articles.map((article: any) => ({
      id: `article-${article.id}`,
      slug: article.slug,
      title: article.title,
      subtitle: article.subtitle || "",
      image: article.cover_image || article.coverImage || "",
      href: `/editorial/${article.slug}`,
      category: "articles",
      meta: `${article.author_name || article.author || "Editorial"} · ${article.read_time || article.readTime || 5} min read`,
      searchText: [
        article.title,
        article.subtitle,
        article.body,
        article.author_name || article.author,
        ...(article.tags || []),
      ].join(" "),
      tags: article.tags || [],
    }));

    const collectionItems = collections.map((collection: any) => {
      const looks = Array.isArray(collection.looks) ? collection.looks : [];
      const materialTags = looks.flatMap((look: any) =>
        Array.isArray(look?.materials) ? look.materials : [],
      );
      const lookTags = looks.flatMap((look: any) => (Array.isArray(look?.tags) ? look.tags : []));
      const seasonLabel = `${collection.season || ""}${collection.year || ""}`;

      return {
        id: `collection-${collection.id}`,
        slug: collection.slug,
        title: collection.title,
        subtitle: collection.description || "",
        image: collection.cover_image || collection.coverImage || "",
        href: `/archive/${collection.slug}`,
        category: "collections",
        meta: `${collection.designer_name || collection.designerName || "Unknown"} · ${collection.season || ""} ${collection.year || ""}`.trim(),
        searchText: [
          collection.title,
          collection.description,
          collection.designer_name || collection.designerName,
          collection.season,
          `${collection.season || ""}${collection.year || ""}`,
          `${collection.year || ""}`,
          ...materialTags,
          ...lookTags,
        ].join(" "),
        tags: [...lookTags, ...materialTags],
        seasonLabel,
      };
    });

    const designerItems = designers.map((designer: any) => ({
      id: `designer-${designer.id}`,
      slug: designer.slug,
      title: designer.name,
      subtitle: designer.short_bio || designer.shortBio || "",
      image: designer.cover_image || designer.coverImage || "",
      href: `/designers/${designer.slug}`,
      category: "designers",
      meta: `${designer.name} · ${designer.tier || ""}`.trim(),
      searchText: [designer.name, designer.bio, designer.short_bio || designer.shortBio, `${designer.founded || ""}`].join(" "),
      tags: [designer.tier || ""],
    }));

    const brandItems = designers.map((designer: any) => ({
      id: `brand-${designer.id}`,
      slug: designer.slug,
      title: designer.name,
      subtitle: designer.short_bio || designer.shortBio || "",
      image: designer.cover_image || designer.coverImage || "",
      href: `/designers/${designer.slug}`,
      category: "brands",
      meta: `${designer.name} · Founded ${designer.founded || "-"}`,
      searchText: [designer.name, designer.bio, designer.short_bio || designer.shortBio].join(" "),
      tags: [designer.tier || ""],
    }));

    return NextResponse.json(
      [...articleItems, ...collectionItems, ...designerItems, ...brandItems].filter(
        (item) => item.slug && item.title && item.image,
      ),
    );
  } catch (error) {
    return jsonError(error);
  }
}
