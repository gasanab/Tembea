"use client";

import { useState } from "react";
import { AlertCircle, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { paymentsApi } from "@/lib/api-client";
import {
  hostedPaymentsConfigured,
  requireSecureCheckoutUrl,
} from "@/lib/commerce";
import type { Booking } from "@/types/api.types";

type Props = {
  booking: Booking;
  onBack: () => void;
  onRefresh: () => Promise<void> | void;
};

export function PaymentMethodStep({ booking, onBack, onRefresh }: Props) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasPendingPayment = booking.payment?.status === "UNPAID";

  const handleInitiate = async () => {
    if (!hostedPaymentsConfigured) return;

    setIsProcessing(true);
    setError(null);

    try {
      const result = await paymentsApi.initiate({
        bookingId: booking.id,
        provider: "flutterwave",
      });

      window.location.assign(requireSecureCheckoutUrl(result.paymentLink));
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Payment could not be started. Please try again later.",
      );
      setIsProcessing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      await onRefresh();
    } catch {
      setError("We could not refresh the payment status. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl sm:p-8">
        <div className="border-b border-gray-100 pb-6">
          <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">Payment</p>
          <h2 className="mt-1 text-2xl font-black text-gray-900">Complete your booking</h2>
          <p className="mt-2 text-sm font-medium text-gray-600">
            Tembea does not collect card or mobile-money credentials. When enabled, payment opens on the configured provider&apos;s secure checkout page.
          </p>
        </div>

        <div className="my-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-500">Amount due</p>
              <p className="mt-1 text-3xl font-black text-gray-900">
                {booking.currency} {booking.amount.toFixed(2)}
              </p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p className="font-bold text-gray-700">Booking reference</p>
              <p className="break-all">{booking.id}</p>
            </div>
          </div>
        </div>

        {!hostedPaymentsConfigured && (
          <div className="mb-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <AlertCircle className="mt-0.5 shrink-0" size={20} aria-hidden />
            <div>
              <p className="font-bold">Online payment is not available yet</p>
              <p className="mt-1 text-sm">
                Your booking remains in its current status. Please return to My Bookings or contact Tembea support for assistance.
              </p>
            </div>
          </div>
        )}

        {hasPendingPayment && (
          <div className="mb-6 flex gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-900">
            <AlertCircle className="mt-0.5 shrink-0" size={20} aria-hidden />
            <div>
              <p className="font-bold">Payment verification is pending</p>
              <p className="mt-1 text-sm">
                We will confirm this booking only after the payment provider verifies the transaction. Refresh to check the latest status.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onBack}
            disabled={isProcessing || isRefreshing}
            className="rounded-xl border-2 border-gray-200 px-5 py-3 font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Back
          </button>

          {hasPendingPayment && (
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[#145A32] px-5 py-3 font-bold text-[#145A32] transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} aria-hidden />
              {isRefreshing ? "Checking status..." : "Refresh payment status"}
            </button>
          )}
          <button
            type="button"
            onClick={handleInitiate}
            disabled={!hostedPaymentsConfigured || isProcessing || isRefreshing}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#145A32] px-5 py-3 font-bold text-white transition hover:bg-[#0e4426] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isProcessing ? <Loader2 size={18} className="animate-spin" aria-hidden /> : <ExternalLink size={18} aria-hidden />}
            {isProcessing
              ? "Opening provider..."
              : hasPendingPayment
                ? "Resume secure checkout"
                : "Continue to payment provider"}
          </button>
        </div>
      </div>
    </div>
  );
}
