import type { ListingCategory } from "./product.types";
import type { Listing, ListingType } from "./api.types";

export type SearchFilters = {
  query: string;
  category: ListingCategory | "all";
  region: string;
  minPrice: number;
  minRating: number;
  maxPrice: number;
  page: number;
  limit: number;
};

export type SearchRequest = {
  q?: string;
  type?: ListingType;
  region?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  page?: number;
  limit?: number;
};

export type SearchResponse = {
  results: Listing[];
  total: number;
  page: number;
  limit: number;
  query?: string;
};
