"use client";

import { useState, useEffect } from "react";
import { Star, Loader2, Edit2, Trash2, MessageSquare } from "lucide-react";
import Link from "next/link";
import { reviewsApi, bookingsApi } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";

function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={28}
            className={`transition-colors ${
              (hover || value) >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ClientReviewsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState<string | null>(null); // listingId
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) fetchBookings();
    else setIsLoading(false);
  }, [isAuthenticated]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const data: any = await bookingsApi.getAll();
      const list = Array.isArray(data) ? data : [];
      // Only show completed bookings where review can be written
      setBookings(list.filter((b: any) => b.status === "CONFIRMED" || b.status === "COMPLETED"));
    } catch (_) {
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async (listingId: string) => {
    if (!comment.trim() || rating === 0) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await reviewsApi.create({ listingId, rating, comment: comment.trim() });
      setSuccess(listingId);
      setShowForm(null);
      setComment("");
      setRating(5);
    } catch (err: any) {
      setError(err?.message || "Failed to submit review. You may have already reviewed this.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-4 lg:p-6">
        <div className="bg-white rounded-2xl p-16 text-center border border-[#D5F5E3] shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#D5F5E3] flex items-center justify-center mx-auto mb-4">
            <Star size={28} className="text-[#145A32]" />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">Sign in to write reviews</h2>
          <p className="text-gray-500 text-sm mb-6">Share your experience with the community.</p>
          <Link href="/sign-in" className="btn-base btn-dark inline-flex">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D5F5E3]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#D5F5E3] flex items-center justify-center text-[#145A32]">
            <MessageSquare size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#111827]">My Reviews</h1>
            <p className="text-[#6B7280] text-sm">Share your experiences to help other travelers.</p>
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="animate-spin text-[#145A32] mb-3" />
          <p className="text-gray-600 font-semibold">Loading your bookings...</p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && bookings.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-[#D5F5E3] p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-[#D5F5E3] flex items-center justify-center mx-auto mb-4">
            <Star size={28} className="text-[#145A32]" />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">No completed bookings</h2>
          <p className="text-gray-500 text-sm mb-6">
            Reviews can be written after your booking is confirmed or completed.
          </p>
          <Link href="/client/bookings" className="btn-base btn-dark inline-flex">
            View My Bookings
          </Link>
        </div>
      )}

      {/* Bookings to review */}
      {!isLoading && bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl shadow-sm border border-[#D5F5E3] p-6"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-black text-gray-900">
                    {booking.listing?.name || "Booking"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {booking.listing?.location} • {booking.type?.toLowerCase()}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        booking.status === "CONFIRMED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {booking.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      ${booking.amount}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {success === booking.listingId ? (
                    <span className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-700 text-sm font-bold">
                      ✓ Review submitted!
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setShowForm(showForm === booking.listingId ? null : booking.listingId);
                        setError(null);
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#145A32] text-white text-sm font-bold hover:bg-[#0e4426] transition-all"
                    >
                      <Edit2 size={14} />
                      {showForm === booking.listingId ? "Cancel" : "Write Review"}
                    </button>
                  )}
                </div>
              </div>

              {/* Review Form */}
              {showForm === booking.listingId && (
                <div className="border-t border-[#D5F5E3] pt-5 mt-2">
                  <h4 className="font-black text-gray-800 mb-4">Write your review</h4>

                  <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Rating
                    </label>
                    <StarSelector value={rating} onChange={setRating} />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Your Experience
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your honest experience to help other travelers..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#145A32] focus:ring-2 focus:ring-[#D5F5E3] outline-none font-semibold text-sm resize-none"
                    />
                  </div>

                  {error && (
                    <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200">
                      <p className="text-sm font-semibold text-red-600">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={() => handleSubmitReview(booking.listingId)}
                    disabled={isSubmitting || !comment.trim() || rating === 0}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#145A32] text-white font-bold hover:bg-[#0e4426] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Star size={16} />
                        Submit Review
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
