"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Clock3, Search, Sparkles } from "lucide-react";
import { StickyNavbar, Footer } from "@/app/components";
import { fetchSearchIndex } from "@/app/components/search/searchEngine";

type SearchCategory = "articles" | "collections" | "designers" | "brands";
type SeasonFilter = "all" | "current" | "archive";

type SearchResultItem = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  image: string;
  href: string;
  category: SearchCategory;
  meta: string;
  searchText: string;
  tags: string[];
  seasonLabel?: string;
};

const TRENDING_TAGS = [
  "cashmere",
  "fw2025",
  "gobi",
  "ulaanbaatar",
  "wool",
  "emerald",
  "winter",
];
const RECENT_HISTORY_KEY = "anoce_explore_recent_searches";
const SYNONYM_MAP: Record<string, string[]> = {
  winter: ["fw", "fall winter", "autumn winter", "fall/winter"],
  summer: ["ss", "spring summer", "spring/summer"],
  cashmer: ["cashmere"],
  woolen: ["wool"],
  emerald: ["green"],
  green: ["emerald", "sage", "forest"],
  archive: ["past", "previous", "older"],
  current: ["latest", "new", "season"],
};

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const levenshtein = (a: string, b: string) => {
  const matrix = Array.from({ length: b.length + 1 }, (_, row) =>
    Array.from({ length: a.length + 1 }, (_, col) =>
      row === 0 ? col : col === 0 ? row : 0,
    ),
  );

  for (let row = 1; row <= b.length; row += 1) {
    for (let col = 1; col <= a.length; col += 1) {
      const cost = a[col - 1] === b[row - 1] ? 0 : 1;
      matrix[row][col] = Math.min(
        matrix[row - 1][col] + 1,
        matrix[row][col - 1] + 1,
        matrix[row - 1][col - 1] + cost,
      );
    }
  }

  return matrix[b.length][a.length];
};

const tokenize = (value: string) =>
  normalizeText(value).split(" ").filter(Boolean);

const expandQueryTerms = (query: string) => {
  const tokens = tokenize(query);
  const expanded = new Set(tokens);

  tokens.forEach((token) => {
    expanded.add(token);
    Object.entries(SYNONYM_MAP).forEach(([key, synonyms]) => {
      if (token === key || synonyms.includes(token)) {
        expanded.add(key);
        synonyms.forEach((synonym) => expanded.add(synonym));
      }
    });
  });

  return Array.from(expanded);
};

const exploreSpotlightFallback =
  "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1920&q=80";

const scoreResult = (item: SearchResultItem, query: string) => {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return 0;

  const searchBlob = normalizeText(item.searchText);
  const titleBlob = normalizeText(item.title);
  const subtitleBlob = normalizeText(item.subtitle);
  const metaBlob = normalizeText(item.meta);
  const itemTokens = tokenize(
    `${item.title} ${item.subtitle} ${item.searchText} ${item.tags.join(" ")}`,
  );
  const queryTerms = expandQueryTerms(query);

  let score = 0;

  queryTerms.forEach((term) => {
    if (!term) return;

    if (titleBlob.includes(term)) score += 20;
    if (subtitleBlob.includes(term)) score += 12;
    if (metaBlob.includes(term)) score += 10;
    if (searchBlob.includes(term)) score += 6;
    if (item.tags.some((tag) => normalizeText(tag).includes(term))) score += 8;
    if (item.seasonLabel && normalizeText(item.seasonLabel).includes(term))
      score += 10;

    itemTokens.forEach((token) => {
      const distance = levenshtein(term, token);
      if (distance === 1) score += 5;
      if (distance === 2 && term.length > 4) score += 2;
    });
  });

  if (titleBlob.startsWith(normalizedQuery)) score += 14;
  if (searchBlob.includes(normalizedQuery)) score += 8;

  return score;
};

const highlightMatch = (text: string, query: string) => {
  if (!query.trim()) return text;
  const terms = expandQueryTerms(query).sort((a, b) => b.length - a.length);
  const lowerText = text.toLowerCase();
  const matchedTerm = terms.find(
    (term) => term && lowerText.includes(term.toLowerCase()),
  );

  if (!matchedTerm) return text;

  const index = lowerText.indexOf(matchedTerm.toLowerCase());
  if (index === -1) return text;

  return (
    <>
      {text.slice(0, index)}
      <span className="text-white font-medium">
        {text.slice(index, index + matchedTerm.length)}
      </span>
      {text.slice(index + matchedTerm.length)}
    </>
  );
};

