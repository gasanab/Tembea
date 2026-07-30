"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, Download, Filter, Loader2 } from "lucide-react";
import { bookingsApi } from "@/lib/api-client";

const statusColor: Record<string, string> = {
  CONFIRMED: "bg-green-100 text-green-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-gray-100 text-gray-700",
  CANCELLED: "bg-red-100 text-red-700",
  REJECTED: "bg-red-100 text-red-700",
};

const formatDate = (value?: string) => {
  if (!value) return "TBD";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

export default function PartnerBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    setError(null);
    try {
      const data = await bookingsApi.getPartner();
      setBookings(Array.isArray(data) ? data : data.bookings || []);
    } catch {
      setError("Failed to load partner bookings.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (bookingId: string, status: string) => {
    setUpdatingId(bookingId);
    try {
      await bookingsApi.updateStatus(bookingId, status);
      await fetchBookings();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D5F5E3]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-[#111827]">Bookings</h1>
            <p className="text-[#6B7280] mt-1">Manage incoming and past guest bookings.</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-base btn-ghost btn-sm">
              <Filter size={14} aria-hidden /> Filter
            </button>
            <button className="btn-base btn-dark btn-sm">
              <Download size={14} aria-hidden /> Export
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={44} className="animate-spin text-[#145A32] mb-4" />
          <p className="text-gray-600 font-semibold">Loading bookings...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-black text-gray-900 mb-2">Could not load bookings</h2>
          <p className="text-gray-600 text-sm mb-6">{error}</p>
          <button onClick={fetchBookings} className="btn-base btn-dark inline-flex">
            Try Again
          </button>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-[#D5F5E3] p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-[#D5F5E3] flex items-center justify-center mx-auto mb-4">
            <CalendarCheck className="text-[#145A32]" size={28} />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">No bookings yet</h2>
          <p className="text-gray-500 text-sm">Bookings will appear here as travelers reserve your listings.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-[#D5F5E3] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#f8faf9] text-xs text-[#6B7280] uppercase font-bold">
              <tr>
                <th className="p-4">Booking ID</th>
                <th className="p-4">Guest</th>
                <th className="p-4 hidden md:table-cell">Listing</th>
                <th className="p-4 hidden lg:table-cell">Start</th>
                <th className="p-4 hidden lg:table-cell">End</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const details = booking.bookingData || {};
                const startDate = details.checkIn || details.date || details.pickupDate;
                const endDate = details.checkOut || details.returnDate;
                return (
                  <tr key={booking.id} className="border-t border-[#D5F5E3] hover:bg-[#f8faf9] transition">
                    <td className="p-4 font-black text-sm text-[#145A32]">{booking.id}</td>
                    <td className="p-4 font-bold text-sm">{booking.user?.name || "Guest"}</td>
                    <td className="p-4 text-sm hidden md:table-cell">{booking.listing?.name || "Listing"}</td>
                    <td className="p-4 text-sm hidden lg:table-cell">{formatDate(startDate)}</td>
                    <td className="p-4 text-sm hidden lg:table-cell">{formatDate(endDate)}</td>
                    <td className="p-4 font-black text-sm">${booking.amount}</td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor[booking.status] || "bg-gray-100 text-gray-700"}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {booking.status === "PENDING" ? (
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => updateStatus(booking.id, "APPROVED")}
                            disabled={updatingId === booking.id}
                            className="px-3 py-1.5 rounded-lg bg-[#145A32] text-white text-xs font-bold disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(booking.id, "REJECTED")}
                            disabled={updatingId === booking.id}
                            className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-bold disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-gray-400">No action</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
