"use client";

import Link from "next/link";
import { Calendar, CheckCircle2, MapPin, Users } from "lucide-react";
import type { Booking } from "@/types/api.types";
import { formatDate } from "@/utils/formatters/date";

type Props = {
  booking: Booking;
};

export function ConfirmationStep({ booking }: Props) {
  const listing = booking.listing;
  const data = booking.bookingData;
  const payment = booking.payment;
  const totalPaid = payment?.gross ?? booking.amount;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-xl">
        <div className="absolute left-0 top-0 h-2 w-full bg-emerald-500" />
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="text-emerald-600" size={40} aria-hidden />
        </div>
        <h2 className="text-3xl font-black text-gray-900">Payment verified</h2>
        <p className="mx-auto mt-2 max-w-xl font-medium text-gray-600">
          The payment service has marked this transaction as paid. You can review the booking in My Bookings.
        </p>
        <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">Booking reference</p>
          <p className="mt-1 break-all text-xl font-black text-emerald-900">{booking.id}</p>
          {payment?.providerRef && <p className="mt-2 text-xs text-emerald-800">Provider reference: {payment.providerRef}</p>}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
          <h3 className="text-xl font-black text-gray-900">Booking details</h3>
          <h4 className="mt-5 font-bold text-gray-900">{listing?.name || "Tembea booking"}</h4>
          {listing?.location && <p className="mt-1 flex items-center gap-2 text-sm text-gray-500"><MapPin size={14} aria-hidden />{listing.location}</p>}
          <div className="mt-5 space-y-3 text-sm">
            {data.checkIn && <p className="flex items-center gap-2"><Calendar size={15} className="text-emerald-600" aria-hidden /><span className="text-gray-500">Check-in:</span><span className="font-bold">{formatDate(data.checkIn)}</span></p>}
            {data.checkOut && <p className="flex items-center gap-2"><Calendar size={15} className="text-emerald-600" aria-hidden /><span className="text-gray-500">Check-out:</span><span className="font-bold">{formatDate(data.checkOut)}</span></p>}
            {data.date && <p className="flex items-center gap-2"><Calendar size={15} className="text-emerald-600" aria-hidden /><span className="text-gray-500">Date:</span><span className="font-bold">{formatDate(data.date)}</span></p>}
            {booking.guests > 0 && <p className="flex items-center gap-2"><Users size={15} className="text-emerald-600" aria-hidden /><span className="text-gray-500">Guests:</span><span className="font-bold">{booking.guests}</span></p>}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
          <h3 className="text-xl font-black text-gray-900">Payment summary</h3>
          <p className="mt-5 text-sm font-semibold text-gray-500">Verified amount</p>
          <p className="mt-1 text-3xl font-black text-emerald-700">{payment?.currency || booking.currency} {totalPaid.toFixed(2)}</p>
          {payment?.provider && <p className="mt-3 text-sm text-gray-500">Provider: <span className="font-bold text-gray-700">{payment.provider}</span></p>}
          <div className="mt-8 flex flex-col gap-3">
            <Link href="/client/bookings" className="rounded-xl bg-[#145A32] px-5 py-3 text-center font-bold text-white transition hover:bg-[#0e4426]">View My Bookings</Link>
            <Link href="/explore" className="rounded-xl border-2 border-gray-200 px-5 py-3 text-center font-bold text-gray-700 transition hover:bg-gray-50">Continue exploring</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
