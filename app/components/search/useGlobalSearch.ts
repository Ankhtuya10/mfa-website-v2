"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  fetchSearchIndex,
  RECENT_HISTORY_KEY,
  groupRankedResults,
  rankResults,
} from "./searchEngine";
import type { SearchResultItem } from "./types";
import type { SearchCategory, SeasonFilter } from "./types";

export const useGlobalSearch = () => {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | SearchCategory>(
    "all",
  );
  const [seasonFilter, setSeasonFilter] = useState<SeasonFilter>("all");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const removeRecentSearch = (itemToRemove: string) => {
    setRecentSearches((previous) => {
      const next = previous.filter((item) => item !== itemToRemove);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(RECENT_HISTORY_KEY, JSON.stringify(next));
      }
      return next;
    });
  };
  const [searchIndex, setSearchIndex] = useState<SearchResultItem[]>([]);

  const deferredQuery = useDeferredValue(debouncedQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

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

  const rankedResults = useMemo(
    () => rankResults(deferredQuery, searchIndex, seasonFilter),
    [deferredQuery, searchIndex, seasonFilter],
  );
  const groupedResults = useMemo(
    () => groupRankedResults(rankedResults),
    [rankedResults],
  );

  const activeResults = useMemo(() => {
    return activeCategory === "all"
      ? rankedResults
      : groupedResults[activeCategory];
  }, [activeCategory, groupedResults, rankedResults]);

  const totalResults = rankedResults.length;
  const showLiveResults = deferredQuery.length >= 2;
  const noResults = showLiveResults && totalResults === 0;
  const suggestedFallback = useMemo(
    () =>
      searchIndex
        .filter(
          (item) =>
            item.category === "articles" || item.category === "collections",
        )
        .slice(0, 3),
    [searchIndex],
  );

  return {
    query,
    setQuery,
    activeCategory,
    setActiveCategory,
    seasonFilter,
    setSeasonFilter,
    deferredQuery,
    recentSearches,
    removeRecentSearch,
    rankedResults,
    groupedResults,
    activeResults,
    totalResults,
    showLiveResults,
    noResults,
    suggestedFallback,
    searchIndex,
  };
};
