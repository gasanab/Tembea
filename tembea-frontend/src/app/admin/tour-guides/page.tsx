"use client";

import { useState, useEffect } from "react";
import { Compass, Search, Filter, MoreHorizontal, Star } from "lucide-react";
import { adminApi } from "@/lib/api-client";

const statusColor: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function AdminTourGuidesPage() {
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, tours: 0, avgRating: 0 });

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllListings({ published: true } as any);
      const guidesList = Array.isArray(response) ? response : response?.data || response?.listings || [];
      setGuides(guidesList);
      
      const total = guidesList.length;
      const tours = guidesList.reduce((sum: number, g: any) => sum + (g._count?.bookings || 0), 0);
      const avgRating = guidesList.length > 0 ? guidesList.reduce((sum: number, g: any) => sum + (g.rating || 4.5), 0) / guidesList.length : 0;
      setStats({ total, tours, avgRating });
    } catch (error) {
      console.error("Failed to fetch guides:", error);
      setGuides([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#145A32]"></div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D5F5E3]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-[#111827]">Tour Guides</h1>
            <p className="text-[#6B7280] mt-1">Manage verified tour guide profiles and bookings.</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" aria-hidden />
              <input type="search" placeholder="Search guides…" className="field-control pl-9 py-2 text-sm w-48" aria-label="Search guides" />
            </div>
            <button className="btn-base btn-ghost btn-sm"><Filter size={14} aria-hidden /> Filter</button>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 text-center">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#D5F5E3]">
          <p className="text-3xl font-black text-[#145A32]">{stats.total}</p>
          <p className="text-sm text-[#6B7280] mt-1">Total Guides</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#D5F5E3]">
          <p className="text-3xl font-black text-[#2ECC71]">{stats.tours.toLocaleString()}</p>
          <p className="text-sm text-[#6B7280] mt-1">Tours This Month</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#D5F5E3]">
          <p className="text-3xl font-black text-amber-600">{stats.avgRating.toFixed(1)} ★</p>
          <p className="text-sm text-[#6B7280] mt-1">Avg. Rating</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#D5F5E3] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#f8faf9] text-xs text-[#6B7280] uppercase font-bold">
            <tr>
              <th className="p-4">Guide</th>
              <th className="p-4">Specialty</th>
              <th className="p-4 hidden md:table-cell">Tours</th>
              <th className="p-4 hidden md:table-cell">Rating</th>
              <th className="p-4 hidden lg:table-cell">Revenue</th>
              <th className="p-4">Status</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {guides.map((guide) => (
              <tr key={guide.id} className="border-t border-[#D5F5E3] hover:bg-[#f8faf9] transition">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#145A32] text-white text-sm font-bold flex items-center justify-center">{(guide.name || guide.title || "G")[0]}</div>
                    <p className="font-bold text-sm text-[#111827]">{guide.name || guide.title}</p>
                  </div>
                </td>
                <td className="p-4 text-sm">{guide.category || guide.specialty || "Tour Guide"}</td>
                <td className="p-4 text-sm hidden md:table-cell">{guide._count?.bookings || 0}</td>
                <td className="p-4 hidden md:table-cell">
                  <span className="flex items-center gap-1 text-sm font-bold text-amber-500">
                    <Star size={13} fill="currentColor" /> {guide.rating || 4.5}
                  </span>
                </td>
                <td className="p-4 font-black text-sm text-[#145A32] hidden lg:table-cell">${(guide._count?.bookings || 0) * (parseInt(guide.price) || 0)}</td>
                <td className="p-4">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor[guide.status] || "bg-gray-100 text-gray-700"}`}>{guide.status}</span>
                </td>
                <td className="p-4">
                  <button className="p-1.5 rounded-lg hover:bg-[#D5F5E3] transition" aria-label={`Options for ${guide.name || guide.title}`}>
                    <MoreHorizontal size={16} className="text-[#6B7280]" aria-hidden />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
