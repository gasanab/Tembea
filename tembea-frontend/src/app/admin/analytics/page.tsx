"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Users, DollarSign, CalendarCheck } from "lucide-react";
import { analyticsApi } from "@/lib/api-client";
import { formatCurrency } from "@/utils/formatters/currency";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [overview, listingStats, bookingStats] = await Promise.all([
          analyticsApi.getOverview(),
          analyticsApi.getListingStats(),
          analyticsApi.getBookingStats({}),
        ]);
        setData({ overview, listingStats, bookingStats });
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#145A32]"></div></div>;
  }

  const stats = data?.overview?.stats || {};
  const listingStats = data?.listingStats || [];

  const kpis = [
    { label: "Total Revenue (All Time)", value: formatCurrency(stats.totalRevenue || 0), change: "+0%", icon: DollarSign },
    { label: "Total Bookings (All Time)", value: stats.totalBookings?.toString() || "0", change: "+0%", icon: CalendarCheck },
    { label: "Total Users", value: stats.totalUsers?.toString() || "0", change: "+0%", icon: Users },
    { label: "Total Listings", value: stats.totalListings?.toString() || "0", change: "+0%", icon: TrendingUp },
  ];

  // We map the listing stats by type
  const totalListings = stats.totalListings || 1; // avoid division by zero
  const categoryRevenue = listingStats.map((item: any) => {
    const count = item._count?.id || 0;
    return {
      cat: item.type || "Unknown",
      pct: Math.round((count / totalListings) * 100),
      value: count.toString() + " listings",
    };
  });

  // Mock monthly revenue since the backend doesn't have a monthly breakdown yet
  const monthlyRevenue = [
    { month: "Jan", val: 0 },
    { month: "Feb", val: 0 },
    { month: "Mar", val: 0 },
    { month: "Apr", val: 0 },
    { month: "May", val: 0 },
    { month: "Jun", val: 0 },
  ];

  const max = Math.max(...monthlyRevenue.map((m) => m.val), 1000); // fallback max

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D5F5E3]">
        <h1 className="text-2xl font-black text-[#111827]">Analytics</h1>
        <p className="text-[#6B7280] mt-1">Deep-dive into platform performance and trends.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="bg-white rounded-2xl p-5 shadow-sm border border-[#D5F5E3]">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-9 h-9 rounded-xl bg-[#D5F5E3] flex items-center justify-center">
                  <Icon size={18} className="text-[#145A32]" aria-hidden />
                </span>
                <span className="text-xs font-bold text-[#2ECC71] bg-[#D5F5E3] px-2 py-0.5 rounded-full">{k.change}</span>
              </div>
              <p className="text-xs font-bold text-[#6B7280]">{k.label}</p>
              <p className="text-2xl font-black text-[#111827]">{k.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue bar chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D5F5E3]">
          <h2 className="text-xl font-black text-[#111827] mb-5">Monthly Revenue (2025)</h2>
          <div className="space-y-3">
            {monthlyRevenue.map((m) => (
              <div key={m.month} className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#6B7280] w-8">{m.month}</span>
                <div className="flex-1 h-2.5 bg-[#D5F5E3] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#145A32] rounded-full"
                    style={{ width: `${(m.val / max) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-black text-[#145A32] w-14 text-right">
                  ${(m.val / 1000).toFixed(1)}k
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D5F5E3]">
          <h2 className="text-xl font-black text-[#111827] mb-5">Listings by Category</h2>
          <div className="space-y-4">
            {categoryRevenue.map((c: any) => (
              <div key={c.cat}>
                <div className="flex justify-between text-sm font-semibold mb-1">
                  <span className="capitalize">{c.cat.toLowerCase()}</span>
                  <span className="font-black text-[#145A32]">{c.value}</span>
                </div>
                <div className="h-2.5 bg-[#D5F5E3] rounded-full overflow-hidden">
                  <div className="h-full bg-[#2ECC71] rounded-full" style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
            {categoryRevenue.length === 0 && (
              <p className="text-sm text-gray-500">No listings data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
