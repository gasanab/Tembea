"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  DollarSign,
  Plus,
  Star,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { analyticsApi, bookingsApi, listingsApi } from "@/lib/api-client";
import { formatCurrency } from "@/utils/formatters/currency";
import type { Booking, Listing } from "@/types/api.types";

type PartnerStats = {
  totalListings?: number;
  totalBookings?: number;
  totalRevenue?: number;
  totalNet?: number;
  avgRating?: number;
};

type PartnerBooking = Booking & {
  user?: { name?: string; email?: string };
};

type RecentReview = {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user?: { name?: string };
  listing?: { name?: string };
};

function readBookings(response: unknown): PartnerBooking[] {
  if (Array.isArray(response)) return response as PartnerBooking[];
  if (
    response &&
    typeof response === "object" &&
    "bookings" in response &&
    Array.isArray(response.bookings)
  ) {
    return response.bookings as PartnerBooking[];
  }
  return [];
}

function readListings(response: unknown): Listing[] {
  if (Array.isArray(response)) return response as Listing[];
  if (
    response &&
    typeof response === "object" &&
    "listings" in response &&
    Array.isArray(response.listings)
  ) {
    return response.listings as Listing[];
  }
  return [];
}

export default function PartnerDashboardPage() {
  const { user, partner } = useAuth();
  const [stats, setStats] = useState<PartnerStats>({});
  const [bookings, setBookings] = useState<PartnerBooking[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [reviews, setReviews] = useState<RecentReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [analytics, bookingResponse, listingResponse] = await Promise.all([
        analyticsApi.getPartnerAnalytics({}),
        bookingsApi.getPartner(),
        listingsApi.getMine(),
      ]);
      setStats(analytics?.stats ?? {});
      setReviews(
        Array.isArray(analytics?.recentReviews) ? analytics.recentReviews : [],
      );
      setBookings(readBookings(bookingResponse));
      setListings(readListings(listingResponse));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Partner dashboard data could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const publishedListings = listings.filter((listing) => listing.published).length;
  const pendingBookings = bookings.filter((booking) => booking.status === "PENDING").length;
  const cards = [
    {
      label: "Net paid earnings",
      value: formatCurrency(stats.totalNet ?? 0),
      detail: "After recorded commission",
      icon: DollarSign,
    },
    {
      label: "Bookings",
      value: stats.totalBookings ?? bookings.length,
      detail: `${pendingBookings} pending`,
      icon: CalendarCheck,
    },
    {
      label: "Published listings",
      value: publishedListings,
      detail: `${listings.length} total listings`,
      icon: Building2,
    },
    {
      label: "Average rating",
      value: (stats.avgRating ?? 0).toFixed(1),
      detail: reviews.length ? "Based on recorded reviews" : "No reviews yet",
      icon: Star,
    },
  ];

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <section className="rounded-2xl border border-[#D5F5E3] bg-white p-6 shadow-sm">
        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#2ECC71]">
              Partner dashboard
            </p>
            <h1 className="mt-1 text-3xl font-black text-[#111827] lg:text-4xl">
              {partner?.businessName || user?.name}
            </h1>
            <p className="mt-2 font-semibold text-[#6B7280]">
              Review your recorded listings, bookings, earnings and customer feedback.
            </p>
          </div>
          <Link
            className="flex items-center gap-2 rounded-2xl bg-[#2ECC71] px-5 py-3 font-black text-[#145A32] transition hover:bg-[#27AE60]"
            href="/partner/listings?mode=create"
          >
            <Plus size={19} aria-hidden />
            Create listing
          </Link>
        </div>
      </section>

      {error && (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700"
          role="alert"
        >
          <span>{error}</span>
          <button className="underline" onClick={loadDashboard} type="button">
            Try again
          </button>
        </div>
      )}

      <section aria-label="Partner totals" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              className="rounded-2xl border border-[#D5F5E3] bg-white p-5 shadow-sm"
              key={card.label}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D5F5E3] text-[#145A32]">
                <Icon size={21} aria-hidden />
              </span>
              <p className="mt-4 text-sm font-extrabold text-[#6B7280]">{card.label}</p>
              <p className="text-3xl font-black text-[#111827]">
                {isLoading ? "—" : card.value}
              </p>
              <p className="mt-1 text-sm font-semibold text-[#6B7280]">{card.detail}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-2xl border border-[#D5F5E3] bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-[#D5F5E3] p-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#2ECC71]">
                Bookings
              </p>
              <h2 className="text-2xl font-black text-[#111827]">Recent reservations</h2>
            </div>
            <Link
              className="flex items-center gap-1 text-sm font-bold text-[#145A32] hover:underline"
              href="/partner/bookings"
            >
              View all <ArrowUpRight size={14} aria-hidden />
            </Link>
          </div>
          {isLoading && (
            <p className="p-10 text-center text-sm text-[#6B7280]" role="status">
              Loading bookings...
            </p>
          )}
          {!isLoading && bookings.length === 0 && (
            <div className="p-10 text-center">
              <CalendarCheck className="mx-auto text-[#145A32]" size={30} aria-hidden />
              <p className="mt-3 font-bold text-[#111827]">No bookings yet</p>
            </div>
          )}
          {!isLoading && bookings.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#f8faf9] text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                  <tr>
                    <th className="p-4">Guest</th>
                    <th className="p-4">Listing</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 5).map((booking) => (
                    <tr className="border-t border-[#D5F5E3]" key={booking.id}>
                      <td className="p-4">
                        <p className="font-bold text-[#111827]">
                          {booking.user?.name || "Client"}
                        </p>
                        <p className="text-xs text-[#6B7280]">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="p-4 text-sm">{booking.listing?.name || "Listing"}</td>
                      <td className="p-4">
                        <span className="rounded-full bg-[#D5F5E3] px-2.5 py-1 text-xs font-bold text-[#145A32]">
                          {booking.status}
                        </span>
                      </td>
                      <td className="p-4 font-black">
                        {formatCurrency(booking.amount || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[#D5F5E3] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#2ECC71]">
                Reviews
              </p>
              <h2 className="text-2xl font-black text-[#111827]">Recent feedback</h2>
            </div>
            <Link
              className="text-sm font-bold text-[#145A32] hover:underline"
              href="/partner/reviews"
            >
              View all
            </Link>
          </div>
          {isLoading && (
            <p className="py-8 text-center text-sm text-[#6B7280]" role="status">
              Loading reviews...
            </p>
          )}
          {!isLoading && reviews.length === 0 && (
            <div className="py-10 text-center">
              <Clock3 className="mx-auto text-[#145A32]" size={29} aria-hidden />
              <p className="mt-3 font-bold text-[#111827]">No customer reviews yet</p>
            </div>
          )}
          <div className="mt-5 space-y-3">
            {reviews.map((review) => (
              <article
                className="rounded-xl border border-[#D5F5E3] p-4"
                key={review.id}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-[#111827]">
                    {review.user?.name || "Customer"}
                  </p>
                  <span className="flex items-center gap-1 text-sm font-black text-[#145A32]">
                    <Star fill="currentColor" size={14} aria-hidden />
                    {review.rating}
                  </span>
                </div>
                <p className="mt-1 text-xs font-semibold text-[#6B7280]">
                  {review.listing?.name || "Listing"} ·{" "}
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
                {review.comment && (
                  <p className="mt-2 line-clamp-3 text-sm text-[#4B5563]">{review.comment}</p>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Link
          className="flex items-center gap-3 rounded-2xl border border-[#D5F5E3] bg-white p-4 font-bold hover:shadow-md"
          href="/partner/listings"
        >
          <Building2 className="text-[#145A32]" size={20} aria-hidden />
          Manage listings
        </Link>
        <Link
          className="flex items-center gap-3 rounded-2xl border border-[#D5F5E3] bg-white p-4 font-bold hover:shadow-md"
          href="/partner/earnings"
        >
          <DollarSign className="text-[#145A32]" size={20} aria-hidden />
          Earnings and payouts
        </Link>
        <Link
          className="flex items-center gap-3 rounded-2xl border border-[#D5F5E3] bg-white p-4 font-bold hover:shadow-md"
          href="/partner/messages"
        >
          <CheckCircle2 className="text-[#145A32]" size={20} aria-hidden />
          Customer messages
        </Link>
      </section>
    </div>
  );
}
