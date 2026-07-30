"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  CalendarCheck,
  DollarSign,
  FileText,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";
import { analyticsApi, verificationApi } from "@/lib/api-client";
import { formatCurrency } from "@/utils/formatters/currency";

type DashboardStats = {
  totalUsers?: number;
  totalPartners?: number;
  totalListings?: number;
  totalBookings?: number;
  totalRevenue?: number;
  platformEarnings?: number;
  pendingVerifications?: number;
};

type RecentBooking = {
  id: string;
  amount: number;
  currency?: string;
  status: string;
  createdAt: string;
  user?: { name?: string };
  listing?: { name?: string; type?: string };
};

type PendingPartner = {
  id: string;
  businessName?: string;
  category?: string;
  status?: string;
  createdAt?: string;
  user?: { name?: string };
};

function readPendingPartners(response: unknown): PendingPartner[] {
  if (Array.isArray(response)) return response as PendingPartner[];
  if (
    response &&
    typeof response === "object" &&
    "partners" in response &&
    Array.isArray(response.partners)
  ) {
    return response.partners as PendingPartner[];
  }
  return [];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({});
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [pendingPartners, setPendingPartners] = useState<PendingPartner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [overview, pending] = await Promise.all([
        analyticsApi.getOverview(),
        verificationApi.getPendingPartners(),
      ]);
      setStats(overview?.stats ?? {});
      setRecentBookings(
        Array.isArray(overview?.recentBookings) ? overview.recentBookings : [],
      );
      setPendingPartners(readPendingPartners(pending));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Dashboard data could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const widgets = [
    {
      label: "Paid revenue",
      value: formatCurrency(stats.totalRevenue ?? 0),
      detail: "Gross paid payments",
      icon: DollarSign,
    },
    {
      label: "Platform earnings",
      value: formatCurrency(stats.platformEarnings ?? 0),
      detail: "Recorded commission",
      icon: WalletCards,
    },
    {
      label: "Bookings",
      value: stats.totalBookings ?? 0,
      detail: "All booking statuses",
      icon: CalendarCheck,
    },
    {
      label: "Verified partners",
      value: stats.totalPartners ?? 0,
      detail: `${stats.pendingVerifications ?? 0} awaiting review`,
      icon: Building2,
    },
    {
      label: "Users",
      value: stats.totalUsers ?? 0,
      detail: "Registered accounts",
      icon: Users,
    },
    {
      label: "Published listings",
      value: stats.totalListings ?? 0,
      detail: "Visible marketplace listings",
      icon: FileText,
    },
  ];

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <section className="rounded-2xl border border-[#D5F5E3] bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-[#2ECC71]">
          Admin dashboard
        </p>
        <h1 className="mt-1 text-3xl font-black text-[#111827] lg:text-4xl">
          Platform overview
        </h1>
        <p className="mt-2 font-semibold text-[#6B7280]">
          Review recorded marketplace activity and pending partner verifications.
        </p>
      </section>

      {error && (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700"
          role="alert"
        >
          <span>{error}</span>
          <button className="underline" onClick={loadDashboard} type="button">
            Try again
          </button>
        </div>
      )}

      <section aria-label="Platform totals" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {widgets.map((widget) => {
          const Icon = widget.icon;
          return (
            <article
              className="rounded-2xl border border-[#D5F5E3] bg-white p-5 shadow-sm"
              key={widget.label}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D5F5E3] text-[#145A32]">
                <Icon size={19} aria-hidden />
              </span>
              <p className="mt-4 text-xs font-bold text-[#6B7280]">{widget.label}</p>
              <p className="text-2xl font-black text-[#111827]">
                {isLoading ? "—" : widget.value}
              </p>
              <p className="mt-1 text-xs font-semibold text-[#6B7280]">{widget.detail}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-[#D5F5E3] bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#2ECC71]">
                Verification
              </p>
              <h2 className="text-2xl font-black text-[#111827]">Pending partners</h2>
            </div>
            <Link
              className="flex items-center gap-1 text-sm font-bold text-[#145A32] hover:underline"
              href="/admin/verification"
            >
              Review all <ArrowUpRight size={14} aria-hidden />
            </Link>
          </div>
          {isLoading && (
            <p className="py-8 text-center text-sm text-[#6B7280]" role="status">
              Loading partners...
            </p>
          )}
          {!isLoading && pendingPartners.length === 0 && (
            <div className="rounded-xl bg-[#f8faf9] p-8 text-center">
              <ShieldCheck className="mx-auto text-[#145A32]" size={28} aria-hidden />
              <p className="mt-3 font-bold text-[#111827]">No partners awaiting review</p>
            </div>
          )}
          <div className="space-y-3">
            {pendingPartners.slice(0, 5).map((partner) => (
              <article
                className="flex items-center justify-between gap-3 rounded-xl border border-[#D5F5E3] p-3"
                key={partner.id}
              >
                <div className="min-w-0">
                  <p className="truncate font-bold text-[#111827]">
                    {partner.businessName || partner.user?.name || "Partner"}
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    {partner.category?.replaceAll("_", " ") || "Uncategorised"}
                    {partner.createdAt
                      ? ` · ${new Date(partner.createdAt).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
                  {partner.status || "PENDING"}
                </span>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#D5F5E3] bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#2ECC71]">
                Bookings
              </p>
              <h2 className="text-2xl font-black text-[#111827]">Recent activity</h2>
            </div>
            <Link
              className="flex items-center gap-1 text-sm font-bold text-[#145A32] hover:underline"
              href="/admin/bookings"
            >
              View all <ArrowUpRight size={14} aria-hidden />
            </Link>
          </div>
          {isLoading && (
            <p className="py-8 text-center text-sm text-[#6B7280]" role="status">
              Loading bookings...
            </p>
          )}
          {!isLoading && recentBookings.length === 0 && (
            <p className="rounded-xl bg-[#f8faf9] p-8 text-center text-sm text-[#6B7280]">
              No bookings have been recorded.
            </p>
          )}
          <div className="space-y-3">
            {recentBookings.map((booking) => (
              <article
                className="grid gap-2 rounded-xl border border-[#D5F5E3] p-3 sm:grid-cols-[1fr_auto] sm:items-center"
                key={booking.id}
              >
                <div className="min-w-0">
                  <p className="truncate font-bold text-[#111827]">
                    {booking.listing?.name || "Booking"}
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    {booking.user?.name || "User"} ·{" "}
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-black text-[#145A32]">
                    {formatCurrency(booking.amount || 0)}
                  </p>
                  <p className="text-xs font-bold text-[#6B7280]">{booking.status}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
