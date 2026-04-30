"use client";

import { use } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getDesignerBySlug,
  getCollections,
  getArticles,
} from "@/lib/supabase/queries";
import { StickyNavbar, Footer } from "@/app/components";

const TABS = ["Collections", "Press", "All Looks"] as const;
type Tab = (typeof TABS)[number];

interface Designer {
  id: string;
  slug: string;
  name: string;
  tier: "high-end" | "contemporary" | "emerging";
  bio: string;
  short_bio: string;
  profile_image: string;
  cover_image: string;
  founded: number;
  nationality: string;
  active_seasons: number;
  socialLinks?: {
    instagram?: string;
    website?: string;
  };
}

export default function DesignerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [designer, setDesigner] = useState<Designer | null>(null);
  const [designerCollections, setDesignerCollections] = useState<any[]>([]);
  const [designerArticles, setDesignerArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("Collections");

  useEffect(() => {
    async function loadData() {
      try {
        const [designerData, collectionsData, articlesData] = await Promise.all(
          [
            getDesignerBySlug(slug),
            getCollections({ designerSlug: slug }),
            getArticles({ status: "published" }),
          ],
        );

        if (designerData) {
          setDesigner(designerData as Designer);
          setDesignerCollections(collectionsData || []);
          setDesignerArticles(
            (articlesData || []).filter(
              (a: any) => a.designer_slug === slug || a.designerSlug === slug,
            ),
          );
        }
      } catch (err) {
        console.error("Error loading designer:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#080604] flex items-center justify-center">
        <div className="flex gap-2.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-white/30 animate-pulse"
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Not found ────────────────────────────────────────────────────────────
  if (!designer) {
    return (
      <div className="min-h-screen bg-[#080604] flex items-center justify-center">
        <h1 className="font-serif text-4xl text-white">Designer not found</h1>
      </div>
    );
  }

  // ── Derived data ─────────────────────────────────────────────────────────
  const activeSeasons = Array.from(
    new Set(designerCollections.map((c: any) => `${c.season} ${c.year}`)),
  ).length;

  const totalLooks = designerCollections.reduce(
    (sum: number, c: any) => sum + (c.looks?.length || 0),
    0,
  );

  const allLooks = designerCollections.flatMap((c: any) =>
    (c.looks || []).map((l: any) => ({
      ...l,
      collectionTitle: c.title,
      collectionSlug: c.slug,
    })),
  );

  const yearGroups = Array.from(
    new Set(designerCollections.map((c: any) => c.year as number)),
  ).sort((a, b) => b - a);

  const tierStyles: Record<Designer["tier"], string> = {
    "high-end": "bg-amber-950/60 text-amber-300 border border-amber-700/40",
    contemporary: "bg-slate-800/60 text-slate-300 border border-slate-600/40",
    emerging: "bg-emerald-950/60 text-emerald-400 border border-emerald-700/40",
  };

  const tierLabels: Record<Designer["tier"], string> = {
    "high-end": "High-End",
    contemporary: "Contemporary",
    emerging: "Emerging",
  };

  const tabCounts: Record<Tab, number> = {
    Collections: designerCollections.length,
    Press: designerArticles.length,
    "All Looks": allLooks.length,
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#080604]">
      <StickyNavbar />

      {/* ════════════════════════════════════════════════════════════════════
          HERO  (full-screen)
      ═════════════════════════════════════════════════════════════════════ */}
      <section className="relative h-screen overflow-hidden">
        {designer.cover_image ? (
          <>
            <Image
              src={designer.cover_image}
              alt={designer.name}
              fill
              className="object-cover"
              priority
            />
            {/* bottom-to-top dark gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
          </>
        ) : (
          /* fallback: dark solid + subtle radial */
          <div
            className="absolute inset-0 bg-[#1A1714]"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 65% 35%, rgba(255,255,255,0.05) 0%, transparent 60%)",
            }}
          />
        )}

        {/* Hero bottom content: two-column */}
        <div className="absolute inset-x-0 bottom-0 pb-12 px-8">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-6xl mx-auto flex items-end justify-between gap-10"
          >
            {/* Left: tier badge → name → short bio → inline stats */}
            <div className="flex-1 min-w-0">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full font-sans text-[10px] tracking-[2px] uppercase mb-5 ${tierStyles[designer.tier]}`}
              >
                {tierLabels[designer.tier]}
              </span>

              <h1 className="font-serif text-white text-5xl md:text-[4.25rem] leading-[1.02] mb-3 [overflow-wrap:anywhere]">
                {designer.name}
              </h1>

              {designer.short_bio && (
                <p className="font-sans text-white/60 text-sm leading-relaxed max-w-xl mb-5">
                  {designer.short_bio}
                </p>
              )}

              {/* Inline quick stats */}
              <div className="flex flex-wrap gap-7">
                {designer.founded > 0 && (
                  <div>
                    <span className="font-sans text-[9px] tracking-[2px] uppercase text-white/35 block mb-0.5">
                      Founded
                    </span>
                    <span className="font-serif text-white text-[1.35rem]">
                      {designer.founded}
                    </span>
                  </div>
                )}
                <div>
                  <span className="font-sans text-[9px] tracking-[2px] uppercase text-white/35 block mb-0.5">
                    Collections
                  </span>
                  <span className="font-serif text-white text-[1.35rem]">
                    {designerCollections.length}
                  </span>
                </div>
                <div>
                  <span className="font-sans text-[9px] tracking-[2px] uppercase text-white/35 block mb-0.5">
                    Looks
                  </span>
                  <span className="font-serif text-white text-[1.35rem]">
                    {totalLooks}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: circular profile image — desktop only */}
            {designer.profile_image && (
              <div className="hidden md:block shrink-0">
                <div
                  className="rounded-full overflow-hidden border-2 border-white/25 relative"
                  style={{ width: 160, height: 160 }}
                >
                  <Image
                    src={designer.profile_image}
                    alt={`${designer.name} profile`}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          STATS BAR
      ═════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-[#0D0B09] border-b border-white/[0.08] py-6 px-8"
      >
        <div className="max-w-6xl mx-auto flex items-stretch overflow-x-auto">
          {(
            [
              { label: "Founded", value: designer.founded || "—" },
              { label: "Active Seasons", value: activeSeasons || "—" },
              { label: "Collections", value: designerCollections.length },
              { label: "Looks", value: totalLooks },
              {
                label: "Nationality",
                value: designer.nationality || "Mongolian",
              },
            ] as { label: string; value: string | number }[]
          ).map((stat, i, arr) => (
            <div
              key={stat.label}
              className={[
                "flex-1 min-w-[90px] flex flex-col justify-center gap-1",
                i > 0 ? "pl-6" : "",
                i < arr.length - 1 ? "pr-6 border-r border-white/[0.08]" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span className="font-sans text-[9px] tracking-[2px] uppercase text-white/30">
                {stat.label}
              </span>
              <span className="font-serif text-white text-xl leading-none">
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════════
          BIO SECTION
      ═════════════════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="bg-[#080604] py-16 px-8"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[60%_40%] gap-14">
          {/* Full bio */}
          <p className="font-sans text-base leading-relaxed text-white/70">
            {designer.bio}
          </p>

          {/* Social links */}
          <div className="flex flex-col gap-4 lg:pl-4">
            {designer.socialLinks?.instagram && (
              <Link
                href={designer.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-white/50 hover:text-white transition-colors font-sans text-sm group"
              >
                <span className="w-8 h-8 rounded-full border border-white/20 group-hover:border-white/50 flex items-center justify-center transition-colors text-[10px] tracking-wide">
                  IG
                </span>
                Instagram
              </Link>
            )}
            {designer.socialLinks?.website && (
              <Link
                href={designer.socialLinks.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-white/50 hover:text-white transition-colors font-sans text-sm group"
              >
                <span className="w-8 h-8 rounded-full border border-white/20 group-hover:border-white/50 flex items-center justify-center transition-colors text-base leading-none">
                  ↗
                </span>
                Official Website
              </Link>
            )}
          </div>
        </div>
      </motion.section>

      {/* ════════════════════════════════════════════════════════════════════
          STICKY TABS
      ═════════════════════════════════════════════════════════════════════ */}
      <div className="sticky top-[72px] z-40 bg-[#0D0B09]/95 backdrop-blur border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex gap-8">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={[
                  "font-sans text-[11px] tracking-[2px] uppercase py-4 transition-colors border-b-2 whitespace-nowrap",
                  activeTab === tab
                    ? "text-white border-white"
                    : "text-white/40 border-transparent hover:text-white/65",
                ].join(" ")}
              >
                {tab} ({tabCounts[tab]})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          TAB CONTENT
      ═════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-8 py-16 min-h-[40vh]">
        <AnimatePresence mode="wait">
          {/* ── Collections ── */}
          {activeTab === "Collections" && (
            <motion.div
              key="collections"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-14"
            >
              {designerCollections.length === 0 ? (
                <div className="flex items-center justify-center py-24">
                  <span className="font-sans text-[9px] tracking-[3px] uppercase text-white/20">
                    No collections yet
                  </span>
                </div>
              ) : (
                yearGroups.map((year) => (
                  <motion.div
                    key={year}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                  >
                    {/* Ghost year watermark */}
                    <div className="leading-none mb-2 select-none pointer-events-none">
                      <span className="font-serif text-[80px] text-white/[0.04]">
                        {year}
                      </span>
                    </div>

                    {/* Horizontal collection cards */}
                    <div className="space-y-3 -mt-4">
                      {designerCollections
                        .filter((c: any) => c.year === year)
                        .map((collection: any) => (
                          <div
                            key={collection.id}
                            className="group flex rounded-[16px] border border-white/10 bg-white/[0.03] hover:bg-white/[0.055] transition-colors overflow-hidden"
                          >
                            {/* Cover image: fixed 180 px wide, 3:4 ratio */}
                            <div
                              className="w-[180px] shrink-0 relative bg-[#1A1714]"
                              style={{ aspectRatio: "3 / 4" }}
                            >
                              {collection.cover_image && (
                                <Image
                                  src={collection.cover_image}
                                  alt={collection.title}
                                  fill
                                  className="object-cover"
                                />
                              )}
                            </div>

                            {/* Right side metadata */}
                            <div className="flex flex-col justify-center gap-2 p-6 min-w-0">
                              <span className="font-sans text-[10px] tracking-[2px] uppercase text-white/35">
                                {collection.season} {collection.year}
                              </span>
                              <h3 className="font-serif text-white text-xl leading-tight [overflow-wrap:anywhere]">
                                {collection.title}
                              </h3>
                              {collection.description && (
                                <p className="font-sans text-sm text-white/45 line-clamp-2 leading-relaxed">
                                  {collection.description}
                                </p>
                              )}
                              <Link
                                href={`/archive/${collection.slug}`}
                                className="font-sans text-[11px] tracking-[1px] text-white/30 group-hover:text-white/60 transition-colors mt-1 w-fit"
                              >
                                View Collection →
                              </Link>
                            </div>
                          </div>
                        ))}
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {/* ── Press ── */}
          {activeTab === "Press" && (
            <motion.div
              key="press"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {designerArticles.length === 0 ? (
                <div className="flex items-center justify-center py-24">
                  <span className="font-sans text-[9px] tracking-[3px] uppercase text-white/20">
                    No press coverage yet
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {designerArticles.map((article: any, i: number) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.08 }}
                    >
                      <Link
                        href={`/editorial/${article.slug}`}
                        className="group block"
                      >
                        {/* Cover image: 3:2 */}
                        <div className="relative aspect-[3/2] overflow-hidden rounded-[12px] bg-[#1A1714] mb-4">
                          {article.cover_image && (
                            <Image
                              src={article.cover_image}
                              alt={article.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          )}
                        </div>

                        {article.category && (
                          <span className="font-sans text-[9px] tracking-[2px] uppercase text-white/35 mb-2 block">
                            {article.category}
                          </span>
                        )}

                        <h3 className="font-serif text-white text-lg leading-snug mb-2 group-hover:text-white/75 transition-colors [overflow-wrap:anywhere]">
                          {article.title}
                        </h3>

                        <span className="font-sans text-[11px] text-white/30">
                          {article.read_time ?? article.readTime} min read
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── All Looks ── */}
          {activeTab === "All Looks" && (
            <motion.div
              key="looks"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {allLooks.length === 0 ? (
                <div className="flex items-center justify-center py-24">
                  <span className="font-sans text-[9px] tracking-[3px] uppercase text-white/20">
                    No looks available
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {allLooks.map((look: any, i: number) => (
                    <motion.div
                      key={look.id ?? i}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.45, delay: (i % 8) * 0.04 }}
                      className="group relative rounded-[12px] overflow-hidden bg-[#1A1714]"
                      style={{ aspectRatio: "2 / 3" }}
                    >
                      {/* Look image (fill + proper relative wrapper) */}
                      {look.image && (
                        <Image
                          src={look.image}
                          alt={`Look ${look.number}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      )}

                      {/* Look number — always visible, bottom-left */}
                      <div className="absolute bottom-0 left-0 p-3 z-10">
                        <span className="font-sans text-[10px] tracking-[1.5px] text-white/55">
                          {String(look.number).padStart(2, "0")}
                        </span>
                      </div>

                      {/* Collection name — revealed on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 z-10">
                        <span className="font-sans text-[10px] tracking-[1px] uppercase text-white/80 line-clamp-1">
                          {look.collectionTitle}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
}
