"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, MapPin, Users, CreditCard, ChevronRight, Loader2 } from "lucide-react";
import { bookingsApi } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";

const typeToCategory: Record<string, string> = {
  ACCOMMODATION: "hotels",
  PARKS: "parks",
  EVENTS: "events",
  MARKETPLACE: "marketplace",
  RESTAURANTS: "restaurants",
  TOURS: "tours",
  TRANSPORT: "transport",
  MUSEUMS: "museums",
  MEMORIAL_SITES: "memorial-sites",
  GUIDES: "tour-guides",
};

export default function ClientBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchBookings = async () => {
    try {
      const data = await bookingsApi.getAll();
      setBookings(Array.isArray(data) ? data : data.bookings || []);
    } catch (err) {
      setError("Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-emerald-100 text-emerald-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D5F5E3]">
          <h1 className="text-2xl font-black text-[#111827]">My Bookings</h1>
          <p className="text-[#6B7280] mt-1">View and manage your reservations</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#D5F5E3] p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-[#D5F5E3] flex items-center justify-center mx-auto mb-4">
            <Calendar className="text-[#145A32]" size={28} />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">Sign in to view your bookings</h2>
          <p className="text-gray-500 text-sm mb-6">
            Keep track of all your reservations in one place.
          </p>
          <Link href="/sign-in" className="btn-base btn-dark inline-flex">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D5F5E3]">
          <h1 className="text-2xl font-black text-[#111827]">My Bookings</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={48} className="animate-spin text-[#145A32] mb-4" />
          <p className="text-gray-600 font-semibold">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D5F5E3]">
          <h1 className="text-2xl font-black text-[#111827]">My Bookings</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-black text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 text-sm mb-6">{error}</p>
          <button onClick={fetchBookings} className="btn-base btn-dark inline-flex">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D5F5E3]">
        <h1 className="text-2xl font-black text-[#111827]">My Bookings</h1>
        <p className="text-[#6B7280] mt-1">View and manage your reservations</p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-[#D5F5E3] p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-[#D5F5E3] flex items-center justify-center mx-auto mb-4">
            <Calendar className="text-[#145A32]" size={28} />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">No bookings yet</h2>
          <p className="text-gray-500 text-sm mb-6">
            Start exploring and book your first experience in Rwanda.
          </p>
          <Link href="/explore" className="btn-base btn-dark inline-flex">
            Explore Listings
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl shadow-sm border border-[#D5F5E3] p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-black text-gray-900">
                      {booking.listing?.name || "Booking"}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Booking ID: {booking.id}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-emerald-600">${booking.amount}</div>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="font-semibold">
                    {booking.listing?.location || "Location TBD"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users size={16} className="text-gray-400" />
                  <span className="font-semibold capitalize">{booking.type?.toLowerCase()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CreditCard size={16} className="text-gray-400" />
                  <span className="font-semibold capitalize">
                    {booking.payment?.status || "Unpaid"}
                  </span>
                </div>
              </div>

              {booking.bookingData && (
                <div className="p-4 rounded-xl bg-gray-50 mb-4">
                  <p className="text-sm font-semibold text-gray-700">
                    {booking.bookingData.specialRequests || "No special requests"}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Link
                  href={`/booking/${typeToCategory[booking.listing?.type] || "hotels"}/${booking.listingId}`}
                  className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-center text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  View Listing
                </Link>
                {booking.status === "PENDING" && (
                  <button
                    onClick={async () => {
                      if (confirm("Are you sure you want to cancel this booking?")) {
                        try {
                          await bookingsApi.cancel(booking.id);
                          fetchBookings();
                        } catch (err) {
                          alert("Failed to cancel booking");
                        }
                      }
                    }}
                    className="flex-1 py-2.5 rounded-xl border-2 border-red-200 text-center text-sm font-bold text-red-600 hover:bg-red-50 transition-all"
                  >
                    Cancel Booking
                  </button>
                )}
                {booking.status === "PENDING" && (
                  <Link
                    href={`/payment/${booking.id}`}
                    className="flex-1 py-2.5 rounded-xl bg-[#145A32] text-white text-center text-sm font-bold hover:bg-[#0e4426] transition-all"
                  >
                    Complete Payment
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
