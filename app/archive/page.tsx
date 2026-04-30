"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { StickyNavbar, Footer } from "@/app/components";
import { EmptyState } from "@/app/components/shared/EmptyState";
import { getCollections, getDesigners } from "@/lib/supabase/queries";

const canonicalSeasons = ["SS", "FW", "Pre-Fall", "Resort"] as const;

const categoryKeywords: Record<string, string[]> = {
  Outerwear: ["outerwear", "coat", "jacket", "parka", "trench", "bomber"],
  Knitwear: ["knit", "knitwear", "cardigan", "sweater", "turtleneck"],
  Accessories: [
    "accessory",
    "bag",
    "belt",
    "scarf",
    "hat",
    "jewelry",
    "jewellery",
  ],
  Footwear: [
    "footwear",
    "shoe",
    "boot",
    "sneaker",
    "loafer",
    "heel",
    "sandals",
  ],
};

const materialKeywords: Record<string, string[]> = {
  Cashmere: ["cashmere"],
  Silk: ["silk"],
  "Technical Nylon": ["nylon", "technical"],
  "Distressed Denim": ["denim", "distressed"],
  Wool: ["wool"],
  Leather: ["leather"],
};

const getDesignerName = (collection: any) =>
  String(
    collection.designer_name || collection.designerName || "Unknown Brand",
  );

const normalizeSeason = (value: string) => {
  const text = value.toLowerCase();
  if (text.includes("pre-fall") || text.includes("prefall")) return "Pre-Fall";
  if (text.includes("resort") || text.includes("cruise")) return "Resort";
  if (text.includes("spring") || text.includes("summer") || text.includes("ss"))
    return "SS";
  if (
    text.includes("fall") ||
    text.includes("autumn") ||
    text.includes("winter") ||
    text.includes("fw")
  )
    return "FW";
  return "";
};

const getCollectionSeason = (collection: any) => {
  const explicitSeason = normalizeSeason(String(collection.season || ""));
  if (explicitSeason) return explicitSeason;
  return normalizeSeason(String(collection.slug || ""));
};

const getCollectionYear = (collection: any) => {
  const directYear = Number(collection.year);
  if (Number.isFinite(directYear) && directYear > 0) return directYear;
  const match = String(collection.slug || "").match(/(19|20)\d{2}/);
  return match ? Number(match[0]) : null;
};

const getSearchText = (collection: any) =>
  `${collection.title || ""} ${collection.description || ""}`.toLowerCase();

const deriveCategories = (collection: any) => {
  const categories = new Set<string>();
  const searchText = getSearchText(collection);
  const looks = Array.isArray(collection.looks) ? collection.looks : [];

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => searchText.includes(keyword)))
      categories.add(category);
  }

  for (const look of looks) {
    const tags = Array.isArray(look?.tags) ? look.tags : [];
    for (const tag of tags) {
      const normalizedTag = String(tag).toLowerCase();
      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some((keyword) => normalizedTag.includes(keyword)))
          categories.add(category);
      }
    }
  }

  return Array.from(categories);
};

const deriveMaterials = (collection: any) => {
  const materials = new Set<string>();
  const searchText = getSearchText(collection);
  const looks = Array.isArray(collection.looks) ? collection.looks : [];

  for (const [material, keywords] of Object.entries(materialKeywords)) {
    if (keywords.some((keyword) => searchText.includes(keyword)))
      materials.add(material);
  }

  for (const look of looks) {
    const lookMaterials = Array.isArray(look?.materials) ? look.materials : [];
    for (const rawMaterial of lookMaterials) {
      const normalizedMaterial = String(rawMaterial).toLowerCase();
      for (const [material, keywords] of Object.entries(materialKeywords)) {
        if (keywords.some((keyword) => normalizedMaterial.includes(keyword)))
          materials.add(material);
      }
    }
  }

  return Array.from(materials);
};

type CollectionMeta = {
  key: string;
  collection: any;
  year: number | null;
  season: string;
  designer: string;
  categories: string[];
  materials: string[];
};

