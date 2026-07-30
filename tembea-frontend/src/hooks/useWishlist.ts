"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { wishlistApi } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import type { Wishlist } from "@/types/api.types";

interface UseWishlistReturn {
  wishlist: Wishlist[];
  isLoading: boolean;
  error: string | null;
  wishlistedIds: Set<string>;
  addToWishlist: (listingId: string) => Promise<void>;
  removeFromWishlist: (listingId: string) => Promise<void>;
  toggleWishlist: (listingId: string) => Promise<void>;
  isWishlisted: (listingId: string) => boolean;
  refreshWishlist: () => Promise<void>;
}

export function useWishlist(): UseWishlistReturn {
  const [wishlist, setWishlist] = useState<Wishlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Pull authLoading so we don't fire before the /auth/me check completes
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Create a Set for O(1) lookups
  const wishlistedIds = useMemo(
    () => new Set(wishlist.map((item) => item.listing.id)),
    [wishlist]
  );

  const fetchWishlist = useCallback(async () => {
    // Wait until AuthContext has finished its initial /auth/me check
    if (authLoading) return;

    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await wishlistApi.getAll();
      // Handle both array response and wrapped response
      const items = Array.isArray(data) ? data : data?.items || [];
      setWishlist(items);
    } catch (err) {
      // 401 is expected when the user's session expires — don't log as error
      const is401 =
        err instanceof Error &&
        (err.message.includes("401") || err.message.toLowerCase().includes("unauthorized"));

      if (!is401) {
        console.error("Error fetching wishlist:", err);
      }
      setError(err instanceof Error ? err.message : "Failed to fetch wishlist");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  // Fetch wishlist on mount and whenever auth state settles
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isWishlisted = useCallback(
    (listingId: string) => wishlistedIds.has(listingId),
    [wishlistedIds]
  );

  const addToWishlist = useCallback(
    async (listingId: string) => {
      if (!isAuthenticated) {
        setError("Please sign in to add items to wishlist");
        return;
      }

      setError(null);
      try {
        await wishlistApi.add(listingId);
        // Refresh to get full listing data
        await fetchWishlist();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to add to wishlist";
        setError(message);
        console.error("Error adding to wishlist:", err);
        throw err;
      }
    },
    [isAuthenticated, fetchWishlist]
  );

  const removeFromWishlist = useCallback(
    async (listingId: string) => {
      if (!isAuthenticated) {
        setError("Please sign in to manage wishlist");
        return;
      }

      setError(null);
      try {
        await wishlistApi.remove(listingId);
        // Optimistic update — remove from local state immediately
        setWishlist((prev) =>
          prev.filter((item) => item.listing.id !== listingId)
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to remove from wishlist";
        setError(message);
        console.error("Error removing from wishlist:", err);
        throw err;
      }
    },
    [isAuthenticated]
  );

  const toggleWishlist = useCallback(
    async (listingId: string) => {
      if (isWishlisted(listingId)) {
        await removeFromWishlist(listingId);
      } else {
        await addToWishlist(listingId);
      }
    },
    [isWishlisted, addToWishlist, removeFromWishlist]
  );

  const refreshWishlist = useCallback(async () => {
    await fetchWishlist();
  }, [fetchWishlist]);

  return {
    wishlist,
    isLoading,
    error,
    wishlistedIds,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isWishlisted,
    refreshWishlist,
  };
}
