import { Calendar, CheckCircle2, MapPin, Users } from "lucide-react";
import type { Booking } from "@/types/api.types";
import { formatDate } from "@/utils/formatters/date";

type Props = {
  booking: Booking;
  onProceed: () => void;
  onBack: () => void;
};

export function BookingCreatedStep({ booking, onProceed, onBack }: Props) {
  const listing = booking.listing;
  const data = booking.bookingData;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-7">
        <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-100 bg-white p-8 text-center shadow-xl">
          <div className="absolute left-0 top-0 h-2 w-full bg-emerald-500" />
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="text-emerald-600" size={32} aria-hidden />
          </div>
          <h2 className="mb-2 text-2xl font-black text-gray-900">Booking request created</h2>
          <p className="font-medium text-gray-600">
            Review the booking details and amount below. The booking is confirmed only after the payment provider reports a successful payment.
          </p>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
          <h3 className="text-xl font-black text-gray-900">{listing?.name || "Booking details"}</h3>
          {listing?.location && (
            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-gray-500">
              <MapPin size={15} className="text-emerald-600" aria-hidden />
              {listing.location}
            </p>
          )}

          <div className="mt-6 grid grid-cols-1 gap-4 border-t border-gray-100 pt-6 text-sm sm:grid-cols-2">
            {data.checkIn && (
              <div className="flex items-center gap-3">
                <Calendar size={17} className="text-emerald-600" aria-hidden />
                <div><p className="text-gray-500">Check-in</p><p className="font-bold text-gray-900">{formatDate(data.checkIn)}</p></div>
              </div>
            )}
            {data.checkOut && (
              <div className="flex items-center gap-3">
                <Calendar size={17} className="text-emerald-600" aria-hidden />
                <div><p className="text-gray-500">Check-out</p><p className="font-bold text-gray-900">{formatDate(data.checkOut)}</p></div>
              </div>
            )}
            {data.date && (
              <div className="flex items-center gap-3">
                <Calendar size={17} className="text-emerald-600" aria-hidden />
                <div><p className="text-gray-500">Date</p><p className="font-bold text-gray-900">{formatDate(data.date)}</p></div>
              </div>
            )}
            {data.time && (
              <div className="flex items-center gap-3">
                <Calendar size={17} className="text-emerald-600" aria-hidden />
                <div><p className="text-gray-500">Time</p><p className="font-bold text-gray-900">{String(data.time)}</p></div>
              </div>
            )}
            {booking.guests > 0 && (
              <div className="flex items-center gap-3">
                <Users size={17} className="text-emerald-600" aria-hidden />
                <div><p className="text-gray-500">Guests</p><p className="font-bold text-gray-900">{booking.guests}</p></div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-5">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
          <h3 className="border-b border-gray-100 pb-4 text-xl font-black text-gray-900">Amount due</h3>
          <div className="my-8 flex items-end justify-between gap-4">
            <span className="text-sm font-semibold text-gray-500">Backend-calculated total</span>
            <span className="text-2xl font-black text-emerald-700">
              {booking.currency} {booking.amount.toFixed(2)}
            </span>
          </div>
          <p className="mb-6 rounded-xl bg-gray-50 p-3 text-xs font-medium text-gray-600">
            Taxes, service charges, discounts, and cancellation terms are included only when supplied by the booking service.
          </p>
          <div className="flex gap-3">
            <button type="button" onClick={onBack} className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50">
              Back
            </button>
            <button type="button" onClick={onProceed} className="flex-[2] rounded-xl bg-[#145A32] px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#0e4426]">
              Continue to payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
