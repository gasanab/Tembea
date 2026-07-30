"use client";

import Link from "next/link";
import { Heart, Search, ArrowRight, Loader2 } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { ListingCard } from "@/components/cards/ListingCard";

export default function WishlistPage() {
  const { wishlist, isLoading, error } = useWishlist();

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="tembea-container">
        <div className="mb-8">
          <span className="section-kicker">Your Wishlist</span>
          <h1 className="text-3xl font-black text-gray-900 mt-2">Saved Places</h1>
          <p className="text-gray-500 mt-1">Properties, experiences, and services you've saved for later.</p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={48} className="animate-spin text-[#145A32] mb-4" />
            <p className="text-gray-600 font-semibold">Loading your wishlist...</p>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Heart size={28} className="text-red-600" aria-hidden />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-600 text-sm mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="btn-base btn-dark inline-flex"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && wishlist.length === 0 && (
          <div className="bg-white rounded-2xl shadow-soft p-16 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Heart size={28} className="text-red-400" aria-hidden />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 text-sm mb-6">
              Start exploring and tap the heart icon on any listing to save it here.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/explore" className="btn-base btn-dark">
                <Search size={16} aria-hidden /> Explore listings
              </Link>
              <Link href="/experiences" className="btn-base btn-ghost">
                View experiences <ArrowRight size={16} aria-hidden />
              </Link>
            </div>
          </div>
        )}

        {/* Wishlist items */}
        {!isLoading && !error && wishlist.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <ListingCard key={item.id} listing={item.listing} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
