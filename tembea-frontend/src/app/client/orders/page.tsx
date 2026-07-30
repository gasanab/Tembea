"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ExternalLink,
  Loader2,
  Package,
  RefreshCw,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import { ordersApi, paymentsApi } from "@/lib/api-client";
import {
  hostedPaymentsConfigured,
  requireSecureCheckoutUrl,
} from "@/lib/commerce";
import type { Order, OrderStatus } from "@/types/api.types";
import { formatDate } from "@/utils/formatters/date";

const statusStyle: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PREPARING: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-cyan-100 text-cyan-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
};

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(
    null,
  );

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      setOrders(await ordersApi.getMy());
    } catch (caughtError) {
      setLoadError(
        caughtError instanceof Error
          ? caughtError.message
          : "Your orders could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const startPayment = async (order: Order) => {
    if (!hostedPaymentsConfigured) {
      setActionError(
        "Hosted online payment is currently unavailable. Your order remains unpaid.",
      );
      return;
    }

    setPayingOrderId(order.id);
    setActionError(null);
    try {
      const result = await paymentsApi.initiate({
        orderId: order.id,
        provider: "flutterwave",
      });
      window.location.assign(requireSecureCheckoutUrl(result.paymentLink));
    } catch (caughtError) {
      setActionError(
        caughtError instanceof Error
          ? caughtError.message
          : "Secure checkout could not be opened.",
      );
      setPayingOrderId(null);
    }
  };

  const cancelOrder = async (order: Order) => {
    if (
      !window.confirm(
        "Cancel this unpaid order and return its reserved inventory?",
      )
    ) {
      return;
    }

    setCancellingOrderId(order.id);
    setActionError(null);
    try {
      const updated = await ordersApi.cancel(order.id);
      setOrders((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (caughtError) {
      setActionError(
        caughtError instanceof Error
          ? caughtError.message
          : "The order could not be cancelled.",
      );
    } finally {
      setCancellingOrderId(null);
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <header className="rounded-2xl border border-[#D5F5E3] bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black text-[#111827]">My Orders</h1>
        <p className="mt-1 text-[#6B7280]">
          Track marketplace purchases and resume any unverified payment.
        </p>
      </header>

      {!hostedPaymentsConfigured && (
        <div
          role="status"
          className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900"
        >
          <AlertCircle className="mt-0.5 shrink-0" size={20} aria-hidden />
          <div>
            <p className="font-bold">Online payment is currently unavailable</p>
            <p className="mt-1 text-sm">
              Existing orders and their recorded statuses remain visible. No
              payment button will collect credentials on Tembea.
            </p>
          </div>
        </div>
      )}

      {actionError && (
        <div
          role="alert"
          className="flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"
        >
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            aria-label="Dismiss error"
          >
            <XCircle size={18} aria-hidden />
          </button>
        </div>
      )}

      {isLoading ? (
        <div
          role="status"
          className="flex justify-center rounded-2xl border border-gray-100 bg-white p-12"
        >
          <Loader2
            className="h-8 w-8 animate-spin text-emerald-600"
            aria-hidden
          />
          <span className="sr-only">Loading orders</span>
        </div>
      ) : loadError ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-white p-8 text-center"
        >
          <AlertCircle
            className="mx-auto text-red-600"
            size={32}
            aria-hidden
          />
          <h2 className="mt-3 text-lg font-black text-gray-900">
            Orders unavailable
          </h2>
          <p className="mt-2 text-sm font-semibold text-red-700">
            {loadError}
          </p>
          <button
            type="button"
            onClick={() => void loadOrders()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#145A32] px-5 py-3 font-bold text-white"
          >
            <RefreshCw size={17} aria-hidden />
            Try again
          </button>
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => {
            const paymentPaid = order.payment?.status === "PAID";
            const canPay = order.status === "PENDING" && !paymentPaid;
            const canCancel = order.status === "PENDING" && !paymentPaid;

            return (
              <article
                key={order.id}
                className="rounded-2xl border border-[#D5F5E3] bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#D5F5E3]">
                    <Package
                      size={21}
                      className="text-[#145A32]"
                      aria-hidden
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row">
                      <div>
                        <h2 className="font-black text-[#111827]">
                          {order.product.name}
                        </h2>
                        <p className="mt-1 text-sm text-[#6B7280]">
                          {order.product.listing.name} · {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="sm:text-right">
                        <p className="font-black text-[#145A32]">
                          {formatMoney(order.amount, order.currency)}
                        </p>
                        <span
                          className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusStyle[order.status]}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <dl className="mt-4 grid gap-2 rounded-xl bg-gray-50 p-4 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="font-semibold text-gray-500">
                          Quantity
                        </dt>
                        <dd className="font-bold text-gray-900">
                          {order.quantity}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-gray-500">
                          Payment
                        </dt>
                        <dd className="font-bold text-gray-900">
                          {order.payment?.status ?? "NOT STARTED"}
                        </dd>
                      </div>
                      {order.deliveryAddress && (
                        <div className="sm:col-span-2">
                          <dt className="font-semibold text-gray-500">
                            Delivery address
                          </dt>
                          <dd className="font-bold text-gray-900">
                            {order.deliveryAddress}
                          </dd>
                        </div>
                      )}
                      {order.trackingNumber && (
                        <div className="sm:col-span-2">
                          <dt className="font-semibold text-gray-500">
                            Tracking number
                          </dt>
                          <dd className="font-bold text-gray-900">
                            {order.trackingNumber}
                          </dd>
                        </div>
                      )}
                    </dl>

                    {canPay && (
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => void startPayment(order)}
                          disabled={
                            !hostedPaymentsConfigured ||
                            payingOrderId === order.id ||
                            cancellingOrderId === order.id
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#145A32] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0e4426] disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                          {payingOrderId === order.id ? (
                            <Loader2
                              size={17}
                              className="animate-spin"
                              aria-hidden
                            />
                          ) : (
                            <ExternalLink size={17} aria-hidden />
                          )}
                          {order.payment
                            ? "Resume secure payment"
                            : "Pay securely"}
                        </button>
                        {canCancel && (
                          <button
                            type="button"
                            onClick={() => void cancelOrder(order)}
                            disabled={
                              cancellingOrderId === order.id ||
                              payingOrderId === order.id
                            }
                            className="rounded-xl border-2 border-red-200 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {cancellingOrderId === order.id
                              ? "Cancelling..."
                              : "Cancel order"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center">
          <ShoppingBag
            className="mx-auto text-emerald-700"
            size={36}
            aria-hidden
          />
          <h2 className="mt-3 text-lg font-black text-gray-900">
            No marketplace orders yet
          </h2>
          <p className="mt-1 text-sm font-medium text-gray-500">
            Products you purchase will appear here with their verified status.
          </p>
        </div>
      )}

      <Link href="/made-in-rwanda" className="btn-base btn-dark inline-flex">
        <ShoppingBag size={16} aria-hidden />
        Shop Made in Rwanda
      </Link>
    </div>
  );
}
