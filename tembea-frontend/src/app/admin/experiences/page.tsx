"use client";

import { useState, useEffect } from "react";
import { Sparkles, Search, Filter, MoreHorizontal } from "lucide-react";
import { adminApi } from "@/lib/api-client";

const statusColor: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function AdminExperiencesPage() {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, bookings: 0, revenue: 0 });

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllListings({ published: true } as any);
      const experiencesList = Array.isArray(response) ? response : response?.data || response?.listings || [];
      setExperiences(experiencesList);
      
      const total = experiencesList.length;
      const bookings = experiencesList.reduce((sum: number, e: any) => sum + (e._count?.bookings || 0), 0);
      const revenue = experiencesList.reduce((sum: number, e: any) => sum + (parseInt(e.price) || 0), 0);
      setStats({ total, bookings, revenue });
    } catch (error) {
      console.error("Failed to fetch experiences:", error);
      setExperiences([]);
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
            <h1 className="text-2xl font-black text-[#111827]">Experiences & Tours</h1>
            <p className="text-[#6B7280] mt-1">Manage travel experiences, tours, parks, and outdoor activities.</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" aria-hidden />
              <input type="search" placeholder="Search experiences…" className="field-control pl-9 py-2 text-sm w-48" aria-label="Search experiences" />
            </div>
            <button className="btn-base btn-ghost btn-sm"><Filter size={14} aria-hidden /> Filter</button>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 text-center">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#D5F5E3]">
          <p className="text-3xl font-black text-[#145A32]">{stats.total}</p>
          <p className="text-sm text-[#6B7280] mt-1">Total Experiences</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#D5F5E3]">
          <p className="text-3xl font-black text-[#2ECC71]">{stats.bookings.toLocaleString()}</p>
          <p className="text-sm text-[#6B7280] mt-1">Bookings This Month</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#D5F5E3]">
          <p className="text-3xl font-black text-[#145A32]">${stats.revenue.toLocaleString()}</p>
          <p className="text-sm text-[#6B7280] mt-1">Revenue</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#D5F5E3] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#f8faf9] text-xs text-[#6B7280] uppercase font-bold">
            <tr>
              <th className="p-4">Experience</th>
              <th className="p-4">Partner</th>
              <th className="p-4">Price</th>
              <th className="p-4 hidden md:table-cell">Bookings</th>
              <th className="p-4 hidden lg:table-cell">Revenue</th>
              <th className="p-4">Status</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {experiences.map((exp) => (
              <tr key={exp.id} className="border-t border-[#D5F5E3] hover:bg-[#f8faf9] transition">
                <td className="p-4 font-bold text-sm text-[#111827]">{exp.name || exp.title}</td>
                <td className="p-4 text-sm">{exp.partner?.businessName || exp.partnerName || "N/A"}</td>
                <td className="p-4 font-black text-sm">${exp.price || 0}</td>
                <td className="p-4 text-sm hidden md:table-cell">{exp._count?.bookings || 0}</td>
                <td className="p-4 font-black text-sm text-[#145A32] hidden lg:table-cell">${(exp._count?.bookings || 0) * (parseInt(exp.price) || 0)}</td>
                <td className="p-4">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor[exp.status] || "bg-gray-100 text-gray-700"}`}>{exp.status}</span>
                </td>
                <td className="p-4">
                  <button className="p-1.5 rounded-lg hover:bg-[#D5F5E3] transition" aria-label={`Options for ${exp.name || exp.title}`}>
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
