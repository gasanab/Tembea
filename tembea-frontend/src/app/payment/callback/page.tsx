"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Loader2,
  LogIn,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { ApiError, paymentsApi } from "@/lib/api-client";
import type { Payment } from "@/types/api.types";

type CallbackState =
  | "loading"
  | "paid"
  | "pending"
  | "cancelled"
  | "refunded"
  | "auth"
  | "error";

const MAX_STATUS_CHECKS = 6;

function CallbackLoading() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl items-center px-4 py-16">
      <section
        aria-live="polite"
        className="w-full rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-xl"
      >
        <Loader2
          aria-hidden
          className="mx-auto h-14 w-14 animate-spin text-emerald-700"
        />
        <h1 className="mt-5 text-2xl font-black text-gray-900">
          Checking payment status
        </h1>
        <p className="mt-2 text-gray-600">
          Waiting for the provider-confirmed result...
        </p>
      </section>
    </main>
  );
}

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<CallbackState>("loading");
  const [payment, setPayment] = useState<Payment | null>(null);
  const [message, setMessage] = useState(
    "Checking the provider-confirmed payment status...",
  );

  const paymentId = searchParams.get("tx_ref")?.trim() ?? "";
  const providerStatus =
    searchParams.get("status")?.trim().toLowerCase() ?? "";
  const validReference = useMemo(
    () => /^[A-Za-z0-9_-]{1,128}$/.test(paymentId),
    [paymentId],
  );
  const callbackPath = useMemo(() => {
    const query = searchParams.toString();
    return `/payment/callback${query ? `?${query}` : ""}`;
  }, [searchParams]);
  const signInHref = `/sign-in?from=${encodeURIComponent(callbackPath)}`;

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const checkStatus = async (attempt = 0) => {
      if (!validReference) {
        setState("error");
        setMessage("The payment return link is missing a valid reference.");
        return;
      }

      try {
        const current = await paymentsApi.findOne(paymentId);
        if (cancelled) return;
        setPayment(current);

        if (current.status === "PAID") {
          setState("paid");
          setMessage("Your payment was verified and recorded successfully.");
          return;
        }

        if (current.status === "REFUNDED") {
          setState("refunded");
          setMessage(
            "This payment was refunded. Review the related order or booking for details.",
          );
          return;
        }

        if (providerStatus === "cancelled") {
          setState("cancelled");
          setMessage(
            "Checkout was cancelled and no verified payment was recorded.",
          );
          return;
        }

        if (attempt < MAX_STATUS_CHECKS - 1) {
          setState("loading");
          setMessage(
            "The provider returned you safely. Waiting for signed verification...",
          );
          timer = setTimeout(() => void checkStatus(attempt + 1), 2000);
          return;
        }

        setState("pending");
        setMessage(
          "The payment has not been verified yet. It is safe to leave this page and check again from your account.",
        );
      } catch (caughtError) {
        if (cancelled) return;
        if (caughtError instanceof ApiError && caughtError.status === 401) {
          setState("auth");
          setMessage(
            "Sign in to the account that started this checkout to view its authoritative payment status.",
          );
          return;
        }
        setState("error");
        setMessage(
          caughtError instanceof Error
            ? caughtError.message
            : "We could not retrieve this payment. Please try again.",
        );
      }
    };

    void checkStatus();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [paymentId, providerStatus, validReference]);

  const Icon =
    state === "paid"
      ? CheckCircle2
      : state === "cancelled"
        ? XCircle
        : state === "error"
          ? AlertCircle
          : state === "auth"
            ? LogIn
            : state === "pending" || state === "refunded"
              ? Clock3
              : Loader2;
  const targetHref = payment?.orderId ? "/client/orders" : "/client/bookings";
  const targetLabel = payment?.orderId
    ? "View my orders"
    : "View my bookings";

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl items-center px-4 py-16">
      <section
        aria-live="polite"
        className="w-full rounded-3xl border border-gray-200 bg-white p-7 text-center shadow-xl sm:p-10"
      >
        <Icon
          aria-hidden
          className={`mx-auto h-14 w-14 ${
            state === "paid"
              ? "text-emerald-600"
              : state === "loading"
                ? "animate-spin text-emerald-700"
                : state === "cancelled" || state === "error"
                  ? "text-red-600"
                  : state === "auth"
                    ? "text-blue-700"
                    : "text-amber-600"
          }`}
        />
        <p className="mt-5 text-sm font-bold uppercase tracking-wider text-emerald-700">
          Secure payment return
        </p>
        <h1 className="mt-2 text-3xl font-black text-gray-900">
          {state === "paid"
            ? "Payment confirmed"
            : state === "cancelled"
              ? "Checkout cancelled"
              : state === "refunded"
                ? "Payment refunded"
                : state === "auth"
                  ? "Sign in to check payment"
                  : state === "error"
                    ? "Payment status unavailable"
                    : "Verification in progress"}
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-gray-600">{message}</p>

        {payment && (
          <dl className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-3 rounded-2xl bg-gray-50 p-4 text-left text-sm">
            <dt className="font-semibold text-gray-500">Reference</dt>
            <dd className="break-all text-right font-bold text-gray-900">
              {payment.id}
            </dd>
            <dt className="font-semibold text-gray-500">Amount</dt>
            <dd className="text-right font-bold text-gray-900">
              {payment.currency} {Number(payment.gross).toFixed(2)}
            </dd>
            <dt className="font-semibold text-gray-500">Recorded status</dt>
            <dd className="text-right font-bold text-gray-900">
              {payment.status}
            </dd>
          </dl>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {state === "auth" ? (
            <Link
              href={signInHref}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#145A32] px-5 py-3 font-bold text-white transition hover:bg-[#0e4426]"
            >
              <LogIn size={18} aria-hidden />
              Sign in and check again
            </Link>
          ) : (
            <Link
              href={targetHref}
              className="rounded-xl bg-[#145A32] px-5 py-3 font-bold text-white transition hover:bg-[#0e4426]"
            >
              {targetLabel}
            </Link>
          )}
          {(state === "pending" || state === "error") && (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-700 px-5 py-3 font-bold text-emerald-800 transition hover:bg-emerald-50"
            >
              <RotateCcw size={18} aria-hidden />
              Check again
            </button>
          )}
          <Link
            href="/"
            className="rounded-xl border-2 border-gray-200 px-5 py-3 font-bold text-gray-700 transition hover:bg-gray-50"
          >
            Return home
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<CallbackLoading />}>
      <PaymentCallbackContent />
    </Suspense>
  );
}
