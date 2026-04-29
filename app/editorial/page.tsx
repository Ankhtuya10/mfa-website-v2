"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { StickyNavbar, Footer } from "@/app/components";
import { SafeImage } from "@/app/components/shared/SafeImage";
import { ChevronRight, Play, Pause, ArrowRight } from "lucide-react";
import { getArticles, getCollections } from "@/lib/supabase/queries";

interface EditorialArticle {
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
  designerName?: string;
  designer_name?: string;
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

const categoryColors: Record<string, string> = {
  features: "#2A2522",
  interviews: "#4A4038",
  news: "#6B5D4D",
  trends: "#8B7A68",
};

type FeaturedPiece = {
  id: string;
  image: string;
  title: string;
  designer: string;
  collection: string;
  href: string;
};

type ReadNextStory = {
  title: string;
  category: string;
  image: string;
  slug: string;
};

const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

const editorialHeroFallbackImage =
  "https://feiffroacxipvonvmecs.supabase.co/storage/v1/object/sign/videos/images/pexels-ron-lach-7778890.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9kNTdjZGJjYi0wNzRmLTQyMGMtOGJmMS1iY2MyZTI2NzkyODciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MvaW1hZ2VzL3BleGVscy1yb24tbGFjaC03Nzc4ODkwLmpwZyIsImlhdCI6MTc3NTA2MzIwMiwiZXhwIjoxNzc3NjU1MjAyfQ.jk7lYLHUQXygEVLRhhtNTaJpGD0pB5MiSQOuGdpn59U";

const normalizeEditorialArticle = (
  article: Partial<EditorialArticle> & { [key: string]: unknown },
): EditorialArticle => ({
  id: String(article.id || ""),
  slug: String(article.slug || ""),
  title: String(article.title || ""),
  subtitle: String(article.subtitle || ""),
  category: String(article.category || "features"),
  author: String(article.author || ""),
  publishedAt: String(article.publishedAt || article.published_at || ""),
  published_at:
    typeof article.published_at === "string" ? article.published_at : undefined,
  coverImage: String(
    article.coverImage || article.cover_image || editorialHeroFallbackImage,
  ),
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
  designerName:
    typeof article.designerName === "string"
      ? article.designerName
      : typeof article.designer_name === "string"
        ? article.designer_name
        : undefined,
  designer_name:
    typeof article.designer_name === "string"
      ? article.designer_name
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
  credits: article.credits as EditorialArticle["credits"],
  relatedLooks: article.relatedLooks as EditorialArticle["relatedLooks"],
  status: String(article.status || "published"),
});

export default function EditorialPage() {
  const [articles, setArticles] = useState<EditorialArticle[]>([]);
  const [featuredPieces, setFeaturedPieces] = useState<FeaturedPiece[]>([]);
  const [readNextStories, setReadNextStories] = useState<ReadNextStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    async function fetchEditorialData() {
      try {
        const [articleData, collectionData] = await Promise.all([
          getArticles({ status: "published" }),
          getCollections(),
        ]);

        const normalizedArticles = (articleData || []).map((article) =>
          normalizeEditorialArticle(article as Record<string, unknown>),
        );
        setArticles(normalizedArticles);
        setReadNextStories(
          normalizedArticles.slice(0, 3).map((article) => ({
            title: article.title,
            category: article.category,
            image: article.coverImage || editorialHeroFallbackImage,
            slug: article.slug,
          })),
        );

        const mappedLooks = (collectionData || []).flatMap((collection: any) =>
          (Array.isArray(collection.looks) ? collection.looks : []).map((look: any) => {
            const seasonLabel = [collection?.season, collection?.year]
            .filter(Boolean)
            .join(" ");
            return {
              id: String(look.id),
              image: String(look.image || editorialHeroFallbackImage),
              title: `Look ${look.number || ""}`.trim(),
              designer: String(collection?.designer_name || collection?.designerName || "Designer"),
              collection: seasonLabel || String(collection?.title || "Collection"),
              href: collection?.slug ? `/archive/${collection.slug}` : "/archive",
            } satisfies FeaturedPiece;
          }),
        );
        setFeaturedPieces(mappedLooks.slice(0, 12));
      } catch {
        setArticles([]);
        setFeaturedPieces([]);
        setReadNextStories([]);
      } finally {
        setLoading(false);
      }
    }

    fetchEditorialData();
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || articles.length === 0) return;
    const interval = setInterval(() => {
      setCurrentFeatureIndex((previous) => (previous + 1) % articles.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, articles.length]);

  const currentFeature = articles[currentFeatureIndex];
  const relatedArticles = articles.slice(0, 3);
  const supportingFeatures =
    articles.length > 1
      ? [1, 2]
          .map(
            (offset) =>
              articles[(currentFeatureIndex + offset) % articles.length],
          )
          .filter(Boolean)
      : [];
  const currentHeroImage =
    currentFeature?.coverImage ||
    editorialHeroFallbackImage;
  const currentNarrativeImage =
    currentFeature?.coverImageVertical ||
    currentFeature?.coverImage ||
    editorialHeroFallbackImage;

  if (loading) {
    return (
      <div className="h-screen w-full overflow-hidden bg-[#060606] p-2 sm:p-3">
        <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A]">
          <StickyNavbar />
          <div className="flex h-full items-center justify-center">
            <span className="animate-pulse font-sans text-sm tracking-[0.22em] uppercase text-[#B7AEA9]">
              Loading…
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-[#060606] p-2 sm:p-3">
      <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A] shadow-[0_24px_90px_rgba(0,0,0,0.45)]">
        <StickyNavbar />

        <main className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth snap-container pt-[72px] md:pt-[88px]">
          {/* ── HERO ── */}
          <section className="snap-start relative h-screen w-full overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={`hero-image-${currentFeature?.id || currentFeatureIndex}`}
                initial={{
                  opacity: 0,
                  scale: 1.08,
                  filter: "blur(18px)",
                  clipPath: "inset(8% 10% round 36px)",
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  filter: "blur(0px)",
                  clipPath: "inset(0% 0% round 0px)",
                }}
                exit={{
                  opacity: 0,
                  scale: 0.96,
                  filter: "blur(14px)",
                  clipPath: "inset(6% 8% round 28px)",
                }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <SafeImage
                  src={currentHeroImage}
                  fallbackSrc={editorialHeroFallbackImage}
                  alt={currentFeature?.title || "Editorial"}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-[#0A0A0A]/10" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/50 to-transparent" />
              </motion.div>
            </AnimatePresence>

            {/* grain */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay">
              <div className="h-full w-full animate-pulse bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjUiLz48L3N2Zz4=')]" />
            </div>

            <div className="hero-content-overlay">
              <div className="mx-auto w-full max-w-[92rem]">
                <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12 lg:gap-12">
                  {/* left: headline */}
                  <div className="lg:col-span-8">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`hero-copy-${currentFeature?.id || currentFeatureIndex}`}
                        initial={{ opacity: 0, y: 26 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -18 }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="mb-6 flex flex-wrap items-center gap-3">
                          <span
                            className="rounded-sm px-3 py-1.5 font-sans text-[10px] uppercase tracking-[0.28em]"
                            style={{
                              backgroundColor:
                                categoryColors[
                                  currentFeature?.category || "features"
                                ],
                              color: "#F5F2ED",
                            }}
                          >
                            {currentFeature?.category || "Feature"}
                          </span>
                          <span className="font-sans text-[10px] tracking-[0.22em] uppercase text-white/45">
                            {currentFeature?.readTime} min read
                          </span>
                        </div>

                        <h1 className="mb-7 max-w-[18ch] font-serif text-[clamp(2rem,4.2vw,4.5rem)] leading-[1.0] tracking-[-0.02em] text-white [text-wrap:balance]">
                          {currentFeature?.title || "The Quiet Revolution"}
                        </h1>

                        <p className="max-w-xl font-sans text-sm leading-7 text-white/65 sm:text-base md:text-lg md:leading-8">
                          {currentFeature?.subtitle ||
                            "How Mongolian designers are transforming the narrative of Asian fashion"}
                        </p>

                        <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-[10px] uppercase tracking-[0.2em] text-white/45">
                          <span>
                            By {currentFeature?.author || "Editorial Staff"}
                          </span>
                          <span className="h-px w-4 bg-white/30" />
                          <span>
                            {formatDate(currentFeature?.publishedAt || "") ||
                              "March 2026"}
                          </span>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* right: controls */}
                  <div className="flex flex-col items-start gap-5 lg:col-span-4 lg:items-end">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                      className="flex items-center gap-3"
                    >
                      <button
                        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                        className="rounded-full border border-white/12 bg-black/20 p-3 text-white/62 backdrop-blur-md transition-all hover:border-white/28 hover:text-white"
                        aria-label={
                          isAutoPlaying
                            ? "Pause editorial rotation"
                            : "Play editorial rotation"
                        }
                      >
                        {isAutoPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </button>
                      <div className="flex gap-2 rounded-full border border-white/12 bg-black/20 px-3 py-3 backdrop-blur-md">
                        {articles.slice(0, 5).map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setCurrentFeatureIndex(idx);
                              setIsAutoPlaying(false);
                            }}
                            className={`h-0.5 w-7 transition-all duration-300 ${
                              currentFeatureIndex === idx
                                ? "bg-white"
                                : "bg-white/28 hover:bg-white/50"
                            }`}
                            aria-label={`Show editorial feature ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </motion.div>

                    {currentFeature && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.7 }}
                      >
                        <Link
                          href={`/editorial/${currentFeature.slug}`}
                          className="group inline-flex items-center gap-3 border-b border-white/20 pb-1"
                        >
                          <span className="font-sans text-[11px] uppercase tracking-[0.22em] text-white/80 transition-colors group-hover:text-white">
                            Read Story
                          </span>
                          <ArrowRight className="h-4 w-4 text-white/55 transition-all group-hover:translate-x-1 group-hover:text-white" />
                        </Link>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── NARRATIVE SPLIT ── */}
          <section className="snap-start relative h-screen w-full overflow-hidden bg-[#0A0A0A]">
            <div className="grid h-full grid-cols-1 lg:grid-cols-12">
              {/* image side */}
              <div className="relative mx-4 min-h-[44vh] overflow-hidden rounded-[20px] sm:mx-6 lg:col-span-7 lg:mx-0 lg:min-h-0 lg:rounded-none">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`narrative-image-${currentFeature?.id || currentFeatureIndex}`}
                    initial={{
                      opacity: 0,
                      scale: 1.05,
                      filter: "blur(16px)",
                      clipPath: "inset(6% 8% round 28px)",
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      filter: "blur(0px)",
                      clipPath: "inset(0% 0% round 0px)",
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.97,
                      filter: "blur(12px)",
                      clipPath: "inset(4% 5% round 20px)",
                    }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0"
                  >
                    <SafeImage
                      src={currentNarrativeImage}
                      fallbackSrc={editorialHeroFallbackImage}
                      alt={currentFeature?.title || "Editorial Feature"}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/72 via-[#0A0A0A]/10 to-transparent" />
                  </motion.div>
                </AnimatePresence>

                {/* credits overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-md"
                  >
                    <div className="border-t border-white/18 pt-4">
                      <p className="mb-2.5 font-sans text-[10px] tracking-[0.2em] uppercase text-white/45">
                        Credits
                      </p>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 font-sans text-[11px] tracking-[0.08em] text-white/65">
                        <span>Photo: Batbayar</span>
                        <span>Stylist: Nomin</span>
                        <span>Model: Anu</span>
                        <span>Creative Dir: Bold</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* text side */}
              <div className="flex min-h-0 flex-col justify-between bg-[linear-gradient(180deg,#12100E_0%,#0A0A0A_100%)] px-8 py-10 md:px-12 md:py-14 lg:col-span-5 lg:px-14">
                <div className="max-w-xl">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`narrative-copy-${currentFeature?.id || currentFeatureIndex}`}
                      initial={{ opacity: 0, y: 26 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -16 }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <span className="mb-6 block font-sans text-[10px] tracking-[0.3em] uppercase text-[#B7AEA9]">
                        In Focus
                      </span>
                      <h2 className="mb-6 font-serif text-3xl leading-[1.08] text-white md:text-4xl lg:text-5xl">
                        {currentFeature?.title ||
                          "The Architecture of the Steppe"}
                      </h2>
                      <p className="mb-8 font-sans text-base leading-7 text-white/60 md:text-lg md:leading-8">
                        {currentFeature?.subtitle ||
                          "Exploring the geometric foundations of Mongolian design where the vastness of the landscape meets the precision of contemporary craft."}
                      </p>
                      <Link
                        href={
                          currentFeature
                            ? `/editorial/${currentFeature.slug}`
                            : "/editorial"
                        }
                        className="group inline-flex items-center gap-3 border-b border-white/18 pb-1"
                      >
                        <span className="font-sans text-[11px] tracking-[0.22em] uppercase text-white/68 transition-colors group-hover:text-white">
                          View Full Story
                        </span>
                        <ArrowRight className="h-4 w-4 text-white/45 transition-all group-hover:translate-x-1 group-hover:text-white" />
                      </Link>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* supporting thumbnails */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`supporting-features-${currentFeature?.id || currentFeatureIndex}`}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                    className="grid grid-cols-2 gap-4 pt-8 lg:pt-12"
                  >
                    {supportingFeatures.map((article, idx) => (
                      <Link
                        key={article.id}
                        href={`/editorial/${article.slug}`}
                        className="group relative aspect-[3/4] overflow-hidden rounded-[16px]"
                      >
                        <SafeImage
                          src={
                            article.coverImageVertical ||
                            article.coverImage ||
                            editorialHeroFallbackImage
                          }
                          fallbackSrc={editorialHeroFallbackImage}
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-3">
                          <span className="block font-sans text-[9px] tracking-[0.2em] uppercase text-white/60">
                            {idx === 0 ? "Next Up" : "Also Read"}
                          </span>
                          <p className="mt-1 line-clamp-2 font-serif text-sm leading-tight text-white">
                            {article.title}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* ── PULL QUOTE ── */}
          <section className="snap-start relative flex h-screen w-full items-center justify-center overflow-hidden border-t border-white/[0.06] bg-[linear-gradient(180deg,#0A0A0A_0%,#12100E_54%,#0A0A0A_100%)] px-8 md:px-12">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-w-4xl border-y border-white/10 py-14 text-center"
            >
              <span className="font-serif text-7xl leading-none text-[#B7AEA9]/30 md:text-9xl">
                "
              </span>
              <blockquote className="-mt-10 mb-8 font-serif text-2xl leading-[1.36] text-white md:text-3xl lg:text-4xl">
                We&apos;re not just making clothes. We&apos;re preserving a way
                of life. Every sweater carries the memory of the herd.
              </blockquote>
              <cite className="font-sans text-[11px] tracking-[0.25em] uppercase text-[#B7AEA9]/65 not-italic">
                Tsetseg, Cashmere Grader
              </cite>
            </motion.div>
          </section>

          {/* ── FEATURED PIECES ── */}
          <section className="snap-start relative h-screen w-full overflow-hidden border-t border-white/[0.06] bg-[#0A0A0A]">
            <div className="mx-auto flex h-full min-h-0 w-full max-w-[95rem] flex-col px-8 pb-10 pt-20 md:px-10 md:pb-12 md:pt-24">
              <div className="mb-8 flex shrink-0 items-end justify-between md:mb-10">
                <div>
                  <span className="mb-3 block font-sans text-[10px] tracking-[0.3em] uppercase text-[#B7AEA9]">
                    Shop The Look
                  </span>
                  <h2 className="font-serif text-3xl leading-[1.1] text-white md:text-4xl lg:text-5xl">
                    Featured Pieces
                  </h2>
                </div>
                <Link
                  href="/archive"
                  className="group hidden items-center gap-2 md:inline-flex"
                >
                  <span className="font-sans text-[11px] tracking-[0.22em] uppercase text-white/55 transition-colors group-hover:text-white">
                    View All
                  </span>
                  <ChevronRight className="h-4 w-4 text-white/38 transition-colors group-hover:text-white" />
                </Link>
              </div>

              <div className="min-h-0 flex-1 overflow-hidden">
                <div className="scrollbar-hide -mx-8 flex h-full gap-5 overflow-x-auto overflow-y-hidden px-8 pb-3 md:mx-0 md:gap-6 md:px-0">
                  {featuredPieces.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.6, delay: idx * 0.08 }}
                      className="flex h-full w-[240px] shrink-0 flex-col md:w-[280px] xl:w-[300px]"
                    >
                      <Link
                        href={item.href}
                        className="group flex h-full flex-col"
                      >
                        <div className="relative mb-4 min-h-0 flex-1 overflow-hidden rounded-[16px] border border-white/8">
                          <SafeImage
                            src={item.image}
                            fallbackSrc={editorialHeroFallbackImage}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-[1.045]"
                          />
                          <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                          <div className="absolute bottom-4 left-4 right-4 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                            <span className="block w-full bg-white/90 py-3 text-center font-sans text-[10px] tracking-[0.2em] uppercase text-[#0A0A0A]">
                              View in Archive
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1.5 pb-2">
                          <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-white/38">
                            {item.collection}
                          </p>
                          <h3 className="font-serif text-lg leading-tight text-white transition-colors group-hover:text-white/75">
                            {item.title}
                          </h3>
                          <p className="font-sans text-[11px] tracking-[0.1em] text-white/55">
                            {item.designer}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="mt-6 shrink-0 text-center md:hidden">
                <Link
                  href="/archive"
                  className="group inline-flex items-center gap-2"
                >
                  <span className="font-sans text-[11px] tracking-[0.22em] uppercase text-white/55 transition-colors group-hover:text-white">
                    View All
                  </span>
                  <ChevronRight className="h-4 w-4 text-white/38 transition-colors group-hover:text-white" />
                </Link>
              </div>
            </div>
          </section>

          {/* ── LATEST STORIES ── */}
          <section className="snap-start relative h-screen w-full overflow-hidden border-t border-white/[0.06] bg-[#0F0D0B]">
            <div className="mx-auto flex h-full min-h-0 w-full max-w-[95rem] flex-col px-8 pb-10 pt-20 md:px-10 md:pb-12 md:pt-24">
              <div className="mb-8 flex shrink-0 items-end justify-between md:mb-10">
                <div>
                  <span className="mb-3 block font-sans text-[10px] tracking-[0.3em] uppercase text-[#B7AEA9]">
                    Latest Stories
                  </span>
                  <h2 className="font-serif text-3xl leading-[1.1] text-white md:text-4xl lg:text-5xl">
                    Editorial
                  </h2>
                </div>
                <Link
                  href="/editorial"
                  className="group hidden items-center gap-2 md:inline-flex"
                >
                  <span className="font-sans text-[11px] tracking-[0.22em] uppercase text-white/55 transition-colors group-hover:text-white">
                    View All
                  </span>
                  <ChevronRight className="h-4 w-4 text-white/38 transition-colors group-hover:text-white" />
                </Link>
              </div>

              <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {relatedArticles.map((article, idx) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                    className="min-h-0"
                  >
                    <Link
                      href={`/editorial/${article.slug}`}
                      className="group flex h-full flex-col"
                    >
                      <div className="relative mb-5 aspect-[3/2] overflow-hidden rounded-[16px]">
                        <SafeImage
                          src={article.coverImage}
                          fallbackSrc={editorialHeroFallbackImage}
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/60 via-transparent to-transparent" />
                        <div className="absolute left-4 top-4">
                          <span
                            className="px-2.5 py-1.5 font-sans text-[9px] tracking-[0.2em] uppercase"
                            style={{
                              backgroundColor: categoryColors[article.category],
                              color: "#F5F2ED",
                            }}
                          >
                            {article.category}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col space-y-3">
                        <div className="flex items-center gap-3 font-sans text-[10px] tracking-[0.15em] uppercase text-white/38">
                          <span>{article.author}</span>
                          <span className="h-1 w-1 rounded-full bg-white/28" />
                          <span>{article.readTime} min</span>
                        </div>
                        <h3 className="font-serif text-xl leading-[1.2] text-white transition-colors group-hover:text-white/78 md:text-2xl">
                          {article.title}
                        </h3>
                        <p className="line-clamp-3 font-sans text-sm leading-relaxed text-white/48">
                          {article.subtitle}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 shrink-0 text-center md:hidden">
                <Link
                  href="/editorial"
                  className="group inline-flex items-center gap-2"
                >
                  <span className="font-sans text-[11px] tracking-[0.22em] uppercase text-white/55 transition-colors group-hover:text-white">
                    View All Stories
                  </span>
                  <ChevronRight className="h-4 w-4 text-white/38 transition-colors group-hover:text-white" />
                </Link>
              </div>
            </div>
          </section>

          {/* ── READ NEXT ── */}
          <section className="snap-start relative h-screen w-full overflow-hidden border-t border-white/[0.06] bg-[#0A0A0A]">
            <div className="mx-auto flex h-full min-h-0 w-full max-w-[95rem] flex-col px-8 pb-10 pt-20 md:px-10 md:pb-12 md:pt-24">
              <div className="mb-8 shrink-0 text-center md:mb-10">
                <span className="mb-3 block font-sans text-[10px] tracking-[0.3em] uppercase text-[#B7AEA9]">
                  Continue Reading
                </span>
                <h2 className="font-serif text-3xl leading-[1.1] text-white md:text-4xl">
                  Read Next
                </h2>
              </div>

              <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
                {readNextStories.map((item, idx) => (
                  <motion.div
                    key={idx}
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
                      <SafeImage
                        src={item.image}
                        fallbackSrc={editorialHeroFallbackImage}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/28 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-7">
                        <span className="mb-2 block font-sans text-[9px] tracking-[0.25em] uppercase text-white/48">
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
    </div>
  );
}