function ResultCard({
  item,
  query,
}: {
  item: SearchResultItem;
  query: string;
}) {
  return (
    <Link href={item.href} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-[34px] border border-white/[0.12] bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.035))] shadow-[0_18px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl transition-all duration-300 hover:border-white/[0.2] hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.05))]">
        <div className="p-3 pb-0">
          <div className="relative aspect-square overflow-hidden rounded-[22px]">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/18 to-transparent" />
            <div className="absolute left-4 top-4">
              <span className="rounded-full border border-white/40 bg-white/78 px-2.5 py-1 font-sans text-[9px] tracking-[0.22em] uppercase text-[#0A0A0A] backdrop-blur-sm">
                {item.category.slice(0, -1) || item.category}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <p className="mb-2 font-sans text-[10px] tracking-[0.18em] uppercase text-white/38">
            {item.meta}
          </p>
          <h3 className="line-clamp-2 font-serif text-2xl leading-[1.08] text-white [overflow-wrap:anywhere]">
            {highlightMatch(item.title, query)}
          </h3>
          <p className="mt-3 line-clamp-3 font-sans text-sm leading-relaxed text-white/58">
            {highlightMatch(item.subtitle, query)}
          </p>
        </div>
      </article>
    </Link>
  );
}

export default function ExplorePage() {
  const [searchIndex, setSearchIndex] = useState<SearchResultItem[]>([]);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | SearchCategory>(
    "all",
  );
  const [seasonFilter, setSeasonFilter] = useState<SeasonFilter>("all");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const deferredQuery = useDeferredValue(debouncedQuery);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    let active = true;

    async function loadSearchIndex() {
      try {
        const index = await fetchSearchIndex();
        if (!active) return;
        setSearchIndex(index);
      } catch {
        if (!active) return;
        setSearchIndex([]);
      }
    }

    loadSearchIndex();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(RECENT_HISTORY_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as string[];
      setRecentSearches(parsed.slice(0, 5));
    } catch {
      setRecentSearches([]);
    }
  }, []);

  useEffect(() => {
    const spotlightItems = searchIndex.filter(
      (item) => item.category === "collections" || item.category === "articles",
    );
    if (spotlightItems.length === 0) return;

    const interval = setInterval(() => {
      setSpotlightIndex((previous) => (previous + 1) % spotlightItems.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [searchIndex]);

  useEffect(() => {
    if (
      !debouncedQuery ||
      debouncedQuery.length < 2 ||
      typeof window === "undefined"
    )
      return;
    setRecentSearches((previous) => {
      const next = [
        debouncedQuery,
        ...previous.filter((item) => item !== debouncedQuery),
      ].slice(0, 5);
      window.localStorage.setItem(RECENT_HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, [debouncedQuery]);

  const spotlightItems = useMemo(
    () =>
      searchIndex.filter(
        (item) =>
          item.category === "collections" || item.category === "articles",
      ),
    [searchIndex],
  );

  const spotlightItem =
    spotlightItems[spotlightIndex % Math.max(spotlightItems.length, 1)];

  const rankedResults = useMemo(() => {
    if (deferredQuery.length < 2) return [];

    const filteredBySeason = searchIndex.filter((item) => {
      if (seasonFilter === "all") return true;
      if (item.category !== "collections") return true;
      if (!item.seasonLabel) return true;
      return seasonFilter === "current"
        ? item.seasonLabel.toLowerCase().includes("ss2025") ||
            item.seasonLabel.toLowerCase().includes("fw2025")
        : !item.seasonLabel.toLowerCase().includes("ss2025") &&
            !item.seasonLabel.toLowerCase().includes("fw2025");
    });

    return filteredBySeason
      .map((item) => ({ item, score: scoreResult(item, deferredQuery) }))
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score)
      .map((entry) => entry.item);
  }, [deferredQuery, seasonFilter, searchIndex]);

  const groupedResults = useMemo(() => {
    return {
      articles: rankedResults.filter((item) => item.category === "articles"),
      collections: rankedResults.filter(
        (item) => item.category === "collections",
      ),
      designers: rankedResults.filter((item) => item.category === "designers"),
      brands: rankedResults.filter((item) => item.category === "brands"),
    };
  }, [rankedResults]);

  const previewGroups = useMemo(
    () => ({
      articles: groupedResults.articles.slice(0, 3),
      collections: groupedResults.collections.slice(0, 3),
      designers: groupedResults.designers.slice(0, 3),
      brands: groupedResults.brands.slice(0, 3),
    }),
    [groupedResults],
  );

  const totalResults = rankedResults.length;
  const activeResults =
    activeCategory === "all" ? rankedResults : groupedResults[activeCategory];
  const showLiveResults = deferredQuery.length >= 2;
  const noResults = showLiveResults && totalResults === 0;
  const suggestedFallback = searchIndex
    .filter(
      (item) => item.category === "articles" || item.category === "collections",
    )
    .slice(0, 3);

  return (
    <div className="h-screen w-full overflow-hidden bg-[#0A0A0A]">
      <StickyNavbar />

      <main className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth snap-container pt-[72px] md:pt-[88px]">
        <section className="snap-start relative h-screen w-full overflow-hidden bg-[#0A0A0A]">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1920&q=80"
              alt="Explore background"
              fill
              className="object-cover opacity-30"
              priority
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(214,191,159,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(154,181,201,0.12),transparent_22%),linear-gradient(180deg,rgba(10,10,10,0.9)_0%,rgba(10,10,10,0.78)_45%,rgba(10,10,10,1)_100%)]" />
          </div>
          <div className="pointer-events-none absolute inset-0 opacity-[0.05]">
            <div className="absolute left-[8%] top-[18%] h-44 w-44 rounded-full bg-white/[0.06] blur-3xl" />
            <div className="absolute bottom-[18%] right-[12%] h-56 w-56 rounded-full bg-[#d6bf9f]/[0.08] blur-3xl" />
          </div>

          <div className="safe-shell relative z-10 flex h-full items-center justify-center py-12">
            <div className="mx-auto grid w-full max-w-[88rem] grid-cols-1 gap-10 xl:grid-cols-12 xl:items-center">
              <div className="min-w-0 overflow-hidden xl:col-span-7">
                <span className="mb-6 inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.32em] uppercase text-[#B7AEA9]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Explore the Archive
                </span>
                <h1 className="max-w-[11ch] font-serif text-[clamp(2.2rem,6.5vw,6.8rem)] leading-[0.92] tracking-[-0.03em] text-white [text-wrap:balance]">
                  Search fashion memory with a sharper editorial lens.
                </h1>
                <p className="mt-6 max-w-xl font-sans text-lg leading-relaxed text-white/64 md:text-xl">
                  Search collections, articles, designers, brands, materials,
                  colors, and seasonal terms with live grouped results.
                </p>

                <div className="mt-10 overflow-hidden rounded-[36px] border border-white/[0.12] bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] shadow-[0_28px_90px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
                  <div className="flex min-w-0 items-center gap-4 px-5 py-4 md:px-7 md:py-5">
                    <Search className="h-5 w-5 shrink-0 text-white/35" />
                    <input
                      ref={inputRef}
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search cashmere, FW2025, emerald wool, Gobi..."
                      className="min-w-0 flex-1 truncate bg-transparent font-serif text-xl leading-tight text-white outline-none placeholder:text-white/25 md:text-[1.8rem] xl:text-[2.05rem]"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5 border-t border-white/[0.08] bg-black/10 px-5 py-4 md:px-7">
                    <span className="min-w-[5rem] font-sans text-[10px] tracking-[0.26em] uppercase text-white/30">
                      Season
                    </span>
                    {[
                      { label: "All", value: "all" },
                      { label: "Current Season", value: "current" },
                      { label: "Past Archives", value: "archive" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          setSeasonFilter(option.value as SeasonFilter)
                        }
                        className={`rounded-full px-4 py-2 font-sans text-[10px] tracking-[0.22em] uppercase transition-all ${
                          seasonFilter === option.value
                            ? "bg-white/88 text-[#0A0A0A] shadow-[0_8px_30px_rgba(255,255,255,0.18)]"
                            : "border border-white/[0.12] bg-white/[0.03] text-white/58 hover:border-white/[0.28] hover:bg-white/[0.06] hover:text-white"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex max-w-4xl flex-wrap gap-3 pr-4">
                  {TRENDING_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="rounded-full border border-white/[0.12] bg-white/[0.04] px-4 py-2 font-sans text-[10px] tracking-[0.24em] uppercase text-[#B7AEA9] transition-all hover:border-white/[0.28] hover:bg-white/[0.08] hover:text-white"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="min-w-0 xl:col-span-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={spotlightItem?.id || "spotlight"}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -18 }}
                    transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden rounded-[36px] border border-white/[0.12] bg-[linear-gradient(180deg,rgba(255,255,255,0.11),rgba(255,255,255,0.035))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.26)] backdrop-blur-2xl md:p-6"
                  >
                    <div className="relative aspect-[1.08/1] overflow-hidden rounded-[28px]">
                      <Image
                        src={spotlightItem?.image || exploreSpotlightFallback}
                        alt={spotlightItem?.title || "Spotlight"}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
                    </div>
                    <div className="min-w-0 px-1 pt-5">
                      <span className="font-sans text-[10px] tracking-[0.28em] uppercase text-[#B7AEA9]">
                        Editor&apos;s Choice
                      </span>
                      <h2 className="mt-3 font-serif text-[clamp(1.4rem,2.6vw,3rem)] leading-[1.02] text-white [overflow-wrap:anywhere] [text-wrap:balance]">
                        {spotlightItem?.title}
                      </h2>
                      <p className="mt-3 max-w-[54ch] font-sans text-sm leading-relaxed text-white/58">
                        {spotlightItem?.subtitle}
                      </p>
                      <Link
                        href={spotlightItem?.href || "/archive"}
                        className="mt-6 inline-flex max-w-full items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.05] px-5 py-2.5 transition-all hover:border-white/[0.24] hover:bg-white/[0.08]"
                      >
                        <span className="font-sans text-[10px] tracking-[0.22em] uppercase whitespace-nowrap text-white/78">
                          Open Feature
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-white/52" />
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="min-w-0 rounded-[30px] border border-white/[0.12] bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                    <p className="mb-4 font-sans text-[10px] tracking-[0.28em] uppercase text-white/32">
                      Recent History
                    </p>
                    <div className="space-y-3">
                      {recentSearches.length > 0 ? (
                        recentSearches.map((item) => (
                          <button
                            key={item}
                            onClick={() => setQuery(item)}
                            className="flex w-full min-w-0 items-center gap-3 rounded-2xl px-3 py-2 text-left text-white/62 transition-all hover:bg-white/[0.06] hover:text-white"
                          >
                            <Clock3 className="h-4 w-4 text-white/28" />
                            <span className="truncate font-sans text-sm">
                              {item}
                            </span>
                          </button>
                        ))
                      ) : (
                        <p className="font-sans text-sm leading-relaxed text-white/42">
                          Your last searches will appear here after you start
                          exploring.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="min-w-0 rounded-[30px] border border-white/[0.12] bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                    <p className="mb-4 font-sans text-[10px] tracking-[0.28em] uppercase text-white/32">
                      Search Scope
                    </p>
                    <div className="space-y-3 font-sans text-sm leading-relaxed text-white/60">
                      <p>
                        Titles, body text, tags, materials, colors, seasons, and
                        brand metadata.
                      </p>
                      <p>
                        Typo-tolerant search and term mapping for inputs like
                        “winter”, “fw”, or “cashmer”.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="snap-start relative h-screen w-full overflow-hidden border-t border-white/[0.06] bg-[#0A0A0A] px-8 pb-10 pt-[108px] md:px-12 md:pb-12 md:pt-[132px] lg:px-16">
          <div className="mx-auto flex h-full min-h-0 w-full max-w-[88rem] flex-col">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 md:mb-10">
              <div>
                <span className="mb-4 block font-sans text-[10px] tracking-[0.3em] uppercase text-[#B7AEA9]">
                  {showLiveResults ? "Live Search" : "Discovery"}
                </span>
                <h2 className="font-serif text-3xl leading-[1.05] text-white md:text-4xl lg:text-5xl">
                  {showLiveResults
                    ? "Top Matches by Category"
                    : "Start with visual discovery"}
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    "all",
                    "articles",
                    "collections",
                    "designers",
                    "brands",
                  ] as const
                ).map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`rounded-full px-4 py-2 font-sans text-[10px] tracking-[0.22em] uppercase transition-all ${
                      activeCategory === category
                        ? "bg-white/88 text-[#0A0A0A] shadow-[0_8px_30px_rgba(255,255,255,0.16)]"
                        : "border border-white/[0.12] bg-white/[0.03] text-white/58 hover:border-white/[0.28] hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              {!showLiveResults && (
                <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-3">
                  {spotlightItems.slice(0, 3).map((item) => (
                    <ResultCard key={item.id} item={item} query="" />
                  ))}
                </div>
              )}

              {showLiveResults && !noResults && (
                <div className="space-y-12">
                  {(
                    [
                      "articles",
                      "collections",
                      "designers",
                      "brands",
                    ] as SearchCategory[]
                  )
                    .filter(
                      (category) =>
                        activeCategory === "all" || activeCategory === category,
                    )
                    .map((category) => {
                      const items = previewGroups[category];
                      if (items.length === 0) return null;

                      return (
                        <section key={category}>
                          <div className="mb-5 flex items-end justify-between gap-4">
                            <div>
                              <p className="font-sans text-[10px] tracking-[0.26em] uppercase text-white/34">
                                {category}
                              </p>
                              <h3 className="mt-2 font-serif text-2xl text-white [overflow-wrap:anywhere]">
                                {items.length} top matches
                              </h3>
                            </div>
                            <button
                              onClick={() => setActiveCategory(category)}
                              className="shrink-0 rounded-full border border-white/[0.12] bg-white/[0.03] px-4 py-2 font-sans text-[10px] tracking-[0.22em] uppercase text-white/56 transition-all hover:border-white/[0.24] hover:bg-white/[0.06] hover:text-white"
                            >
                              See all
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                            {items.map((item) => (
                              <ResultCard
                                key={item.id}
                                item={item}
                                query={deferredQuery}
                              />
                            ))}
                          </div>
                        </section>
                      );
                    })}
                </div>
              )}

              {noResults && (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <h3 className="font-serif text-4xl text-white [overflow-wrap:anywhere]">
                    No results for "{deferredQuery}"
                  </h3>
                  <p className="mt-4 max-w-xl font-sans text-lg leading-relaxed text-white/52">
                    Try a related material, season, color, or brand term. You
                    might also like these editorial picks.
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                    {["cashmere", "fw2025", "winter", "emerald", "wool"].map(
                      (suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => setQuery(suggestion)}
                          className="rounded-full border border-white/[0.12] bg-white/[0.04] px-4 py-2 font-sans text-[10px] tracking-[0.24em] uppercase text-[#B7AEA9] transition-all hover:border-white/[0.28] hover:bg-white/[0.08] hover:text-white"
                        >
                          {suggestion}
                        </button>
                      ),
                    )}
                  </div>
                  <div className="mt-10 grid w-full max-w-5xl grid-cols-1 gap-5 lg:grid-cols-3">
                    {suggestedFallback.map((item) => (
                      <ResultCard key={item.id} item={item} query="" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="snap-start relative h-screen w-full overflow-hidden border-t border-white/[0.06] bg-[#0F0D0B] px-8 pb-10 pt-[108px] md:px-12 md:pb-12 md:pt-[132px] lg:px-16">
          <div className="mx-auto flex h-full min-h-0 w-full max-w-[88rem] flex-col">
            <div className="mb-8 text-center md:mb-10">
              <span className="mb-4 block font-sans text-[10px] tracking-[0.3em] uppercase text-[#B7AEA9]">
                Full Results
              </span>
              <h2 className="font-serif text-3xl leading-[1.05] text-white md:text-4xl lg:text-5xl">
                {showLiveResults
                  ? `${totalResults} ranked matches`
                  : "Submit a term to unlock the full result grid"}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              {!showLiveResults ? (
                <div className="flex h-full items-center justify-center text-center">
                  <div className="max-w-2xl">
                    <p className="font-sans text-lg leading-relaxed text-white/48">
                      Search will expand into a scored result grid here, with
                      matches ranked higher for titles and rich metadata.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {activeResults.slice(0, 12).map((item) => (
                    <ResultCard
                      key={item.id}
                      item={item}
                      query={deferredQuery}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="snap-start h-screen w-full">
          <Footer />
        </div>
      </main>
    </div>
  );
}
