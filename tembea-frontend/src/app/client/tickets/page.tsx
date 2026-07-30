"use client";

import { Ticket, QrCode, Loader2 } from "lucide-react";
import Link from "next/link";
import { useMyBookings } from "@/hooks/useBookings";
import { formatDate } from "@/utils/formatters/date";

export default function TicketsPage() {
  const { bookings, isLoading } = useMyBookings();
  
  // Filter only event ticket reservations
  const tickets = bookings.filter(b => b.type === "EVENTS" || b.listing?.type === "EVENTS");

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D5F5E3]">
        <h1 className="text-2xl font-black text-[#111827]">Event Tickets</h1>
        <p className="text-[#6B7280] mt-1">Your purchased event tickets.</p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : tickets.length > 0 ? (
          tickets.map((t) => {
            const bookingData = t.bookingData as any || {};
            return (
              <div key={t.id} className="bg-white rounded-2xl p-5 shadow-sm border border-[#D5F5E3]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#D5F5E3] flex items-center justify-center shrink-0">
                    <Ticket size={20} className="text-[#145A32]" aria-hidden />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${t.status === "CONFIRMED" || t.status === "APPROVED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {t.status}
                      </span>
                    </div>
                    <p className="font-black text-[#111827]">{t.listing?.name || "Unknown Event"}</p>
                    <p className="text-sm text-[#6B7280] mt-0.5">{bookingData.date || formatDate(t.createdAt)} · {t.listing?.location || "TBD"}</p>
                    <p className="text-sm text-[#6B7280]">{t.guests} ticket{t.guests > 1 ? "s" : ""} · ${t.amount}</p>
                  </div>
                  {(t.status === "CONFIRMED" || t.status === "APPROVED") && (
                    <button className="btn-base btn-ghost btn-sm" aria-label="Show QR code">
                      <QrCode size={16} aria-hidden />
                    </button>
                  )}
                </div>
                <p className="text-xs text-[#6B7280] mt-3 border-t border-[#D5F5E3] pt-3">Booking ID: {t.id}</p>
              </div>
            );
          })
        ) : (
          <div className="text-center p-8 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500 font-medium">You have no event tickets.</p>
          </div>
        )}
      </div>

      <Link href="/events" className="btn-base btn-dark inline-flex">
        Browse events
      </Link>
    </div>
  );
}
