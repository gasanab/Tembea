"use client";

import { useCallback, useEffect, useState } from "react";
import { listingsApi } from "@/lib/api-client";
import type { Listing, ListingType } from "@/types/api.types";

export function readListingCollection(response: unknown): Listing[] {
  if (Array.isArray(response)) return response as Listing[];
  if (
    response &&
    typeof response === "object" &&
    "listings" in response &&
    Array.isArray(response.listings)
  ) {
    return response.listings as Listing[];
  }
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    Array.isArray(response.data)
  ) {
    return response.data as Listing[];
  }
  return [];
}

export function usePartnerListings(type: ListingType) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListingId, setSelectedListingId] = useState("");
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [listingError, setListingError] = useState("");

  const loadListings = useCallback(async () => {
    setIsLoadingListings(true);
    setListingError("");
    try {
      const matching = readListingCollection(await listingsApi.getMine()).filter(
        (listing) => listing.type === type,
      );
      setListings(matching);
      setSelectedListingId((current) =>
        matching.some((listing) => listing.id === current)
          ? current
          : matching[0]?.id ?? "",
      );
    } catch (error) {
      setListingError(
        error instanceof Error ? error.message : "Listings could not be loaded.",
      );
    } finally {
      setIsLoadingListings(false);
    }
  }, [type]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  return {
    listings,
    selectedListingId,
    setSelectedListingId,
    isLoadingListings,
    listingError,
    reloadListings: loadListings,
  };
}
