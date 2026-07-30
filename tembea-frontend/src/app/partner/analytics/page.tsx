"use client";

import { Eye, TrendingUp, Star, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { bookingsApi } from "@/lib/api-client";

const trafficSources = [
  { source: "Direct / Organic", pct: 42 },
  { source: "Search (Tembea)", pct: 31 },
  { source: "Social Media", pct: 17 },
  { source: "Referral", pct: 10 },
];

export default function PartnerAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await bookingsApi.getPartnerStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch partner stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#145A32]"></div></div>;
  }

  const metrics = [
    { label: "Page Views (30d)", value: stats?.pageViews || "0", change: "+0%", icon: Eye },
    { label: "Booking Conversion", value: "0%", change: "+0%", icon: TrendingUp },
    { label: "Average Rating", value: `${stats?.rating || 0} / 5`, change: "+0", icon: Star },
    { label: "Avg. Response Time", value: "0 min", change: "-0 min", icon: Clock },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D5F5E3]">
        <h1 className="text-2xl font-black text-[#111827]">Analytics</h1>
        <p className="text-[#6B7280] mt-1">Performance insights for your listings.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-white rounded-2xl p-5 shadow-sm border border-[#D5F5E3]">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-9 h-9 rounded-xl bg-[#D5F5E3] flex items-center justify-center">
                  <Icon size={18} className="text-[#145A32]" aria-hidden />
                </span>
                <span className="text-xs font-bold text-[#2ECC71] bg-[#D5F5E3] px-2 py-0.5 rounded-full">{m.change}</span>
              </div>
              <p className="text-xs font-bold text-[#6B7280]">{m.label}</p>
              <p className="text-2xl font-black text-[#111827]">{m.value}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D5F5E3]">
        <h2 className="text-xl font-black text-[#111827] mb-5">Traffic Sources</h2>
        <div className="space-y-4">
          {trafficSources.map((s) => (
            <div key={s.source}>
              <div className="flex justify-between text-sm font-semibold mb-1">
                <span>{s.source}</span>
                <span className="text-[#145A32] font-black">{s.pct}%</span>
              </div>
              <div className="h-2.5 bg-[#D5F5E3] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#145A32] rounded-full transition-all"
                  style={{ width: `${s.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
