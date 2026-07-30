"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Bell,
  CalendarCheck,
  CheckCircle2,
  Compass,
  MapPinned,
  Search,
  Settings,
  Ticket,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { bookingsApi } from "@/lib/api-client";
import type { Booking } from "@/types/api.types";

function readBookings(response: unknown): Booking[] {
  if (Array.isArray(response)) return response as Booking[];
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    Array.isArray(response.data)
  ) {
    return response.data as Booking[];
  }
  return [];
}

export default function ClientDashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const firstName = user?.name?.split(/\s+/)[0] || "traveler";

  const loadBookings = async () => {
    setIsLoading(true);
    setError("");
    try {
      setBookings(readBookings(await bookingsApi.getMyBookings()));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Bookings could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const upcoming = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.status === "APPROVED" || booking.status === "CONFIRMED",
      ),
    [bookings],
  );

  const summaryCards = [
    {
      label: "Upcoming",
      value: upcoming.length,
      detail: "Approved or confirmed",
      icon: Compass,
    },
    {
      label: "All bookings",
      value: bookings.length,
      detail: "Across every status",
      icon: CalendarCheck,
    },
    {
      label: "Pending",
      value: bookings.filter((booking) => booking.status === "PENDING").length,
      detail: "Awaiting confirmation",
      icon: Ticket,
    },
    {
      label: "Completed",
      value: bookings.filter((booking) => booking.status === "COMPLETED").length,
      detail: "Finished bookings",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <section className="rounded-2xl border border-[#D5F5E3] bg-white p-6 shadow-sm">
        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#2ECC71]">
              Client dashboard
            </p>
            <h1 className="mt-1 text-3xl font-black text-[#111827] lg:text-4xl">
              Welcome, {firstName}.
            </h1>
            <p className="mt-2 font-semibold text-[#6B7280]">
              Review your bookings and continue exploring Rwanda.
            </p>
          </div>
          <Link
            className="flex items-center gap-2 rounded-xl bg-[#145A32] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0d4a26]"
            href="/search"
          >
            <Search size={16} aria-hidden />
            Explore services
          </Link>
        </div>
      </section>

      {error && (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700"
          role="alert"
        >
          <span>{error}</span>
          <button className="underline" onClick={loadBookings} type="button">
            Try again
          </button>
        </div>
      )}

      <section aria-label="Booking summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              className="rounded-2xl border border-[#D5F5E3] bg-white p-5 shadow-sm"
              key={card.label}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D5F5E3] text-[#145A32]">
                <Icon size={21} aria-hidden />
              </span>
              <p className="mt-4 text-sm font-extrabold text-[#6B7280]">{card.label}</p>
              <p className="text-4xl font-black text-[#111827]">
                {isLoading ? "—" : card.value}
              </p>
              <p className="mt-1 text-sm font-semibold text-[#6B7280]">{card.detail}</p>
            </article>
          );
        })}
      </section>

      <section className="rounded-2xl border border-[#D5F5E3] bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#2ECC71]">
              Upcoming bookings
            </p>
            <h2 className="text-2xl font-black text-[#111827]">Your next plans</h2>
          </div>
          <Link
            className="flex items-center gap-1 text-sm font-bold text-[#145A32] hover:underline"
            href="/client/bookings"
          >
            View all <ArrowUpRight size={14} aria-hidden />
          </Link>
        </div>

        {isLoading && (
          <p className="py-12 text-center text-sm font-semibold text-[#6B7280]" role="status">
            Loading bookings...
          </p>
        )}
        {!isLoading && !error && upcoming.length === 0 && (
          <div className="rounded-xl bg-[#f8faf9] p-10 text-center">
            <Compass className="mx-auto text-[#145A32]" size={30} aria-hidden />
            <h3 className="mt-3 font-black text-[#111827]">No upcoming bookings</h3>
            <p className="mt-1 text-sm text-[#6B7280]">
              Approved and confirmed bookings will appear here.
            </p>
            <Link
              className="mt-4 inline-flex font-bold text-[#145A32] hover:underline"
              href="/search"
            >
              Explore Tembea
            </Link>
          </div>
        )}

        {!isLoading && upcoming.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {upcoming.slice(0, 6).map((booking) => {
              const image = booking.listing?.images?.[0];
              return (
                <article
                  className="overflow-hidden rounded-xl border border-[#D5F5E3]"
                  key={booking.id}
                >
                  <div className="relative h-40 bg-[#D5F5E3]">
                    {image ? (
                      <Image
                        alt=""
                        className="object-cover"
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        src={image}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[#145A32]">
                        <Compass size={32} aria-hidden />
                      </div>
                    )}
                    <span className="absolute right-2 top-2 rounded-full bg-[#145A32] px-2.5 py-1 text-xs font-black text-white">
                      {booking.status}
                    </span>
                  </div>
                  <div className="space-y-2 p-4">
                    <h3 className="font-black text-[#111827]">
                      {booking.listing?.name || "Booking"}
                    </h3>
                    <p className="flex items-center gap-2 text-xs text-[#6B7280]">
                      <CalendarCheck size={13} aria-hidden />
                      {booking.bookingData?.checkIn
                        ? `Check-in: ${String(booking.bookingData.checkIn)}`
                        : new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                    <p className="flex items-center gap-2 text-xs text-[#6B7280]">
                      <MapPinned size={13} aria-hidden />
                      {booking.listing?.location || "Rwanda"}
                    </p>
                    <p className="text-xs font-bold text-[#6B7280]">
                      {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
                    </p>
                    <Link
                      className="mt-2 inline-flex text-xs font-bold text-[#145A32] hover:underline"
                      href="/client/bookings"
                    >
                      View booking
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <Link
          className="flex items-center gap-3 rounded-2xl border border-[#D5F5E3] bg-white p-4 font-bold text-[#111827] transition hover:shadow-md"
          href="/notifications"
        >
          <Bell className="text-[#145A32]" size={20} aria-hidden />
          Account notifications
        </Link>
        <Link
          className="flex items-center gap-3 rounded-2xl border border-[#D5F5E3] bg-white p-4 font-bold text-[#111827] transition hover:shadow-md"
          href="/settings"
        >
          <Settings className="text-[#145A32]" size={20} aria-hidden />
          Account settings
        </Link>
        <Link
          className="flex items-center gap-3 rounded-2xl border border-[#D5F5E3] bg-white p-4 font-bold text-[#111827] transition hover:shadow-md"
          href="/client/messages"
        >
          <ArrowUpRight className="text-[#145A32]" size={20} aria-hidden />
          Messages
        </Link>
      </section>
    </div>
  );
}
