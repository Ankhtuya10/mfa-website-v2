"use client";

import { use, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Footer, StickyNavbar } from "@/app/components";
import { BookmarkButton } from "@/app/components/shared/BookmarkButton";
import { SafeImage } from "@/app/components/shared/SafeImage";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X, ArrowRight } from "lucide-react";
import {
  getArticleBySlug,
  getArticles,
  getCollections,
  getDesignerBySlug,
} from "@/lib/supabase/queries";

interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  author: string;
  publishedAt: string;
  published_at?: string;
  coverImage: string;
  cover_image?: string;
  coverImageVertical?: string;
  cover_image_vertical?: string;
  designerSlug?: string;
  designer_slug?: string;
  tags: string[];
  readTime: number;
  read_time?: number;
  body: string;
  credits?: {
    photographer?: string;
    stylist?: string;
    model?: string;
    creativeDirector?: string;
    location?: string;
    date?: string;
    equipment?: string;
  };
  relatedLooks?: Array<{
    lookId: string;
    lookNumber: number;
    image: string;
    collectionSlug: string;
    collectionName: string;
  }>;
  status: string;
}

type FeaturedLook = {
  lookId: string;
  lookNumber: number;
  image: string;
  collectionSlug: string;
  collectionName: string;
};

const categoryColors: Record<string, string> = {
  features: "#2A2522",
  interviews: "#4A4038",
  news: "#6B5D4D",
  trends: "#8B7A68",
};

const normalizeArticle = (
  article: Partial<Article> & { [key: string]: unknown },
): Article => ({
  id: String(article.id || ""),
  slug: String(article.slug || ""),
  title: String(article.title || ""),
  subtitle: String(article.subtitle || ""),
  category: String(article.category || "features"),
  author: String(article.author || ""),
  publishedAt: String(article.publishedAt || article.published_at || ""),
  published_at:
    typeof article.published_at === "string" ? article.published_at : undefined,
  coverImage: String(article.coverImage || article.cover_image || ""),
  cover_image:
    typeof article.cover_image === "string" ? article.cover_image : undefined,
  coverImageVertical:
    typeof article.coverImageVertical === "string"
      ? article.coverImageVertical
      : typeof article.cover_image_vertical === "string"
        ? article.cover_image_vertical
        : undefined,
  cover_image_vertical:
    typeof article.cover_image_vertical === "string"
      ? article.cover_image_vertical
      : undefined,
  designerSlug:
    typeof article.designerSlug === "string"
      ? article.designerSlug
      : typeof article.designer_slug === "string"
        ? article.designer_slug
        : undefined,
  designer_slug:
    typeof article.designer_slug === "string"
      ? article.designer_slug
      : undefined,
  tags: Array.isArray(article.tags)
    ? article.tags.filter((tag): tag is string => typeof tag === "string")
    : [],
  readTime:
    typeof article.readTime === "number"
      ? article.readTime
      : typeof article.read_time === "number"
        ? article.read_time
        : 5,
  read_time:
    typeof article.read_time === "number" ? article.read_time : undefined,
  body: String(article.body || ""),
  credits: article.credits as Article["credits"],
  relatedLooks: article.relatedLooks as Article["relatedLooks"],
  status: String(article.status || "published"),
});

