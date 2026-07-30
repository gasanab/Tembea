import { searchApi } from "@/lib/api-client";
import type { Listing, ListingType } from "@/types/api.types";
import type {
  SearchFilters,
  SearchRequest,
  SearchResponse,
} from "@/types/search.types";

export const categoryToListingType: Record<
  Exclude<SearchFilters["category"], "all">,
  ListingType
> = {
  hotels: "ACCOMMODATION",
  apartments: "ACCOMMODATION",
  restaurants: "RESTAURANTS",
  transport: "TRANSPORT",
  parks: "PARKS",
  tours: "TOURS",
  events: "EVENTS",
  marketplace: "MARKETPLACE",
  experiences: "TOURS",
  "tour-guides": "GUIDES",
  museums: "MUSEUMS",
  lakes: "PARKS",
};

const asFiniteNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeListing = (listing: Listing): Listing => ({
  ...listing,
  images: Array.isArray(listing.images) ? listing.images.filter(Boolean) : [],
  price: asFiniteNumber(listing.price),
  rating: asFiniteNumber(listing.rating),
  reviewCount: asFiniteNumber(listing.reviewCount),
  extraData:
    listing.extraData && typeof listing.extraData === "object"
      ? listing.extraData
      : {},
});

export function toSearchRequest(filters: SearchFilters): SearchRequest {
  const query = filters.query.trim();
  const region =
    filters.region && filters.region !== "All regions"
      ? filters.region
      : undefined;

  return {
    ...(query ? { q: query } : {}),
    ...(filters.category !== "all"
      ? { type: categoryToListingType[filters.category] }
      : {}),
    ...(region ? { region } : {}),
    ...(filters.minPrice > 0 ? { minPrice: filters.minPrice } : {}),
    ...(filters.maxPrice > 0 ? { maxPrice: filters.maxPrice } : {}),
    ...(filters.minRating > 0 ? { minRating: filters.minRating } : {}),
    page: filters.page,
    limit: filters.limit,
  };
}

export async function searchListings(
  filters: SearchFilters,
  signal?: AbortSignal,
): Promise<SearchResponse> {
  // ApiClient does not expose a signal option yet. The request generation guard in
  // useSearch prevents stale responses from replacing newer results.
  void signal;
  const response = await searchApi.get(toSearchRequest(filters));

  return {
    results: Array.isArray(response.results)
      ? response.results.map(normalizeListing)
      : [],
    total: asFiniteNumber(response.total),
    page: Math.max(1, asFiniteNumber(response.page, filters.page)),
    limit: Math.max(1, asFiniteNumber(response.limit, filters.limit)),
    query: response.query,
  };
}
