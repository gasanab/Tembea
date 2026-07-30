import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function LegacyCheckoutUnavailablePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FDFBF7] p-4">
      <div className="w-full max-w-lg rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
          <AlertCircle className="text-amber-700" size={28} aria-hidden />
        </div>
        <h1 className="text-2xl font-black text-gray-900">This checkout link is no longer available</h1>
        <p className="mt-3 text-sm font-medium text-gray-600">
          For your security, return to My Bookings and reopen payment from the booking. Tembea never collects card details on this page.
        </p>
        <Link href="/client/bookings" className="mt-6 inline-flex rounded-xl bg-[#145A32] px-6 py-3 font-bold text-white transition hover:bg-[#0e4426]">
          Go to My Bookings
        </Link>
      </div>
    </main>
  );
}