const getCollectionCoverImage = (collection: any) => {
  const coverImage = String(
    collection.cover_image || collection.coverImage || "",
  ).trim();
  return coverImage;
};

const getSeasonAndYearLabel = (item: CollectionMeta) => {
  const seasonLabel = item.season || "Season";
  return item.year ? `${seasonLabel} ${item.year}` : seasonLabel;
};

const ArchiveCollectionCard = ({ item }: { item: CollectionMeta }) => {
  const collectionTitle = String(
    item.collection.title || item.designer || "Collection",
  );
  const coverImage = getCollectionCoverImage(item.collection);

  return (
    <Link
      href={`/archive/${item.collection.slug}`}
      className="group block h-full min-w-0"
    >
      <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-[20px] border border-white/10 bg-[#100E0C]/95 transition-all duration-300 hover:-translate-y-1 hover:border-white/22 hover:bg-[#17130F]">
        <div className="relative aspect-[16/10] overflow-hidden bg-[#0D0B09]">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(20,17,14,0.82)_42%,rgba(0,0,0,0.96))]" />
          {coverImage ? (
            <Image
              src={coverImage}
              alt={collectionTitle}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/34 via-transparent to-black/8" />
        </div>

        <div className="flex min-h-[6.5rem] flex-1 flex-col border-t border-white/[0.07] p-4">
          <p className="mb-2 truncate font-sans text-[10px] tracking-[0.16em] uppercase text-white/42">
            {item.designer} / {getSeasonAndYearLabel(item)}
          </p>
          <h3 className="line-clamp-2 font-serif text-[19px] leading-[1.08] text-white md:text-[21px]">
            {collectionTitle}
          </h3>
          <span className="mt-auto pt-3 font-sans text-[9px] tracking-[0.22em] uppercase text-white/34">
            View Collection
          </span>
        </div>
      </article>
    </Link>
  );
};

export default function ArchivePage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [designers, setDesigners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [selectedDesigners, setSelectedDesigners] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [cols, dsgns] = await Promise.all([
          getCollections(),
          getDesigners(),
        ]);
        setCollections(cols);
        setDesigners(dsgns);
      } catch {
        setCollections([]);
        setDesigners([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const archiveCollections = useMemo(() => {
    const bySlug = new Map<string, any>();
    for (const collection of collections) {
      const key = String(collection.slug || collection.id);
      if (!bySlug.has(key)) bySlug.set(key, collection);
    }
    return Array.from(bySlug.values());
  }, [collections]);

  const collectionMeta = useMemo<CollectionMeta[]>(
    () =>
      archiveCollections.map((collection) => ({
        key: String(collection.slug || collection.id),
        collection,
        year: getCollectionYear(collection),
        season: getCollectionSeason(collection),
        designer: getDesignerName(collection),
        categories: deriveCategories(collection),
        materials: deriveMaterials(collection),
      })),
    [archiveCollections],
  );

  const yearOptions = useMemo(
    () =>
      Array.from(
        new Set(
          collectionMeta
            .map((item) => item.year)
            .filter((year): year is number => year !== null),
        ),
      ).sort((a, b) => b - a),
    [collectionMeta],
  );

  const seasonOptions = useMemo(() => {
    const found = Array.from(
      new Set(collectionMeta.map((item) => item.season).filter(Boolean)),
    );
    const extras = found.filter(
      (season) =>
        !canonicalSeasons.includes(season as (typeof canonicalSeasons)[number]),
    );
    return [...canonicalSeasons, ...extras];
  }, [collectionMeta]);

  const designerOptions = useMemo(
    () =>
      Array.from(new Set(collectionMeta.map((item) => item.designer))).sort(
        (a, b) => a.localeCompare(b),
      ),
    [collectionMeta],
  );

  const categoryOptions = useMemo(
    () =>
      Array.from(
        new Set(collectionMeta.flatMap((item) => item.categories)),
      ).sort((a, b) => a.localeCompare(b)),
    [collectionMeta],
  );

  const materialOptions = useMemo(
    () =>
      Array.from(
        new Set(collectionMeta.flatMap((item) => item.materials)),
      ).sort((a, b) => a.localeCompare(b)),
    [collectionMeta],
  );

  const filteredMeta = useMemo(
    () =>
      collectionMeta.filter((item) => {
        const yearMatch =
          selectedYears.length === 0 ||
          (item.year !== null && selectedYears.includes(item.year));
        const seasonMatch =
          selectedSeasons.length === 0 || selectedSeasons.includes(item.season);
        const designerMatch =
          selectedDesigners.length === 0 ||
          selectedDesigners.includes(item.designer);
        const categoryMatch =
          selectedCategories.length === 0 ||
          selectedCategories.some((category) =>
            item.categories.includes(category),
          );
        const materialMatch =
          selectedMaterials.length === 0 ||
          selectedMaterials.some((material) =>
            item.materials.includes(material),
          );

        return (
          yearMatch &&
          seasonMatch &&
          designerMatch &&
          categoryMatch &&
          materialMatch
        );
      }),
    [
      collectionMeta,
      selectedYears,
      selectedSeasons,
      selectedDesigners,
      selectedCategories,
      selectedMaterials,
    ],
  );

  // ── derived data for new sections ──────────────────────────────────────
  const featuredCollection = useMemo(
    () => archiveCollections[0] ?? null,
    [archiveCollections],
  );

  const allLooks = useMemo(
    () =>
      archiveCollections.flatMap((col) =>
        (Array.isArray(col.looks) ? col.looks : []).map((look: any) => ({
          id: String(look.id || Math.random()),
          number: look.number,
          image: String(look.image || ""),
          description: String(look.description || ""),
          materials: Array.isArray(look.materials) ? look.materials : [],
          collectionTitle: String(col.title || ""),
          collectionSlug: String(col.slug || ""),
          designerName: getDesignerName(col),
          season: String(col.season || ""),
          year: Number(col.year) || 0,
        })),
      ),
    [archiveCollections],
  );

  const totalLooks = allLooks.length;
  const totalCollections = archiveCollections.length;
  const totalDesigners = new Set(archiveCollections.map(getDesignerName)).size;
  const yearsActive = useMemo(() => {
    const years = archiveCollections
      .map(getCollectionYear)
      .filter((y): y is number => y !== null);
    if (years.length === 0) return "–";
    const min = Math.min(...years);
    const max = Math.max(...years);
    return min === max ? String(min) : `${min}–${max}`;
  }, [archiveCollections]);

  const activeFilterCount =
    selectedYears.length +
    selectedSeasons.length +
    selectedDesigners.length +
    selectedCategories.length +
    selectedMaterials.length;

  const clearAllFilters = () => {
    setSelectedYears([]);
    setSelectedSeasons([]);
    setSelectedDesigners([]);
    setSelectedCategories([]);
    setSelectedMaterials([]);
  };

  const toggleValue = <T,>(
    value: T,
    setter: (next: (previous: T[]) => T[]) => void,
  ) => {
    setter((previous) =>
      previous.includes(value)
        ? previous.filter((item) => item !== value)
        : [...previous, value],
    );
  };

  const FilterGroup = <T extends string | number>({
    label,
    values,
    selected,
    onToggle,
  }: {
    label: string;
    values: T[];
    selected: T[];
    onToggle: (value: T) => void;
  }) => (
    <div>
      <p className="mb-2.5 font-sans text-[11px] tracking-[0.18em] uppercase text-white/48">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {values.length === 0 ? (
          <span className="font-sans text-xs text-white/32">No options</span>
        ) : (
          values.map((value) => {
            const isSelected = selected.includes(value);
            return (
              <button
                key={String(value)}
                type="button"
                onClick={() => onToggle(value)}
                className={`rounded-full border px-3 py-2 font-sans text-[10px] leading-none tracking-[0.1em] uppercase transition-all ${
                  isSelected
                    ? "border-transparent bg-white/90 text-black"
                    : "border-white/10 bg-white/[0.04] text-white/55 hover:border-white/24 hover:bg-white/[0.07] hover:text-white/82"
                }`}
              >
                {String(value)}
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full overflow-hidden bg-[#090807]">
      <StickyNavbar />
      <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth snap-container">
        <section className="snap-start relative h-screen w-full overflow-hidden bg-[#090807]">
          {/* full-bleed background image */}
          {featuredCollection &&
            getCollectionCoverImage(featuredCollection) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.4, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={getCollectionCoverImage(featuredCollection)}
                  alt=""
                  fill
                  priority
                  className="object-cover"
                />
              </motion.div>
            )}
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.48)_62%,rgba(0,0,0,0.82)_100%)]" />

          <div
            className="relative z-10 flex h-full items-center justify-center pt-24"
            style={{
              paddingLeft: "var(--safe-edge-x)",
              paddingRight: "var(--safe-edge-x)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto max-w-5xl text-center"
            >
              <span className="mb-5 block font-sans text-[10px] tracking-[0.36em] uppercase text-white/58">
                Mongolian Fashion Archive
              </span>
              <h1 className="mb-5 font-serif text-6xl leading-none text-white md:text-7xl lg:text-8xl">
                The Archive
              </h1>
              <p className="mx-auto max-w-2xl font-sans text-base leading-relaxed text-white/62 md:text-lg">
                Every season, every collection, every look preserved in one
                editorial index.
              </p>
            </motion.div>
          </div>

          {/* scroll cue */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2"
          >
            <span className="font-sans text-[9px] uppercase tracking-[3.6px] text-white/58">
              Scroll
            </span>
            <div className="h-[42px] w-px bg-gradient-to-b from-white/58 to-white/10" />
          </motion.div>
        </section>

        <section className="snap-start relative h-screen w-full overflow-hidden bg-[#080706]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_74%_12%,rgba(212,201,184,0.055),transparent_30%),radial-gradient(circle_at_18%_88%,rgba(116,86,58,0.055),transparent_32%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.025),transparent_22%,rgba(0,0,0,0.28))]" />

          <div
            className="absolute z-10 grid min-h-0 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] gap-4 lg:grid-cols-[17rem_minmax(0,1fr)] lg:grid-rows-1"
            style={{
              left: "var(--safe-edge-x)",
              right: "var(--safe-edge-x)",
              top: "calc(84px + var(--safe-edge-y))",
              bottom: "calc(var(--safe-edge-y) + 6px)",
            }}
          >
            <aside className="flex min-h-0 max-h-[30vh] flex-col overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.035] shadow-[0_24px_90px_rgba(0,0,0,0.3)] backdrop-blur-xl lg:max-h-none">
              <div className="shrink-0 border-b border-white/[0.07] px-8 py-5">
                <span className="mb-2 block pl-1 font-sans text-[10px] tracking-[0.24em] uppercase text-white/38">
                  Archive Index
                </span>
                <h2 className="pl-1 font-serif text-[24px] leading-none text-white">
                  Filter Archive
                </h2>
                <p className="mt-2 font-sans text-[13px] leading-relaxed text-white/50">
                  Narrow by season, brand, and material.
                </p>
              </div>

              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-8 py-5">
                <FilterGroup
                  label="Year"
                  values={yearOptions}
                  selected={selectedYears}
                  onToggle={(year) => toggleValue(year, setSelectedYears)}
                />
                <FilterGroup
                  label="Season"
                  values={seasonOptions}
                  selected={selectedSeasons}
                  onToggle={(season) => toggleValue(season, setSelectedSeasons)}
                />
                <FilterGroup
                  label="Designer / Brand"
                  values={designerOptions}
                  selected={selectedDesigners}
                  onToggle={(designer) =>
                    toggleValue(designer, setSelectedDesigners)
                  }
                />
                <FilterGroup
                  label="Category"
                  values={categoryOptions}
                  selected={selectedCategories}
                  onToggle={(category) =>
                    toggleValue(category, setSelectedCategories)
                  }
                />
                <FilterGroup
                  label="Material"
                  values={materialOptions}
                  selected={selectedMaterials}
                  onToggle={(material) =>
                    toggleValue(material, setSelectedMaterials)
                  }
                />
              </div>

              {activeFilterCount > 0 && (
                <div className="shrink-0 border-t border-white/[0.07] px-6 py-3">
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="w-full rounded-full border border-white/14 bg-white/[0.04] px-4 py-2.5 font-sans text-[10px] tracking-[0.18em] uppercase text-white/68 transition-all hover:border-white/28 hover:bg-white/[0.08] hover:text-white"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </aside>

            <main className="min-h-0 overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(22,18,15,0.94)_0%,rgba(10,9,8,0.96)_100%)] shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl">
              <div className="flex h-full min-h-0 flex-col">
                <div className="flex shrink-0 flex-col gap-3 border-b border-white/[0.08] px-9 py-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <span className="mb-1.5 block pl-1 font-sans text-[10px] tracking-[0.28em] uppercase text-white/34">
                      Collection Snapshot
                    </span>
                    <h3 className="pl-1 font-serif text-[32px] leading-none text-white md:text-[38px]">
                      Archive Results
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-2 font-sans text-[10px] leading-none tracking-[0.16em] uppercase text-white/68">
                      {filteredMeta.length} collections
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 font-sans text-[10px] leading-none tracking-[0.16em] uppercase text-white/46">
                      {activeFilterCount > 0
                        ? `${activeFilterCount} active`
                        : "Unfiltered"}
                    </span>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 md:px-6 md:py-5">
                  {loading ? (
                    <div className="flex h-full items-center justify-center">
                      <span className="font-sans text-sm tracking-[0.22em] uppercase text-[#B7AEA9]">
                        Loading...
                      </span>
                    </div>
                  ) : filteredMeta.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                      <EmptyState
                        title="No collections found"
                        subtitle="Try changing your filters to widen the archive search."
                        ghostText="EMPTY"
                        action={{ label: "Clear Filters", href: "/archive" }}
                      />
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.08 }}
                      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                      className="grid min-h-full grid-cols-1 gap-4 auto-rows-[minmax(17rem,1fr)] sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                    >
                      {filteredMeta.map((item) => (
                        <ArchiveCollectionCard key={item.key} item={item} />
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>
            </main>
          </div>
        </section>

        {/* ── Season in Focus ─────────────────────────────────────────────── */}
        {featuredCollection && (
          <section className="snap-start relative h-screen w-full overflow-hidden bg-[#060504]">
            {/* background image blurred */}
            {getCollectionCoverImage(featuredCollection) && (
              <div className="absolute inset-0">
                <Image
                  src={getCollectionCoverImage(featuredCollection)}
                  alt=""
                  fill
                  className="object-cover opacity-20 blur-sm scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30" />
              </div>
            )}
            <div
              className="relative z-10 flex h-full items-center"
              style={{
                paddingLeft: "var(--safe-edge-x)",
                paddingRight: "var(--safe-edge-x)",
              }}
            >
              <div className="grid w-full max-w-[90rem] mx-auto grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
                {/* Left — meta */}
                <motion.div
                  initial={{ opacity: 0, x: -28 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="mb-4 block font-sans text-[10px] tracking-[0.36em] uppercase text-white/46">
                    Season in Focus
                  </span>
                  <p className="mb-3 font-sans text-[11px] tracking-[0.26em] uppercase text-[#C4A882]">
                    {getDesignerName(featuredCollection)} ·{" "}
                    {String(featuredCollection.season || "")}{" "}
                    {String(featuredCollection.year || "")}
                  </p>
                  <h2 className="mb-6 font-serif text-5xl leading-[1.02] text-white md:text-6xl lg:text-[5.5rem]">
                    {featuredCollection.title}
                  </h2>
                  <p className="mb-8 max-w-xl font-sans text-base leading-relaxed text-white/58 md:text-lg">
                    {String(featuredCollection.description || "").slice(0, 220)}
                    {String(featuredCollection.description || "").length > 220
                      ? "…"
                      : ""}
                  </p>
                  <div className="mb-10 flex gap-8">
                    <div>
                      <span className="block font-sans text-[10px] tracking-[0.22em] uppercase text-white/38">
                        Looks
                      </span>
                      <span className="font-serif text-3xl text-white">
                        {(featuredCollection.looks || []).length}
                      </span>
                    </div>
                    <div>
                      <span className="block font-sans text-[10px] tracking-[0.22em] uppercase text-white/38">
                        Season
                      </span>
                      <span className="font-serif text-3xl text-white">
                        {String(featuredCollection.season || "–")}
                      </span>
                    </div>
                    <div>
                      <span className="block font-sans text-[10px] tracking-[0.22em] uppercase text-white/38">
                        Year
                      </span>
                      <span className="font-serif text-3xl text-white">
                        {String(featuredCollection.year || "–")}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/archive/${featuredCollection.slug}`}
                    className="inline-flex items-center gap-3 border border-[#C4A882]/50 bg-[#C4A882]/10 px-7 py-3.5 font-sans text-[11px] tracking-[0.28em] uppercase text-[#C4A882] transition-all hover:bg-[#C4A882]/20 hover:border-[#C4A882]"
                  >
                    View Collection
                    <span className="h-px w-6 bg-current" />
                  </Link>
                </motion.div>

                {/* Right — image stack */}
                <motion.div
                  initial={{ opacity: 0, x: 28 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{
                    duration: 0.75,
                    ease: [0.22, 1, 0.36, 1],
                    delay: 0.12,
                  }}
                  className="hidden lg:flex gap-3 h-[72vh] max-h-[600px]"
                >
                  {/* Main cover */}
                  <div className="relative flex-[2] overflow-hidden rounded-[18px]">
                    {getCollectionCoverImage(featuredCollection) ? (
                      <Image
                        src={getCollectionCoverImage(featuredCollection)}
                        alt={featuredCollection.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[#1A1714]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                  {/* Side looks */}
                  <div className="flex flex-1 flex-col gap-3">
                    {(featuredCollection.looks || [])
                      .slice(0, 3)
                      .map((look: any, i: number) => (
                        <div
                          key={i}
                          className="relative flex-1 overflow-hidden rounded-[14px]"
                        >
                          {look.image ? (
                            <Image
                              src={look.image}
                              alt={`Look ${look.number}`}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-[#1A1714]" />
                          )}
                          <div className="absolute inset-0 bg-black/20" />
                          <span className="absolute bottom-2 left-3 font-mono text-[9px] tracking-[0.2em] text-white/50">
                            {String(look.number).padStart(2, "0")}
                          </span>
                        </div>
                      ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        )}

        {/* ── The Houses ──────────────────────────────────────────────────────── */}
        {designers.length > 0 && (
          <section className="snap-start relative h-screen w-full overflow-hidden bg-[#080604]">
            {/* header row */}
            <div
              className="absolute left-0 right-0 top-0 z-20 flex items-end justify-between"
              style={{
                paddingLeft: "var(--safe-edge-x)",
                paddingRight: "var(--safe-edge-x)",
                paddingTop: "calc(88px + var(--safe-edge-y))",
                paddingBottom: "1.5rem",
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="mb-2 block font-sans text-[10px] tracking-[0.36em] uppercase text-white/40">
                  Behind the Collections
                </span>
                <h2 className="font-serif text-4xl leading-none text-white md:text-5xl">
                  The Houses
                </h2>
              </motion.div>
              <Link
                href="/designers"
                className="hidden font-sans text-[10px] tracking-[0.28em] uppercase text-white/40 transition-colors hover:text-white/80 md:block"
              >
                All Designers →
              </Link>
            </div>

            {/* full-bleed panels */}
            <div className="absolute inset-0 flex">
              {designers.map((d: any, i: number) => {
                const dCollections = archiveCollections.filter(
                  (c) =>
                    (c.designer_slug || c.designerSlug) === (d.slug || d._id),
                );
                const totalDLooks = dCollections.reduce(
                  (sum: number, c: any) =>
                    sum + (Array.isArray(c.looks) ? c.looks.length : 0),
                  0,
                );
                const tierColors: Record<string, string> = {
                  "high-end": "#C4A882",
                  contemporary: "#A8B8C4",
                  emerging: "#B4C4A8",
                };
                const tierLabel: Record<string, string> = {
                  "high-end": "High-End",
                  contemporary: "Contemporary",
                  emerging: "Emerging",
                };
                const accentColor = tierColors[d.tier] || "#C4A882";
                return (
                  <motion.div
                    key={d.id || d._id}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: false, amount: 0.15 }}
                    transition={{
                      duration: 0.7,
                      delay: i * 0.12,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="relative flex-1 overflow-hidden"
                  >
                    <Link
                      href={`/designers/${d.slug}`}
                      className="group block h-full"
                    >
                      {/* cover image */}
                      {d.cover_image || d.coverImage ? (
                        <Image
                          src={d.cover_image || d.coverImage}
                          alt={d.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[#1A1714]" />
                      )}

                      {/* heavy gradient from bottom */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/10" />
                      {/* left separator line between panels */}
                      {i > 0 && (
                        <div className="absolute inset-y-0 left-0 w-px bg-white/10" />
                      )}

                      {/* bottom content */}
                      <div className="absolute bottom-0 left-0 right-0 p-7">
                        <span
                          className="mb-3 block font-sans text-[9px] tracking-[0.3em] uppercase"
                          style={{ color: accentColor + "cc" }}
                        >
                          {tierLabel[d.tier] || d.tier}
                        </span>
                        <h3 className="mb-4 font-serif text-2xl leading-tight text-white transition-colors group-hover:text-[#EDE5D8] md:text-3xl">
                          {d.name}
                        </h3>
                        <div className="mb-5 flex flex-wrap gap-x-5 gap-y-1">
                          <span className="font-sans text-[11px] text-white/50">
                            <span className="font-serif text-lg text-white/80">
                              {dCollections.length}
                            </span>{" "}
                            {dCollections.length === 1
                              ? "collection"
                              : "collections"}
                          </span>
                          <span className="font-sans text-[11px] text-white/50">
                            <span className="font-serif text-lg text-white/80">
                              {totalDLooks}
                            </span>{" "}
                            looks
                          </span>
                          {d.founded && (
                            <span className="font-sans text-[11px] text-white/40">
                              Est. {d.founded}
                            </span>
                          )}
                        </div>
                        <span
                          className="inline-flex items-center gap-2 border-b pb-0.5 font-sans text-[10px] tracking-[0.24em] uppercase transition-all group-hover:gap-3"
                          style={{
                            borderColor: accentColor + "66",
                            color: accentColor + "99",
                          }}
                        >
                          View Profile
                          <span className="h-px w-4 bg-current transition-all group-hover:w-6" />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── All Looks ───────────────────────────────────────────────────────── */}
        {allLooks.length > 0 && (
          <section className="snap-start relative h-screen w-full overflow-hidden bg-[#0A0807]">
            <div
              className="absolute z-10 flex h-full flex-col"
              style={{
                left: "var(--safe-edge-x)",
                right: "var(--safe-edge-x)",
                top: "calc(80px + var(--safe-edge-y))",
                bottom: "var(--safe-edge-y)",
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.1 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="mb-5 flex shrink-0 items-end justify-between"
              >
                <div>
                  <span className="mb-2 block font-sans text-[10px] tracking-[0.36em] uppercase text-white/38">
                    Lookbook Index
                  </span>
                  <h2 className="font-serif text-4xl leading-none text-white md:text-5xl">
                    Every Look
                  </h2>
                </div>
                <span className="font-sans text-[11px] tracking-[0.2em] uppercase text-white/32">
                  {totalLooks} total
                </span>
              </motion.div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {allLooks.map((look, i) => (
                    <motion.div
                      key={look.id}
                      initial={{ opacity: 0, scale: 0.96 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, amount: 0.1 }}
                      transition={{ duration: 0.4, delay: (i % 12) * 0.03 }}
                    >
                      <Link
                        href={`/archive/${look.collectionSlug}`}
                        className="group relative block overflow-hidden rounded-[12px] bg-[#111]"
                      >
                        <div className="relative aspect-[2/3] overflow-hidden">
                          {look.image ? (
                            <Image
                              src={look.image}
                              alt={`Look ${look.number}`}
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-[#1E1B18]" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-3">
                            <p className="font-mono text-[9px] tracking-[0.18em] uppercase text-white/60">
                              Look {look.number}
                            </p>
                            <p className="truncate font-sans text-[10px] text-white/80 leading-tight">
                              {look.collectionTitle}
                            </p>
                          </div>
                        </div>
                        <span className="absolute left-2.5 top-2.5 font-mono text-[8px] tracking-[0.18em] text-white/30">
                          {String(look.number).padStart(2, "0")}
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── By the Numbers ──────────────────────────────────────────────────── */}
        <section className="snap-start relative h-screen w-full overflow-hidden bg-[#080604]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_60%,rgba(116,86,58,0.1),transparent_44%),radial-gradient(ellipse_at_80%_20%,rgba(196,168,130,0.06),transparent_40%)]" />
          <div
            className="relative z-10 flex h-full flex-col items-center justify-center text-center"
            style={{
              paddingLeft: "var(--safe-edge-x)",
              paddingRight: "var(--safe-edge-x)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.25 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-5xl"
            >
              <span className="mb-6 block font-sans text-[10px] tracking-[0.4em] uppercase text-white/38">
                The Archive in Numbers
              </span>
              <h2 className="mb-16 font-serif text-5xl leading-none text-white md:text-6xl">
                By the Numbers
              </h2>

              <div className="grid grid-cols-2 gap-px border border-white/8 bg-white/8 lg:grid-cols-4">
                {[
                  {
                    value: totalCollections,
                    label: "Collections",
                    sub: "in the archive",
                  },
                  { value: totalLooks, label: "Looks", sub: "documented" },
                  {
                    value: totalDesigners,
                    label: "Designers",
                    sub: "represented",
                  },
                  {
                    value: yearsActive,
                    label: "Years",
                    sub: "of fashion history",
                  },
                ].map(({ value, label, sub }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{
                      duration: 0.55,
                      delay: i * 0.08,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="flex flex-col items-center justify-center gap-2 bg-[#080604] px-6 py-12"
                  >
                    <span
                      className="leading-none text-white font-serif"
                      style={{
                        fontSize:
                          String(value).length > 4
                            ? "clamp(1.6rem,3.5vw,3rem)"
                            : "clamp(3rem,7vw,6rem)",
                      }}
                    >
                      {value}
                    </span>
                    <span className="font-sans text-sm tracking-[0.22em] uppercase text-[#C4A882]">
                      {label}
                    </span>
                    <span className="font-sans text-[11px] text-white/32">
                      {sub}
                    </span>
                  </motion.div>
                ))}
              </div>

              <p className="mx-auto mt-14 max-w-2xl font-sans text-base leading-relaxed text-white/42">
                The Mongolian Fashion Archive preserves every season, every
                look, and every story from Mongolia&apos;s most important
                fashion houses — documented for the generation that comes next.
              </p>

              <div className="mt-10 flex items-center justify-center gap-6">
                <Link
                  href="/editorial"
                  className="border-b border-white/24 pb-1 font-sans text-[11px] tracking-[0.28em] uppercase text-white/60 transition-colors hover:border-white/60 hover:text-white"
                >
                  Read Editorial
                </Link>
                <span className="text-white/20">·</span>
                <Link
                  href="/designers"
                  className="border-b border-white/24 pb-1 font-sans text-[11px] tracking-[0.28em] uppercase text-white/60 transition-colors hover:border-white/60 hover:text-white"
                >
                  Meet the Designers
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="snap-start h-screen w-full">
          <Footer />
        </div>
      </div>
    </div>
  );
}
