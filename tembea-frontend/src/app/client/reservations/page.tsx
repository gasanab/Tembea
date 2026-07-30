"use client";

import { Utensils, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { useMyBookings } from "@/hooks/useBookings";
import { formatDate } from "@/utils/formatters/date";

export default function ReservationsPage() {
  const { bookings, isLoading } = useMyBookings();
  
  // Filter only restaurant reservations
  const reservations = bookings.filter(b => b.type === "RESTAURANTS" || b.listing?.type === "RESTAURANTS");

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D5F5E3]">
        <h1 className="text-2xl font-black text-[#111827]">Restaurant Reservations</h1>
        <p className="text-[#6B7280] mt-1">Your upcoming dining reservations.</p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : reservations.length > 0 ? (
          reservations.map((r) => {
            const bookingData = r.bookingData as any || {};
            return (
              <div key={r.id} className="bg-white rounded-2xl p-5 shadow-sm border border-[#D5F5E3] flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#D5F5E3] flex items-center justify-center shrink-0">
                  <Utensils size={20} className="text-[#145A32]" aria-hidden />
                </div>
                <div className="flex-1">
                  <p className="font-black text-[#111827]">{r.listing?.name || "Unknown Restaurant"}</p>
                  <p className="text-sm text-[#6B7280] flex items-center gap-1 mt-0.5">
                    <Clock size={13} aria-hidden /> {bookingData.date || formatDate(r.createdAt)} at {bookingData.time || "TBD"} · {r.guests} guests
                  </p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${r.status === "CONFIRMED" || r.status === "APPROVED" ? "bg-green-100 text-green-700" : r.status === "CANCELLED" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {r.status}
                </span>
              </div>
            );
          })
        ) : (
          <div className="text-center p-8 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500 font-medium">You have no restaurant reservations.</p>
          </div>
        )}
      </div>

      <Link href="/restaurants" className="btn-base btn-dark inline-flex">
        Reserve a table
      </Link>
    </div>
  );
}
