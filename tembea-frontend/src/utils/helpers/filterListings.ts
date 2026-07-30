import type { Listing } from "@/types/product.types";
import type { SearchFilters } from "@/types/search.types";

export function filterListings(listings: Listing[], filters: SearchFilters) {
  return listings.filter((listing) => {
    const query = filters.query.trim().toLowerCase();
    const matchesQuery =
      !query ||
      listing.title.toLowerCase().includes(query) ||
      listing.location.toLowerCase().includes(query) ||
      listing.tags.some((tag) => tag.toLowerCase().includes(query));
    const matchesCategory = filters.category === "all" || listing.category === filters.category;
    const matchesRegion = filters.region === "All regions" || listing.region === filters.region;
    const matchesRating = listing.rating >= filters.minRating;
    const matchesMinimumPrice =
      filters.minPrice <= 0 || listing.price >= filters.minPrice;
    const matchesMaximumPrice =
      filters.maxPrice <= 0 || listing.price <= filters.maxPrice;

    return (
      matchesQuery &&
      matchesCategory &&
      matchesRegion &&
      matchesRating &&
      matchesMinimumPrice &&
      matchesMaximumPrice
    );
  });
}
