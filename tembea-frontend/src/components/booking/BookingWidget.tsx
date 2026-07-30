"use client";

import { useEffect, useRef, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  ShoppingCart,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { bookingsApi, ordersApi, paymentsApi } from "@/lib/api-client";
import {
  createCommerceReference,
  hostedPaymentsConfigured,
  requireSecureCheckoutUrl,
} from "@/lib/commerce";

type Props = {
  type:
    | "accommodation"
    | "parks"
    | "events"
    | "marketplace"
    | "restaurants"
    | "tours"
    | "transport";
  price: number;
  available: number;
  itemName: string;
  listingId: string;
  itemId?: string;
};

const apiTypeByBookingType: Record<Props["type"], string> = {
  accommodation: "ACCOMMODATION",
  parks: "PARKS",
  events: "EVENTS",
  marketplace: "MARKETPLACE",
  restaurants: "RESTAURANTS",
  tours: "TOURS",
  transport: "TRANSPORT",
};

export function BookingWidget({
  type,
  price,
  available,
  itemName,
  listingId,
  itemId,
}: Props) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState(2);
  const [quantity, setQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const bookingReference = useRef<string | null>(null);
  const orderReference = useRef<string | null>(null);

  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const isMarketplace = type === "marketplace";
  const maxQuantity = Math.max(1, Math.floor(available));
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    setQuantity(1);
    setPendingOrderId(null);
    setError(null);
    setStatusMessage(null);
    orderReference.current = null;
  }, [itemId]);

  let billableUnits = 1;
  if (type === "accommodation" || type === "transport") {
    if (checkIn && checkOut) {
      const duration =
        new Date(checkOut).getTime() - new Date(checkIn).getTime();
      billableUnits = Math.max(
        1,
        Math.ceil(duration / (1000 * 60 * 60 * 24)),
      );
    }
  } else if (type === "events" || isMarketplace) {
    billableUnits = quantity;
  } else if (
    type === "parks" ||
    type === "tours" ||
    type === "restaurants"
  ) {
    billableUnits = guests;
  }
  const estimatedSubtotal = price * billableUnits;

  const actionText = isMarketplace
    ? pendingOrderId
      ? "Retry secure payment"
      : "Buy securely"
    : "Continue to checkout";

  const validate = () => {
    if (
      (type === "accommodation" ||
        type === "parks" ||
        type === "tours" ||
        type === "transport" ||
        type === "events") &&
      !checkIn
    ) {
      return `Please select a ${
        type === "accommodation"
          ? "check-in date"
          : type === "events"
            ? "event date"
            : "start date"
      }.`;
    }
    if (
      (type === "accommodation" || type === "transport") &&
      !checkOut
    ) {
      return `Please select a ${
        type === "accommodation" ? "check-out date" : "return date"
      }.`;
    }
    if (
      (type === "accommodation" || type === "transport") &&
      new Date(checkIn) >= new Date(checkOut)
    ) {
      return `${
        type === "accommodation" ? "Check-out" : "Return date"
      } must be after the start date.`;
    }
    if (type === "restaurants" && (!checkIn || !time)) {
      return "Select both a reservation date and time.";
    }
    if (
      (type === "events" || isMarketplace) &&
      (!Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > maxQuantity)
    ) {
      return `Choose a whole quantity between 1 and ${maxQuantity}.`;
    }
    if (isMarketplace && !itemId) {
      return "Select an available product before continuing.";
    }
    if (isMarketplace && available < 1) {
      return "This product is currently out of stock.";
    }
    if (isMarketplace && deliveryAddress.trim().length < 10) {
      return "Enter a delivery address of at least 10 characters.";
    }
    if (isMarketplace && !hostedPaymentsConfigured) {
      return "Online checkout is not currently available. No order has been placed.";
    }
    return null;
  };

  const initiateOrderPayment = async (orderId: string) => {
    setStatusMessage("Opening the payment provider's secure checkout...");
    const result = await paymentsApi.initiate({
      orderId,
      provider: "flutterwave",
    });
    window.location.assign(requireSecureCheckoutUrl(result.paymentLink));
  };

  const submit = async () => {
    if (!isAuthenticated) {
      router.push("/sign-in");
      return;
    }

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setStatusMessage(null);

    try {
      if (isMarketplace) {
        let orderId = pendingOrderId;
        if (!orderId) {
          orderReference.current ??= createCommerceReference("order");
          setStatusMessage("Reserving current inventory...");
          const order = await ordersApi.create({
            clientReference: orderReference.current,
            productId: itemId!,
            quantity,
            deliveryAddress: deliveryAddress.trim(),
          });
          orderId = order.id;
          setPendingOrderId(order.id);
        }
        await initiateOrderPayment(orderId);
        return;
      }

      bookingReference.current ??= createCommerceReference("booking");
      setStatusMessage("Creating your booking request...");

      const bookingData: Record<string, unknown> = {};
      const request: Record<string, unknown> = {
        clientReference: bookingReference.current,
        listingId,
        type: apiTypeByBookingType[type],
        guests,
        bookingData,
      };

      if (type === "accommodation") {
        Object.assign(bookingData, {
          checkIn,
          checkOut,
          guests,
          quantity: 1,
          ...(itemId && { roomId: itemId }),
        });
        if (itemId) request.roomId = itemId;
      } else if (type === "restaurants") {
        Object.assign(bookingData, { date: checkIn, time, guests });
      } else if (type === "events") {
        Object.assign(bookingData, {
          date: checkIn,
          quantity,
          ...(itemId && { ticketCategoryId: itemId }),
        });
        if (itemId) request.ticketCategoryId = itemId;
      } else if (type === "transport") {
        Object.assign(bookingData, {
          pickupDate: checkIn,
          returnDate: checkOut,
          guests: 1,
          ...(itemId && { vehicleId: itemId }),
        });
        if (itemId) request.vehicleId = itemId;
      } else if (type === "tours") {
        Object.assign(bookingData, {
          date: checkIn,
          participants: guests,
          ...(itemId && { tourPackageId: itemId }),
        });
        if (itemId) request.tourPackageId = itemId;
      } else {
        Object.assign(bookingData, { date: checkIn, guests });
      }

      const booking = await bookingsApi.create(request);
      setStatusMessage("Booking request created. Opening secure checkout...");
      router.push(`/payment/${encodeURIComponent(booking.id)}`);
    } catch (caughtError) {
      setStatusMessage(null);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : isMarketplace
            ? "The order could not be completed."
            : "The booking request could not be created.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkoutUnavailable =
    isMarketplace && !hostedPaymentsConfigured && !pendingOrderId;
  const selectionRequired = isMarketplace && !itemId;
  const productUnavailable = isMarketplace && Boolean(itemId) && available < 1;
  const controlsLocked = Boolean(pendingOrderId);

  return (
    <div className="sticky top-24 rounded-3xl border-2 border-emerald-300 bg-white p-6 shadow-2xl">
      <div className="mb-6 border-b border-gray-200 pb-6">
        <p className="text-sm font-bold text-gray-500">{itemName}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <div className="text-4xl font-black text-emerald-600">
            ${price.toFixed(2)}
          </div>
          <div className="text-lg font-semibold text-gray-500">
            {type === "accommodation"
              ? "/ night"
              : type === "transport"
                ? "/ day"
                : isMarketplace
                  ? ""
                  : "/ person"}
          </div>
        </div>
      </div>

      <div
        className={`mb-6 flex items-center justify-between rounded-xl border px-4 py-3 ${
          productUnavailable
            ? "border-red-200 bg-red-50 text-red-800"
            : "border-emerald-200 bg-emerald-50 text-emerald-800"
        }`}
      >
        <span className="text-sm font-bold">
          {productUnavailable ? "Out of stock" : "Available"}
        </span>
        {available > 0 && (
          <span className="text-xl font-black">{Math.floor(available)}</span>
        )}
      </div>

      <div className="mb-6 space-y-4">
        {(type === "accommodation" ||
          type === "parks" ||
          type === "tours" ||
          type === "transport") && (
          <>
            <label className="block text-sm font-bold text-gray-700">
              <span className="mb-2 flex items-center gap-1">
                <Calendar size={16} aria-hidden />
                {type === "accommodation" ? "Check-in" : "Start date"}
              </span>
              <input
                type="date"
                min={today}
                value={checkIn}
                onChange={(event) => setCheckIn(event.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 font-semibold outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </label>
            <label className="block text-sm font-bold text-gray-700">
              <span className="mb-2 flex items-center gap-1">
                <Calendar size={16} aria-hidden />
                {type === "accommodation" ? "Check-out" : "Return date"}
              </span>
              <input
                type="date"
                min={checkIn || today}
                value={checkOut}
                onChange={(event) => setCheckOut(event.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 font-semibold outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </label>
          </>
        )}

        {type === "restaurants" && (
          <>
            <label className="block text-sm font-bold text-gray-700">
              <span className="mb-2 block">Reservation date</span>
              <input
                type="date"
                min={today}
                value={checkIn}
                onChange={(event) => setCheckIn(event.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 font-semibold outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </label>
            <label className="block text-sm font-bold text-gray-700">
              <span className="mb-2 block">Time</span>
              <input
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 font-semibold outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </label>
          </>
        )}

        {type === "events" && (
          <>
            <label className="block text-sm font-bold text-gray-700">
              <span className="mb-2 block">Event date</span>
              <input
                type="date"
                min={today}
                value={checkIn}
                onChange={(event) => setCheckIn(event.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 font-semibold outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </label>
            <label className="block text-sm font-bold text-gray-700">
              <span className="mb-2 block">Number of tickets</span>
              <input
                type="number"
                min={1}
                max={maxQuantity}
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 font-semibold outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </label>
          </>
        )}

        {(type === "accommodation" ||
          type === "restaurants" ||
          type === "tours" ||
          type === "parks") && (
          <label className="block text-sm font-bold text-gray-700">
            <span className="mb-2 flex items-center gap-1">
              <Users size={16} aria-hidden />
              Guests
            </span>
            <select
              value={guests}
              onChange={(event) => setGuests(Number(event.target.value))}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 font-semibold outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((number) => (
                <option key={number} value={number}>
                  {number} {number === 1 ? "guest" : "guests"}
                </option>
              ))}
            </select>
          </label>
        )}

        {isMarketplace && (
          <>
            <div>
              <p className="mb-2 text-sm font-bold text-gray-700">Quantity</p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={controlsLocked || selectionRequired}
                  aria-label="Decrease quantity"
                  className="h-12 w-12 rounded-xl border-2 border-gray-200 font-black transition-all hover:border-emerald-500 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  −
                </button>
                <input
                  aria-label="Quantity"
                  type="number"
                  min={1}
                  max={maxQuantity}
                  value={quantity}
                  disabled={controlsLocked || selectionRequired}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                  className="min-w-0 flex-1 rounded-xl border-2 border-gray-200 px-4 py-3 text-center text-xl font-black outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:bg-gray-100"
                />
                <button
                  type="button"
                  onClick={() =>
                    setQuantity(Math.min(maxQuantity, quantity + 1))
                  }
                  disabled={
                    controlsLocked ||
                    selectionRequired ||
                    quantity >= maxQuantity
                  }
                  aria-label="Increase quantity"
                  className="h-12 w-12 rounded-xl border-2 border-gray-200 font-black transition-all hover:border-emerald-500 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>
            <label className="block text-sm font-bold text-gray-700">
              <span className="mb-2 block">Delivery address</span>
              <textarea
                value={deliveryAddress}
                onChange={(event) => setDeliveryAddress(event.target.value)}
                disabled={controlsLocked}
                rows={3}
                maxLength={500}
                placeholder="Street, district, city, and delivery instructions"
                className="w-full resize-none rounded-xl border-2 border-gray-200 px-4 py-3 font-semibold outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:bg-gray-100"
              />
            </label>
          </>
        )}
      </div>

      <div className="mb-6 rounded-2xl bg-gray-50 p-4">
        <div className="flex justify-between text-sm font-semibold text-gray-700">
          <span>
            ${price.toFixed(2)} × {billableUnits}
          </span>
          <span>${estimatedSubtotal.toFixed(2)}</span>
        </div>
        <div className="mt-3 flex justify-between border-t border-gray-300 pt-3 text-lg font-black text-gray-900">
          <span>Estimated subtotal</span>
          <span className="text-emerald-600">
            ${estimatedSubtotal.toFixed(2)}
          </span>
        </div>
        <p className="mt-2 text-xs font-medium text-gray-500">
          The server confirms inventory, currency, and the final payable amount.
        </p>
      </div>

      {(selectionRequired || checkoutUnavailable) && (
        <div
          role="status"
          className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900"
        >
          {selectionRequired
            ? "Select a product from the available products before checkout."
            : "Hosted online payment is currently unavailable, so no order can be placed."}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700"
        >
          {error}
          {pendingOrderId && (
            <p className="mt-2">
              Your order was created, but payment was not verified. You can
              retry here or manage it from My Orders.
            </p>
          )}
        </div>
      )}

      {statusMessage && (
        <div
          role="status"
          className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm font-semibold text-blue-800"
        >
          {statusMessage}
        </div>
      )}

      <button
        type="button"
        onClick={() => void submit()}
        disabled={
          isSubmitting ||
          selectionRequired ||
          checkoutUnavailable ||
          productUnavailable
        }
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 py-4 text-lg font-black text-white shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={20} className="animate-spin" aria-hidden />
            Processing...
          </>
        ) : (
          <>
            {isMarketplace ? (
              <ShoppingCart size={20} aria-hidden />
            ) : (
              <CheckCircle2 size={20} aria-hidden />
            )}
            {actionText}
          </>
        )}
      </button>

      {pendingOrderId && (
        <button
          type="button"
          onClick={() => router.push("/client/orders")}
          className="mt-3 w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
        >
          View My Orders
        </button>
      )}

      <div className="mt-6 border-t border-gray-200 pt-6">
        <div className="flex items-start gap-2 text-sm font-bold text-emerald-700">
          <ShieldCheck size={18} className="mt-0.5 shrink-0" aria-hidden />
          <span>
            Payment is accepted only after the provider verifies the
            transaction.
          </span>
        </div>
      </div>
    </div>
  );
}