export default function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [designer, setDesigner] = useState<any>(null);
  const [featuredLooks, setFeaturedLooks] = useState<FeaturedLook[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentLookIndex, setCurrentLookIndex] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const [articleData, relatedData] = await Promise.all([
          getArticleBySlug(slug),
          getArticles({ status: "published" }),
        ]);

        if (articleData) {
          const normalizedArticle = normalizeArticle(
            articleData as Record<string, unknown>,
          );
          setArticle(normalizedArticle);

          const resolvedDesignerSlug =
            normalizedArticle.designerSlug || normalizedArticle.designer_slug;
          if (resolvedDesignerSlug) {
            const [designerData, designerCollections] = await Promise.all([
              getDesignerBySlug(resolvedDesignerSlug).catch(() => null),
              getCollections({ designerSlug: resolvedDesignerSlug }),
            ]);
            if (designerData) setDesigner(designerData);

            const looks = (designerCollections || [])
              .flatMap((collection: any) =>
                (Array.isArray(collection.looks) ? collection.looks : []).map(
                  (look: any) => ({
                    lookId: String(look.id),
                    lookNumber: Number(look.number) || 0,
                    image: String(look.image || ""),
                    collectionSlug: String(collection.slug || ""),
                    collectionName: String(collection.title || "Collection"),
                  }),
                ),
              )
              .filter((look) => look.lookId && look.collectionSlug)
              .slice(0, 8);

            setFeaturedLooks(looks);
          } else {
            setFeaturedLooks([]);
          }
        } else {
          setArticle(null);
          setDesigner(null);
          setFeaturedLooks([]);
        }

        const related = (relatedData || [])
          .filter((item: any) => item.slug !== slug)
          .slice(0, 3);
        if (related.length > 0) {
          setRelatedArticles(
            related.map((item: any) =>
              normalizeArticle(item as Record<string, unknown>),
            ),
          );
        } else {
          setRelatedArticles([]);
        }
      } catch {
        setArticle(null);
        setRelatedArticles([]);
        setDesigner(null);
        setFeaturedLooks([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [slug]);

  const openLightbox = (index: number) => {
    setCurrentLookIndex(index);
    setLightboxOpen(true);
  };
  const closeLightbox = () => setLightboxOpen(false);
  const nextLook = () =>
    setCurrentLookIndex((previous) => (previous + 1) % featuredLooks.length);
  const prevLook = () =>
    setCurrentLookIndex(
      (previous) =>
        (previous - 1 + featuredLooks.length) % featuredLooks.length,
    );

  // keyboard nav for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextLook();
      if (e.key === "ArrowLeft") prevLook();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen, featuredLooks.length]);

  if (loading) {
    return (
      <div className="h-screen w-full overflow-hidden bg-[#060606] p-2 sm:p-3">
        <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A]">
          <StickyNavbar />
          <main className="flex h-full items-center justify-center">
            <span className="animate-pulse font-sans text-sm tracking-[0.22em] uppercase text-[#B7AEA9]">
              Loading…
            </span>
          </main>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
        <h1 className="font-serif text-4xl text-white">Article not found</h1>
      </div>
    );
  }

  const formattedDate = new Date(
    article.publishedAt || article.published_at || "2026-03-15",
  ).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const articleParagraphs = (article.body || "").split("\n\n").filter(Boolean);
  const pullQuote =
    articleParagraphs[0]?.slice(0, 140) ||
    "Woven from the finest inner fleece of Mongolian goats, each piece carries the silence of the steppe.";

  const currentLook = featuredLooks[currentLookIndex];

  return (
    <div className="h-screen w-full overflow-hidden bg-[#060606] p-2 sm:p-3">
      <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A] shadow-[0_24px_90px_rgba(0,0,0,0.45)]">
        <StickyNavbar />

        <main className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth snap-container pt-[72px] md:pt-[88px]">
          {/* ── HERO ── */}
          <section className="snap-start relative h-screen w-full overflow-hidden">
            {article.coverImageVertical || article.coverImage ? (
              <SafeImage
                src={article.coverImageVertical || article.coverImage}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-[#1A1714]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/35 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/78 via-[#0A0A0A]/10 to-transparent" />

            {/* grain */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.025] mix-blend-overlay">
              <div className="h-full w-full animate-pulse bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjUiLz48L3N2Zz4=')]" />
            </div>

            <div className="absolute inset-x-0 bottom-0 flex items-end pb-16 md:pb-20">
              <div className="mx-auto w-full max-w-[92rem] px-6 sm:px-8 lg:px-12">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.15 }}
                  className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12 lg:gap-12"
                >
                  <div className="lg:col-span-8">
                    <div className="mb-5 flex flex-wrap items-center gap-3">
                      <span
                        className="px-3 py-1.5 font-sans text-[10px] tracking-[0.25em] uppercase"
                        style={{
                          backgroundColor:
                            categoryColors[article.category] || "#2A2522",
                          color: "#F5F2ED",
                        }}
                      >
                        {article.category}
                      </span>
                      <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-white/50">
                        {article.readTime} min read
                      </span>
                    </div>

                    <h1 className="mb-6 max-w-5xl font-serif text-4xl leading-[0.96] text-white sm:text-5xl md:text-6xl lg:text-7xl">
                      {article.title}
                    </h1>

                    <p className="max-w-2xl font-sans text-base leading-7 text-white/72 md:text-xl md:leading-8">
                      {article.subtitle}
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-1 font-sans text-[11px] uppercase tracking-[0.18em] text-white/55">
                      <span>By {article.author}</span>
                      <span className="h-1 w-1 rounded-full bg-white/35" />
                      <span>{formattedDate}</span>
                      <span className="h-1 w-1 rounded-full bg-white/35" />
                      <BookmarkButton
                        id={article.id}
                        type="article"
                        variant="dark"
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-4" />
                </motion.div>
              </div>
            </div>
          </section>

          {/* ── COVER + CREDITS SPLIT ── */}
          <section className="snap-start relative h-screen w-full overflow-hidden bg-[#0A0A0A]">
            <div className="grid h-full grid-cols-1 lg:grid-cols-12">
              {/* image + credits */}
              <div className="relative min-h-[45vh] overflow-hidden lg:col-span-6 lg:min-h-0">
                {article.coverImage || article.coverImageVertical ? (
                  <SafeImage
                    src={article.coverImage || article.coverImageVertical}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#1A1714]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/80 via-[#0A0A0A]/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                  <div className="max-w-md border-t border-white/18 pt-4">
                    <p className="mb-2.5 font-sans text-[10px] tracking-[0.2em] uppercase text-white/45">
                      Credits
                    </p>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 font-sans text-[11px] tracking-[0.08em] text-white/65">
                      <span>
                        Photo: {article.credits?.photographer || "Batbayar"}
                      </span>
                      <span>
                        Stylist: {article.credits?.stylist || "Nomin"}
                      </span>
                      <span>Model: {article.credits?.model || "Anu"}</span>
                      <span>
                        Creative Dir:{" "}
                        {article.credits?.creativeDirector || "Bold"}
                      </span>
                      <span>
                        Location: {article.credits?.location || "Ulaanbaatar"}
                      </span>
                      <span>
                        Equipment: {article.credits?.equipment || "35mm Film"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* narrative entry */}
              <div className="flex min-h-0 flex-col items-center justify-center bg-[linear-gradient(180deg,#12100E_0%,#0A0A0A_100%)] px-8 py-12 md:px-12 lg:col-span-6 lg:px-16">
                <div className="mx-auto flex max-w-lg flex-col items-center text-center">
                  <span className="mb-6 block font-sans text-[10px] tracking-[0.3em] uppercase text-[#B7AEA9]">
                    Narrative Entry
                  </span>
                  <h2 className="mb-6 font-serif text-3xl leading-[1.08] text-white md:text-4xl lg:text-5xl">
                    {article.title}
                  </h2>
                  <p className="mb-10 font-sans text-base leading-7 text-white/60 md:text-lg md:leading-8">
                    {article.subtitle}
                  </p>
                  {article.tags.length > 0 && (
                    <div className="flex w-full flex-wrap justify-center gap-2">
                      {article.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 font-sans text-[10px] tracking-[0.22em] uppercase text-white/65"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ── PULL QUOTE ── */}
          <section className="snap-start relative flex h-screen w-full items-center justify-center overflow-hidden border-t border-b border-white/[0.06] bg-[linear-gradient(180deg,#0A0A0A_0%,#12100E_54%,#0A0A0A_100%)] px-8 md:px-12">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto max-w-4xl border-y border-white/10 py-14 text-center"
            >
              <span className="font-serif text-7xl leading-none text-white/18 md:text-9xl">
                "
              </span>
              <blockquote className="-mt-10 mb-8 font-serif text-2xl leading-[1.36] text-white md:text-3xl lg:text-4xl">
                {pullQuote}…
              </blockquote>
              <cite className="font-sans text-[11px] tracking-[0.25em] uppercase text-[#B7AEA9]/65 not-italic">
                {article.author}
              </cite>
            </motion.div>
          </section>

          {/* ── ARTICLE BODY ── */}
          <section className="snap-start relative h-screen w-full overflow-hidden border-t border-white/[0.06] bg-[#0A0A0A]">
            <div className="mx-auto flex h-full min-h-0 w-full max-w-[95rem] flex-col px-6 pb-10 pt-20 md:px-10 md:pb-12 md:pt-24">
              <div className="mb-8 shrink-0 text-center md:mb-10">
                <span className="mb-3 block font-sans text-[10px] tracking-[0.3em] uppercase text-[#B7AEA9]">
                  The Story
                </span>
                <h2 className="font-serif text-3xl leading-[1.1] text-white md:text-4xl">
                  Editorial Text
                </h2>
              </div>

              <div className="mx-auto min-h-0 w-full max-w-3xl flex-1 overflow-y-auto">
                <div className="space-y-8 pb-4">
                  {articleParagraphs.map((paragraph, idx) => (
                    <p
                      key={idx}
                      className="font-sans text-base leading-[1.92] text-white/65 md:text-lg"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── FEATURED LOOKS ── */}
          <section className="snap-start relative h-screen w-full overflow-hidden border-t border-white/[0.06] bg-[#0A0A0A]">
            <div className="mx-auto flex h-full min-h-0 w-full max-w-[95rem] flex-col px-6 pb-10 pt-20 md:px-10 md:pb-12 md:pt-24">
              <div className="mb-8 flex shrink-0 items-end justify-between md:mb-10">
                <div>
                  <span className="mb-3 block font-sans text-[10px] tracking-[0.3em] uppercase text-[#B7AEA9]">
                    Shop The Look
                  </span>
                  <h2 className="font-serif text-3xl leading-[1.1] text-white md:text-4xl">
                    Featured Pieces
                  </h2>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-hidden">
                <div className="scrollbar-hide -mx-6 flex h-full gap-5 overflow-x-auto overflow-y-hidden px-6 pb-3 md:mx-0 md:px-0">
                  {featuredLooks.map((look, idx) => (
                    <motion.div
                      key={look.lookId}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.6, delay: idx * 0.08 }}
                      className="flex h-full w-[260px] shrink-0 flex-col md:w-[300px]"
                    >
                      <div
                        className="group flex h-full cursor-pointer flex-col"
                        onClick={() => openLightbox(idx)}
                      >
                        <div className="relative mb-4 min-h-0 flex-1 overflow-hidden rounded-[16px] border border-white/8">
                          <SafeImage
                            src={look.image}
                            alt={`Look ${look.lookNumber}`}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-[1.045]"
                          />
                          <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/12" />
                          <div className="absolute left-4 top-4">
                            <span className="bg-white/90 px-2.5 py-1.5 font-sans text-[9px] tracking-[0.2em] uppercase text-[#0A0A0A]">
                              Look {look.lookNumber}
                            </span>
                          </div>
                          {/* expand hint */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <div className="rounded-full border border-white/20 bg-black/40 px-4 py-2 backdrop-blur-sm">
                              <span className="font-sans text-[10px] tracking-[0.18em] uppercase text-white/90">
                                View
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1.5 pb-2">
                          <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-white/38">
                            {look.collectionName}
                          </p>
                          <h3 className="font-serif text-lg leading-tight text-white transition-colors group-hover:text-white/75">
                            Look {look.lookNumber}
                          </h3>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="mt-6 shrink-0 text-center">
                <Link
                  href="/archive"
                  className="group inline-flex items-center gap-2"
                >
                  <span className="font-sans text-[11px] tracking-[0.22em] uppercase text-white/55 transition-colors group-hover:text-white">
                    View All in Archive
                  </span>
                  <ArrowRight className="h-4 w-4 text-white/38 transition-all group-hover:translate-x-1 group-hover:text-white" />
                </Link>
              </div>
            </div>
          </section>

          {/* ── DESIGNER FEATURE ── */}
          {designer && (
            <section className="snap-start relative h-screen w-full overflow-hidden border-t border-white/[0.06] bg-[#0F0D0B]">
              <div className="grid h-full grid-cols-1 lg:grid-cols-12">
                <div className="relative min-h-[42vh] overflow-hidden lg:col-span-5 lg:min-h-0">
                  {designer.coverImage || designer.cover_image ? (
                    <SafeImage
                      src={designer.coverImage || designer.cover_image}
                      alt={designer.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[#1A1714]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F0D0B]/72 via-transparent to-transparent" />
                </div>

                <div className="flex min-h-0 items-center justify-center px-8 py-12 md:px-12 md:py-16 lg:col-span-7 lg:px-16">
                  <div className="mx-auto max-w-2xl text-center lg:text-left">
                    <span className="mb-6 block font-sans text-[10px] tracking-[0.3em] uppercase text-[#B7AEA9]">
                      Featured Designer
                    </span>
                    <Link
                      href={`/designers/${designer.slug}`}
                      className="group block"
                    >
                      <h2 className="mb-5 font-serif text-3xl leading-[1.08] text-white transition-colors group-hover:text-white/80 md:text-4xl lg:text-5xl">
                        {designer.name}
                      </h2>
                      <p className="mb-8 font-sans text-base leading-relaxed text-white/52 md:text-lg">
                        {designer.shortBio ||
                          designer.short_bio ||
                          designer.bio?.slice(0, 200)}
                      </p>
                      <div className="inline-flex items-center gap-2">
                        <span className="font-sans text-[11px] tracking-[0.22em] uppercase text-white/58 transition-colors group-hover:text-white">
                          View Designer Profile
                        </span>
                        <ArrowRight className="h-4 w-4 text-white/38 transition-all group-hover:translate-x-1 group-hover:text-white" />
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── READ NEXT ── */}
          <section className="snap-start relative h-screen w-full overflow-hidden border-t border-white/[0.06] bg-[#0A0A0A]">
            <div className="mx-auto flex h-full min-h-0 w-full max-w-[95rem] flex-col px-6 pb-10 pt-20 md:px-10 md:pb-12 md:pt-24">
              <div className="mb-8 shrink-0 text-center md:mb-10">
                <span className="mb-3 block font-sans text-[10px] tracking-[0.3em] uppercase text-[#B7AEA9]">
                  Continue Reading
                </span>
                <h2 className="font-serif text-3xl leading-[1.1] text-white md:text-4xl">
                  Read Next
                </h2>
              </div>

              <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
                {relatedArticles.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                    className="min-h-0"
                  >
                    <Link
                      href={`/editorial/${item.slug}`}
                      className="group relative block h-full overflow-hidden rounded-[20px]"
                    >
                      {item.coverImage || item.cover_image ? (
                        <SafeImage
                          src={item.coverImage || item.cover_image}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[#1A1714]" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/28 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-7">
                        <span className="mb-2 block font-sans text-[9px] tracking-[0.25em] uppercase text-white/45">
                          {item.category}
                        </span>
                        <h3 className="font-serif text-xl leading-tight text-white decoration-white/28 underline-offset-4 group-hover:underline">
                          {item.title}
                        </h3>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <div className="snap-start h-screen w-full">
            <Footer />
          </div>
        </main>
      </div>

      {/* ── LIGHTBOX ── */}
      <AnimatePresence>
        {lightboxOpen && currentLook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[200] flex items-center justify-center"
          >
            {/* backdrop */}
            <div
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
              onClick={closeLightbox}
            />

            {/* close */}
            <button
              onClick={closeLightbox}
              className="absolute right-6 top-6 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/14 bg-white/[0.055] text-white/60 transition-all hover:bg-white/[0.1] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {/* prev */}
            <button
              onClick={prevLook}
              className="absolute left-5 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-black/30 text-white/60 backdrop-blur-md transition-all hover:border-white/24 hover:text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* next */}
            <button
              onClick={nextLook}
              className="absolute right-5 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-black/30 text-white/60 backdrop-blur-md transition-all hover:border-white/24 hover:text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* content */}
            <div className="relative z-10 mx-auto flex w-full max-w-5xl items-center gap-6 px-20">
              {/* image */}
              <motion.div
                key={currentLookIndex}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex flex-1 items-center justify-center"
              >
                <SafeImage
                  src={currentLook.image}
                  alt={`Look ${currentLook.lookNumber}`}
                  width={800}
                  height={1200}
                  className="mx-auto max-h-[80vh] object-contain"
                />
              </motion.div>

              {/* info panel — styled to match your dark luxury system */}
              <motion.div
                key={`panel-${currentLookIndex}`}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="w-64 shrink-0 overflow-hidden rounded-[24px] border border-white/10 bg-[#0A0A0A]/90 backdrop-blur-2xl"
              >
                {/* panel inner glow */}
                <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-[radial-gradient(circle_at_50%_0%,rgba(212,201,184,0.07),transparent_60%)]" />

                <div className="relative p-6">
                  <p className="mb-1 font-sans text-[10px] tracking-[0.22em] uppercase text-[#B7AEA9]">
                    Look {currentLook.lookNumber}
                  </p>
                  <h3 className="mb-5 font-serif text-xl leading-tight text-white">
                    {currentLook.collectionName}
                  </h3>

                  {/* counter */}
                  <div className="mb-6 flex items-center gap-2">
                    <span className="font-sans text-[10px] tracking-[0.14em] text-white/40">
                      {currentLookIndex + 1} / {featuredLooks.length}
                    </span>
                    <div className="flex flex-1 gap-1">
                      {featuredLooks.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentLookIndex(i)}
                          className={`h-0.5 flex-1 transition-all duration-300 ${
                            i === currentLookIndex
                              ? "bg-white"
                              : "bg-white/20 hover:bg-white/40"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Link
                      href={`/archive/${currentLook.collectionSlug}`}
                      className="group flex w-full items-center justify-between rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 transition-all hover:border-white/22 hover:bg-white/[0.08]"
                    >
                      <span className="font-sans text-[10px] tracking-[0.18em] uppercase text-white/65 transition-colors group-hover:text-white">
                        View Collection
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-white/40 transition-all group-hover:translate-x-1 group-hover:text-white" />
                    </Link>

                    <div className="pt-1">
                      <BookmarkButton
                        id={currentLook.lookId}
                        type="look"
                        variant="dark"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
