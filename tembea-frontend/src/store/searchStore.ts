import type { SearchFilters } from "@/types/search.types";

export const searchStore: SearchFilters = {
  query: "",
  category: "all",
  region: "All regions",
  minPrice: 0,
  minRating: 0,
  maxPrice: 0,
  page: 1,
  limit: 12,
};
