"use client";

import { FormEvent, useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { ListingCard } from "@/components/cards/ListingCard";
import { Button } from "@/components/ui/Button";
import { useSearch } from "@/hooks/useSearch";
import type { SearchFilters } from "@/types/search.types";
import { FilterSidebar, searchCategories } from "./FilterSidebar";

type SmartSearchProps = {
  showResults?: boolean;
  compact?: boolean;
  initialFilters?: Partial<SearchFilters>;
};

const regions = [
  "All regions",
  "Kigali City",
  "Northern Province",
  "Southern Province",
  "Eastern Province",
  "Western Province",
];

export function SmartSearch({
  showResults = false,
  compact = false,
  initialFilters,
}: SmartSearchProps) {
  const {
    filters,
    updateFilter,
    clearFilters,
    results,
    total,
    totalPages,
    isLoading,
    error,
    retry,
  } = useSearch(initialFilters);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const invalidPriceRange =
    filters.minPrice > 0 &&
    filters.maxPrice > 0 &&
    filters.minPrice > filters.maxPrice;

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (invalidPriceRange) return;

    if (!showResults && typeof window !== "undefined") {
      const params = new URLSearchParams();
      if (filters.query.trim()) params.set("q", filters.query.trim());
      if (filters.category !== "all")
        params.set("category", filters.category);
      if (filters.region !== "All regions")
        params.set("region", filters.region);
      window.location.assign(`/explore?${params.toString()}`);
      return;
    }

    retry();
  };

  const firstResult = total === 0 ? 0 : (filters.page - 1) * filters.limit + 1;
  const lastResult = Math.min(filters.page * filters.limit, total);

  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      <form
        className="smart-search animate-soft-rise space-y-3"
        onSubmit={submitSearch}
        role="search"
      >
        <div
          className="flex gap-2 overflow-x-auto pb-2"
          aria-label="Service category"
        >
          {searchCategories.map((category) => (
            <button
              className={`search-tab ${
                filters.category === category.value ? "active" : ""
              }`}
              key={category.value}
              type="button"
              aria-pressed={filters.category === category.value}
              onClick={() => updateFilter("category", category.value)}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="grid gap-2 md:grid-cols-[1.5fr_1fr_auto_auto]">
          <label className="relative">
            <span className="sr-only">Search listings</span>
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-tembea-dark"
              size={18}
            />
            <input
              className="field-control pl-10"
              placeholder="Search by name, destination, or service"
              value={filters.query}
              onChange={(event) => updateFilter("query", event.target.value)}
            />
          </label>

          <label className="relative">
            <span className="sr-only">Region</span>
            <MapPin
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-tembea-dark"
              size={18}
            />
            <select
              className="field-control pl-10"
              value={filters.region}
              onChange={(event) => updateFilter("region", event.target.value)}
            >
              {regions.map((region) => (
                <option value={region} key={region}>
                  {region}
                </option>
              ))}
            </select>
          </label>

          <Button
            variant="ghost"
            icon={<SlidersHorizontal aria-hidden="true" size={18} />}
            type="button"
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden"
          >
            Filters
          </Button>
          <Button
            variant="dark"
            icon={<Search aria-hidden="true" size={18} />}
            type="submit"
            disabled={invalidPriceRange}
          >
            Search
          </Button>
        </div>

        {invalidPriceRange ? (
          <p className="text-sm font-semibold text-red-600" role="alert">
            Minimum price must not exceed maximum price.
          </p>
        ) : null}
      </form>

      {showResults ? (
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <div className="hidden lg:block">
            <FilterSidebar
              filters={filters}
              onFilterChange={updateFilter}
              onClear={clearFilters}
              resultCount={total}
            />
          </div>

          {showMobileFilters ? (
            <FilterSidebar
              filters={filters}
              onFilterChange={updateFilter}
              onClear={clearFilters}
              resultCount={total}
              onClose={() => setShowMobileFilters(false)}
              isMobile
            />
          ) : null}

          <section aria-live="polite" aria-busy={isLoading} className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-black">
                {isLoading
                  ? "Searching available listings..."
                  : total === 0
                    ? "No matching listings"
                    : `${firstResult}–${lastResult} of ${total} ${
                        total === 1 ? "listing" : "listings"
                      }`}
              </p>
              {total > 0 ? (
                <label className="flex items-center gap-2 text-sm font-semibold text-muted">
                  Results per page
                  <select
                    value={filters.limit}
                    onChange={(event) =>
                      updateFilter("limit", Number(event.target.value))
                    }
                    className="rounded-lg border border-gray-200 bg-white px-2 py-1"
                  >
                    {[12, 24, 36].map((limit) => (
                      <option value={limit} key={limit}>
                        {limit}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
            </div>

            {isLoading ? (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-600">
                <Loader2
                  aria-hidden="true"
                  className="mb-3 h-8 w-8 animate-spin text-emerald-700"
                />
                <p className="font-semibold">Loading current listings…</p>
              </div>
            ) : error ? (
              <div
                className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-red-100 bg-white p-6 text-center"
                role="alert"
              >
                <AlertCircle
                  aria-hidden="true"
                  className="mb-3 text-red-600"
                  size={32}
                />
                <h2 className="text-lg font-black text-gray-900">
                  Search is unavailable
                </h2>
                <p className="mt-2 max-w-md text-sm text-gray-600">
                  We could not reach the listing service. Your filters are still
                  saved, so you can try again.
                </p>
                <Button type="button" onClick={retry} className="mt-4">
                  Try again
                </Button>
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="auto-grid">
                  {results.map((listing) => (
                    <ListingCard listing={listing} key={listing.id} />
                  ))}
                </div>

                {totalPages > 1 ? (
                  <nav
                    className="flex items-center justify-center gap-3 pt-4"
                    aria-label="Search result pages"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={filters.page <= 1}
                      onClick={() => updateFilter("page", filters.page - 1)}
                      icon={<ChevronLeft aria-hidden="true" size={17} />}
                    >
                      Previous
                    </Button>
                    <span className="text-sm font-bold text-gray-700">
                      Page {filters.page} of {totalPages}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={filters.page >= totalPages}
                      onClick={() => updateFilter("page", filters.page + 1)}
                    >
                      <span className="inline-flex items-center gap-1">
                        Next <ChevronRight aria-hidden="true" size={17} />
                      </span>
                    </Button>
                  </nav>
                ) : null}
              </>
            ) : (
              <div className="min-h-64 rounded-2xl border border-gray-100 bg-white p-8 text-center">
                <Search
                  aria-hidden="true"
                  className="mx-auto mb-3 text-gray-400"
                  size={32}
                />
                <h2 className="text-lg font-black text-gray-900">
                  Nothing matches these filters
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
                  Try a broader destination, another service category, or clear
                  the price and rating filters.
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={clearFilters}
                  className="mt-4"
                >
                  Clear filters
                </Button>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}
