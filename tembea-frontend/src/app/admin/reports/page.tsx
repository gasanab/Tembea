"use client";

import { useState, useEffect } from "react";
import { FileText, Download, Calendar } from "lucide-react";
import { adminApi } from "@/lib/api-client";

const typeColor: Record<string, string> = {
  Financial: "bg-green-100 text-green-700",
  Partners: "bg-blue-100 text-blue-700",
  Bookings: "bg-purple-100 text-purple-700",
  Users: "bg-amber-100 text-amber-700",
  Marketplace: "bg-red-100 text-red-700",
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        const data = await adminApi.getReports();
        setReports(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
        // Fallback or empty if not implemented
        setReports([]);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#145A32]"></div></div>;
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D5F5E3]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-[#111827]">Reports</h1>
            <p className="text-[#6B7280] mt-1">Download platform reports and data exports.</p>
          </div>
          <button className="btn-base btn-dark btn-sm">
            <Calendar size={14} aria-hidden /> Generate Report
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 text-center">
        {[
          { label: "Reports Generated", value: reports.length.toString(), color: "text-[#145A32]" },
          { label: "This Month", value: reports.filter((r) => new Date(r.createdAt).getMonth() === new Date().getMonth()).length.toString(), color: "text-[#2ECC71]" },
          { label: "Scheduled", value: "0", color: "text-blue-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-[#D5F5E3]">
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-sm text-[#6B7280] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {reports.map((r, i) => (
          <div key={r.id || i} className="bg-white rounded-2xl p-5 shadow-sm border border-[#D5F5E3] flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#D5F5E3] text-[#145A32] shrink-0">
              <FileText size={20} aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[#111827] truncate">{r.name}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${typeColor[r.type] || "bg-gray-100 text-gray-700"}`}>{r.type}</span>
                <span className="text-xs text-[#6B7280]">{new Date(r.createdAt || Date.now()).toLocaleDateString()} · {r.size || "Unknown"} · {r.format || "PDF"}</span>
              </div>
            </div>
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#D5F5E3] text-[#145A32] font-bold text-xs hover:bg-[#2ECC71] transition shrink-0"
              aria-label={`Download ${r.name}`}
            >
              <Download size={14} aria-hidden /> Download
            </button>
          </div>
        ))}
        {reports.length === 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#D5F5E3] text-center">
            <p className="text-[#6B7280]">No reports available to download.</p>
          </div>
        )}
      </div>
    </div>
  );
}
