"use client";

import { useState, useEffect } from "react";
import { CalendarCheck, Filter, Download, MoreHorizontal, Eye } from "lucide-react";
import { adminApi } from "@/lib/api-client";

const statusColor: Record<string, string> = {
  CONFIRMED: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-gray-100 text-gray-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getBookings();
      const bookingsList = Array.isArray(response) ? response : response?.data || response?.bookings || [];
      setBookings(bookingsList);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#145A32]"></div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D5F5E3]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-[#111827]">All Bookings</h1>
            <p className="text-[#6B7280] mt-1">Platform-wide booking overview.</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-base btn-ghost btn-sm"><Filter size={14} aria-hidden /> Filter</button>
            <button className="btn-base btn-dark btn-sm"><Download size={14} aria-hidden /> Export</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#D5F5E3] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#f8faf9] text-xs text-[#6B7280] uppercase font-bold">
            <tr>
              <th className="p-4">Booking</th>
              <th className="p-4">User</th>
              <th className="p-4 hidden md:table-cell">Partner</th>
              <th className="p-4 hidden md:table-cell">Type</th>
              <th className="p-4">Amount</th>
              <th className="p-4 hidden lg:table-cell">Commission</th>
              <th className="p-4">Status</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-t border-[#D5F5E3] hover:bg-[#f8faf9] transition">
                  <td className="p-4 font-black text-sm text-[#145A32]">{booking.id}</td>
                  <td className="p-4 font-bold text-sm">{booking.user?.name || booking.userName || "Guest"}</td>
                  <td className="p-4 text-sm hidden md:table-cell">{booking.listing?.name || booking.partnerName || "N/A"}</td>
                  <td className="p-4 text-sm hidden md:table-cell">{booking.listing?.type || booking.type || "N/A"}</td>
                  <td className="p-4 font-black">${booking.totalAmount || booking.amount || 0}</td>
                  <td className="p-4 text-sm text-[#145A32] hidden lg:table-cell">${booking.commission || 0}</td>
                  <td className="p-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor[booking.status] || "bg-gray-100 text-gray-700"}`}>{booking.status}</span>
                  </td>
                  <td className="p-4">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === booking.id ? null : booking.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-[#D5F5E3] transition"
                        aria-label="Booking options"
                      >
                        <MoreHorizontal size={16} className="text-[#6B7280]" aria-hidden />
                      </button>
                      
                      {activeDropdown === booking.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                          <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                            <Eye size={16} />
                            View Details
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
