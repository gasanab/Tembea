"use client";

import { useState, useEffect, useCallback } from "react";
import { listingsApi } from "@/lib/api-client";
import type { Listing } from "@/types/api.types";

// Global event name for refetching listings
const REFETCH_LISTINGS_EVENT = "refetch-listings";

const toNumber = (value: unknown): number | undefined => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const hydrateListing = (listing: Listing): Listing => {
  const extraData = listing.extraData || {};
  const images = listing.images?.length
    ? listing.images
    : [extraData.bannerImage, extraData.profilePhoto].filter(
        (image): image is string => typeof image === "string" && image.length > 0
      );

  const amenities =
    listing.amenities ||
    extraData.amenities ||
    extraData.activities ||
    extraData.included ||
    extraData.features ||
    extraData.exhibits ||
    extraData.specialties ||
    [];

  const available =
    listing.available ??
    toNumber(extraData.roomsAvailable) ??
    toNumber(extraData.slotsAvailable) ??
    toNumber(extraData.ticketsAvailable) ??
    toNumber(extraData.tablesAvailable) ??
    toNumber(extraData.inStock) ??
    toNumber(extraData.seats);

  return {
    ...listing,
    images,
    amenities: Array.isArray(amenities) ? amenities : [],
    available,
  };
};

export function useListings(params?: {
  type?: string;
  region?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);
  const { type, region, featured, page, limit } = params ?? {};

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response: any = await listingsApi.getAll({
        type,
        region,
        featured,
        page,
        limit,
      });
      
      // Safely extract listings data - handle any response format
      let listingsData: Listing[] = [];
      let totalValue = 0;
      
      if (response && typeof response === 'object') {
        // Try multiple possible locations for listings array
        const listingsArray = 
          (Array.isArray(response.listings) ? response.listings : null) ||
          (Array.isArray(response.data?.listings) ? response.data.listings : null) ||
          [];
        
        // Safely map listings with error handling
        try {
          listingsData = listingsArray.map((listing: any) => {
            try {
              return hydrateListing(listing);
            } catch (e) {
              console.error('Error hydrating listing:', e, listing);
              return null;
            }
          }).filter((listing: Listing | null): listing is Listing => listing !== null);
        } catch (e) {
          console.error('Error mapping listings:', e);
          listingsData = [];
        }
        
        // Try multiple possible locations for total
        const rawTotal = response.total || response.data?.total || 0;
        totalValue = typeof rawTotal === 'number' ? rawTotal : 0;
      }
      
      setListings(listingsData);
      setTotal(totalValue);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError(err instanceof Error ? err : new Error("Failed to fetch listings"));
      setListings([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [type, region, featured, page, limit]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Listen for global refetch events (e.g., after admin publishes a listing)
  useEffect(() => {
    const handleRefetch = () => {
      fetchListings();
    };

    window.addEventListener(REFETCH_LISTINGS_EVENT, handleRefetch);
    return () => {
      window.removeEventListener(REFETCH_LISTINGS_EVENT, handleRefetch);
    };
  }, [fetchListings]);

  return { listings, isLoading, error, total, refetch: fetchListings };
}

export function useListing(id: string | null) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setListing(null);
      return;
    }

    const fetchListing = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response: any = await listingsApi.getOne(id);
        setListing(response?.id ? hydrateListing(response) : null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch listing"));
        setListing(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  return { listing, isLoading, error };
}

export function useFeaturedListings(limit: number = 8) {
  return useListings({ featured: true, limit });
}

export function useListingsByType(type: string, limit: number = 10) {
  return useListings({ type, limit });
}
