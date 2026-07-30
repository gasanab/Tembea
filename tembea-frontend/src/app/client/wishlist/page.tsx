"use client";

import Link from "next/link";
import { Compass, ArrowRight, Loader2 } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { ListingCard } from "@/components/cards/ListingCard";

export default function ClientWishlistPage() {
  const { wishlist, isLoading, error } = useWishlist();

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D5F5E3]">
        <h1 className="text-2xl font-black text-[#111827]">My Wishlist</h1>
        <p className="text-[#6B7280] mt-1">Experiences and adventures on your bucket list.</p>
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
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
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
        <div className="bg-white rounded-2xl shadow-sm border border-[#D5F5E3] p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-[#D5F5E3] flex items-center justify-center mx-auto mb-4">
            <Compass size={28} className="text-[#145A32]" aria-hidden />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 text-sm mb-6">
            Browse experiences and add them to your wishlist to plan your next Rwanda adventure.
          </p>
          <Link href="/experiences" className="btn-base btn-dark inline-flex">
            Browse experiences <ArrowRight size={16} aria-hidden />
          </Link>
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
  );
}
