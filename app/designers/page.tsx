"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { StickyNavbar, Footer } from "@/app/components";
import { getDesigners } from "@/lib/supabase/queries";

// ─── Constants ───────────────────────────────────────────────────────────────

const TIERS = ["All", "High-End", "Contemporary", "Emerging"] as const;

const TIER_DB_KEY: Record<string, string> = {
  "High-End": "high-end",
  Contemporary: "contemporary",
  Emerging: "emerging",
};

const TIER_DISPLAY: Record<string, string> = {
  "high-end": "High-End",
  contemporary: "Contemporary",
  emerging: "Emerging",
};

// ─── Animation variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DesignersPage() {
  const [activeTier, setActiveTier] = useState("All");
  const [designers, setDesigners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDesigners() {
      try {
        setDesigners(await getDesigners());
      } catch {
        setDesigners([]);
      } finally {
        setLoading(false);
      }
    }
    fetchDesigners();
  }, []);

  // ── Derived counts ──────────────────────────────────────────────────────────

  const tierCount = (tier: string) => {
    if (tier === "All") return designers.length;
    const key = TIER_DB_KEY[tier] ?? tier.toLowerCase();
    return designers.filter((d) => d.tier === key).length;
  };

  const filteredDesigners =
    activeTier === "All"
      ? designers
      : designers.filter(
          (d) =>
            d.tier === (TIER_DB_KEY[activeTier] ?? activeTier.toLowerCase()),
        );

  const groupedDesigners = {
    "high-end": designers.filter((d) => d.tier === "high-end"),
    contemporary: designers.filter((d) => d.tier === "contemporary"),
    emerging: designers.filter((d) => d.tier === "emerging"),
  };

  const activeTiersCount = new Set(designers.map((d) => d.tier).filter(Boolean))
    .size;

  // First 3 designers that have a cover image, used for the hero collage
  const collageSources = designers
    .filter((d) => d.cover_image)
    .slice(0, 3)
    .map((d) => d.cover_image as string);

  return (
    <div className="flex flex-col min-h-screen bg-[#080604]">
      <StickyNavbar />

      <main className="flex-grow">
        {/* ═══════════════════════════════════════════════════════════════════
            HERO — full-screen, dark, blurred collage background
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="relative h-screen w-full overflow-hidden bg-[#080604] flex items-center justify-center">
          {/* Background collage: first 3 cover images tiled, blurred + dimmed */}
          {collageSources.length > 0 && (
            <div
              className="absolute inset-0 grid"
              style={{
                gridTemplateColumns: `repeat(${collageSources.length}, 1fr)`,
              }}
            >
              {collageSources.map((src, i) => (
                <div key={i} className="relative overflow-hidden">
                  <Image
                    src={src}
                    alt=""
                    fill
                    priority={i === 0}
                    className="object-cover opacity-[0.28] blur-[4px] scale-110"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Left-to-right dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50" />
          {/* Top/bottom vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/75" />

          {/* Hero copy — centered */}
          <div className="relative z-10 flex flex-col items-center text-center px-8">
            <motion.span
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="block font-sans text-[10px] tracking-[0.36em] uppercase text-white/50 mb-6"
            >
              Mongolian Fashion Archive
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.85,
                delay: 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="font-serif text-6xl md:text-7xl lg:text-[5.5rem] leading-[0.95] text-white mb-6"
            >
              The Designers
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.22,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="font-sans text-white/38 text-sm tracking-[0.18em]"
            >
              {!loading && designers.length > 0
                ? `${designers.length} ${designers.length === 1 ? "house" : "houses"} · ${activeTiersCount} ${activeTiersCount === 1 ? "tier" : "tiers"}`
                : "\u00A0"}
            </motion.p>
          </div>

          {/* Scroll cue — bouncing dot + line */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2"
          >
            <span className="font-sans text-[9px] uppercase tracking-[3.6px] text-white/35">
              Scroll
            </span>
            <div className="h-[36px] w-px bg-gradient-to-b from-white/40 to-white/5" />
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            TIER FILTER BAR — sticky, frosted dark
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="sticky top-[58px] z-40 bg-[#080604]/95 backdrop-blur-md border-b border-white/[0.08]">
          <div className="flex items-center justify-center gap-8 md:gap-12 py-4 px-6 overflow-x-auto">
            {TIERS.map((tier) => {
              const count = tierCount(tier);
              const isActive = activeTier === tier;
              return (
                <button
                  key={tier}
                  onClick={() => setActiveTier(tier)}
                  className={`shrink-0 font-sans text-[11px] tracking-[0.26em] uppercase pb-1 transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? "text-white border-b-2 border-white"
                      : "text-white/40 hover:text-white/70 border-b-2 border-transparent"
                  }`}
                >
                  {tier === "All" ? `All (${count})` : `${tier} (${count})`}
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            DESIGNER GRID
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="bg-[#0A0806] py-16 pb-28 min-h-[40vh]">
          <div className="max-w-6xl mx-auto px-6 md:px-8">
            {/* ── Loading skeletons ─────────────────────────────────── */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] rounded-[20px] animate-pulse bg-white/[0.05]"
                  />
                ))}
              </div>
            )}

            {/* ── All tier — grouped view ───────────────────────────── */}
            {!loading && activeTier === "All" && (
              <>
                {(["high-end", "contemporary", "emerging"] as const).map(
                  (key) => {
                    const group = groupedDesigners[key];
                    if (group.length === 0) return null;
                    return (
                      <div key={key} className="mb-20 last:mb-0">
                        {/* Slim section divider */}
                        <div className="flex items-center gap-4 mb-10">
                          <div className="h-px flex-1 bg-white/[0.08]" />
                          <span className="font-sans text-[9px] tracking-[0.34em] uppercase text-white/28">
                            {TIER_DISPLAY[key]}
                          </span>
                          <div className="h-px flex-1 bg-white/[0.08]" />
                        </div>

                        <motion.div
                          variants={containerVariants}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true, amount: 0.05 }}
                          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                          {group.map((designer: any) => (
                            <DesignerGridCard
                              key={designer.id}
                              designer={designer}
                            />
                          ))}
                        </motion.div>
                      </div>
                    );
                  },
                )}

                {designers.length === 0 && (
                  <div className="text-center py-32">
                    <p className="font-sans text-sm tracking-[0.2em] text-white/25">
                      No designers found
                    </p>
                  </div>
                )}
              </>
            )}

            {/* ── Single tier — filtered view ───────────────────────── */}
            {!loading &&
              activeTier !== "All" &&
              (filteredDesigners.length === 0 ? (
                <div className="text-center py-32">
                  <p className="font-sans text-sm tracking-[0.2em] text-white/25">
                    No designers found
                  </p>
                </div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.05 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {filteredDesigners.map((designer: any) => (
                    <DesignerGridCard key={designer.id} designer={designer} />
                  ))}
                </motion.div>
              ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// ─── Inline dark card ─────────────────────────────────────────────────────────

function DesignerGridCard({ designer }: { designer: any }) {
  const tierLabel: Record<string, string> = {
    "high-end": "High-End",
    contemporary: "Contemporary",
    emerging: "Emerging",
  };

  const label = tierLabel[designer.tier] ?? (designer.tier as string);
  const estYear = designer.founded ? `Est. ${designer.founded}` : null;

  return (
    <motion.div variants={cardVariants}>
      <Link href={`/designers/${designer.slug}`} className="block group">
        {/* Card shell */}
        <div className="relative aspect-[3/4] rounded-[20px] overflow-hidden bg-[#111] border border-white/10">
          {/* Cover image — scale on hover */}
          {designer.cover_image ? (
            <Image
              src={designer.cover_image}
              alt={designer.name ?? ""}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            /* Placeholder when no image */
            <div className="absolute inset-0 bg-[#1a1814] flex items-center justify-center">
              <span className="font-serif text-6xl text-white/[0.08] select-none">
                {String(designer.name ?? "").charAt(0)}
              </span>
            </div>
          )}

          {/* Bottom gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/[0.18] to-transparent" />

          {/* Text at bottom of card */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <p className="font-sans text-[9px] tracking-[0.30em] uppercase text-white/45 mb-1.5">
              {label}
              {estYear ? (
                <>
                  <span className="mx-1.5 opacity-40">·</span>
                  {estYear}
                </>
              ) : null}
            </p>
            <h3 className="font-serif text-white text-[1.25rem] leading-tight">
              {designer.brand || designer.name}
            </h3>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
