"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { searchListings } from "@/services/search.service";
import type { SearchFilters } from "@/types/search.types";
import type { ListingCategory } from "@/types/product.types";

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  query: "",
  category: "all",
  region: "All regions",
  minPrice: 0,
  maxPrice: 0,
  minRating: 0,
  page: 1,
  limit: 12,
};

const validCategories = new Set<SearchFilters["category"]>([
  "all",
  "hotels",
  "apartments",
  "restaurants",
  "transport",
  "parks",
  "tours",
  "events",
  "marketplace",
  "experiences",
  "tour-guides",
  "museums",
  "lakes",
]);

const parseNonNegativeNumber = (
  value: string | null,
  fallback: number,
): number => {
  if (value === null || value.trim() === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

function filtersFromLocation(base: SearchFilters): SearchFilters {
  if (typeof window === "undefined") return base;

  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");

  return {
    ...base,
    query: params.get("q") ?? base.query,
    category:
      category && validCategories.has(category as SearchFilters["category"])
        ? (category as ListingCategory | "all")
        : base.category,
    region: params.get("region") ?? base.region,
    minPrice: parseNonNegativeNumber(
      params.get("minPrice"),
      base.minPrice,
    ),
    maxPrice: parseNonNegativeNumber(
      params.get("maxPrice"),
      base.maxPrice,
    ),
    minRating: parseNonNegativeNumber(
      params.get("minRating"),
      base.minRating,
    ),
    page: Math.max(1, parseNonNegativeNumber(params.get("page"), base.page)),
    limit: Math.min(
      50,
      Math.max(1, parseNonNegativeNumber(params.get("limit"), base.limit)),
    ),
  };
}

function writeFiltersToLocation(filters: SearchFilters) {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  [
    "q",
    "category",
    "region",
    "minPrice",
    "maxPrice",
    "minRating",
    "page",
    "limit",
    // Remove legacy home-search parameters that were never supported by the API.
    "tab",
    "checkIn",
    "checkOut",
  ].forEach((key) => params.delete(key));

  if (filters.query.trim()) params.set("q", filters.query.trim());
  if (filters.category !== "all") params.set("category", filters.category);
  if (filters.region !== "All regions") params.set("region", filters.region);
  if (filters.minPrice > 0) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice > 0) params.set("maxPrice", String(filters.maxPrice));
  if (filters.minRating > 0)
    params.set("minRating", String(filters.minRating));
  if (filters.page > 1) params.set("page", String(filters.page));
  if (filters.limit !== DEFAULT_SEARCH_FILTERS.limit)
    params.set("limit", String(filters.limit));

  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  window.history.replaceState(window.history.state, "", nextUrl);
}

export function useSearch(initial?: Partial<SearchFilters>) {
  const initialFilters = useMemo(
    () => ({
      query: initial?.query ?? DEFAULT_SEARCH_FILTERS.query,
      category: initial?.category ?? DEFAULT_SEARCH_FILTERS.category,
      region: initial?.region ?? DEFAULT_SEARCH_FILTERS.region,
      minPrice: initial?.minPrice ?? DEFAULT_SEARCH_FILTERS.minPrice,
      maxPrice: initial?.maxPrice ?? DEFAULT_SEARCH_FILTERS.maxPrice,
      minRating: initial?.minRating ?? DEFAULT_SEARCH_FILTERS.minRating,
      page: initial?.page ?? DEFAULT_SEARCH_FILTERS.page,
      limit: initial?.limit ?? DEFAULT_SEARCH_FILTERS.limit,
    }),
    [
      initial?.category,
      initial?.limit,
      initial?.maxPrice,
      initial?.minPrice,
      initial?.minRating,
      initial?.page,
      initial?.query,
      initial?.region,
    ],
  );
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [results, setResults] = useState<
    Awaited<ReturnType<typeof searchListings>>["results"]
  >([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [requestVersion, setRequestVersion] = useState(0);
  const activeRequest = useRef(0);

  useEffect(() => {
    const applyLocation = () => {
      setFilters(filtersFromLocation(initialFilters));
      setIsReady(true);
    };

    applyLocation();
    window.addEventListener("popstate", applyLocation);
    return () => window.removeEventListener("popstate", applyLocation);
  }, [initialFilters]);

  useEffect(() => {
    if (!isReady) return;
    writeFiltersToLocation(filters);
  }, [filters, isReady]);

  useEffect(() => {
    if (!isReady) return;

    const version = ++activeRequest.current;
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await searchListings(filters);
        if (version !== activeRequest.current) return;
        setResults(response.results);
        setTotal(response.total);
      } catch (caught) {
        if (version !== activeRequest.current) return;
        setResults([]);
        setTotal(0);
        setError(
          caught instanceof Error
            ? caught
            : new Error("Search is unavailable right now."),
        );
      } finally {
        if (version === activeRequest.current) setIsLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [filters, isReady, requestVersion]);

  const updateFilter = useCallback(
    <Key extends keyof SearchFilters>(
      key: Key,
      value: SearchFilters[Key],
    ) => {
      setFilters((current) => ({
        ...current,
        [key]: value,
        ...(key !== "page" ? { page: 1 } : {}),
      }));
    },
    [],
  );

  const clearFilters = useCallback(() => {
    setFilters({
      ...initialFilters,
      query: "",
      region: "All regions",
      minPrice: 0,
      maxPrice: 0,
      minRating: 0,
      page: 1,
    });
  }, [initialFilters]);

  const retry = useCallback(() => {
    setRequestVersion((current) => current + 1);
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / filters.limit));

  useEffect(() => {
    if (filters.page > totalPages && total > 0) {
      setFilters((current) => ({ ...current, page: totalPages }));
    }
  }, [filters.page, total, totalPages]);

  return {
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    results,
    total,
    totalPages,
    isLoading,
    error,
    retry,
  };
}
