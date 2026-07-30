"use client";

import { useState, useEffect } from "react";
import { Building2, Search, Filter, MoreHorizontal, ShieldCheck, Eye, CheckCircle2, XCircle, Ban } from "lucide-react";
import { adminApi } from "@/lib/api-client";

const statusStyle: Record<string, string> = {
  VERIFIED: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  SUSPENDED: "bg-red-100 text-red-700",
};

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, suspended: 0 });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllPartners();
      const partnersList = Array.isArray(response) ? response : response?.data || response?.partners || [];
      setPartners(partnersList);
      
      // Calculate stats
      const total = partnersList.length;
      const pending = partnersList.filter((p: any) => p.status === "PENDING").length;
      const suspended = partnersList.filter((p: any) => p.status === "SUSPENDED").length;
      setStats({ total, pending, suspended });
    } catch (error) {
      console.error("Failed to fetch partners:", error);
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (partnerId: string, action: string) => {
    setActiveDropdown(null);
    setProcessingAction(`${partnerId}-${action}`);

    try {
      switch (action) {
        case "verify":
          await adminApi.verifyPartner(partnerId, "VERIFIED");
          alert("Partner verified successfully!");
          break;
        case "suspend":
          await adminApi.suspendPartner(partnerId);
          alert("Partner suspended successfully!");
          break;
        case "view":
          // Navigate to partner details or open modal
          console.log("View partner:", partnerId);
          break;
        default:
          break;
      }
      await fetchPartners(); // Refresh the list
    } catch (error) {
      console.error(`Failed to ${action} partner:`, error);
      alert(`Failed to ${action} partner. Please try again.`);
    } finally {
      setProcessingAction(null);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    if (activeDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [activeDropdown]);

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
            <h1 className="text-2xl font-black text-[#111827]">Partners</h1>
            <p className="text-[#6B7280] mt-1">Manage all registered business partners on the platform.</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" aria-hidden />
              <input type="search" placeholder="Search partners…" className="field-control pl-9 py-2 text-sm w-48" aria-label="Search partners" />
            </div>
            <button className="btn-base btn-ghost btn-sm">
              <Filter size={14} aria-hidden /> Filter
            </button>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 text-center">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#D5F5E3]">
          <p className="text-3xl font-black text-[#145A32]">{stats.total.toLocaleString()}</p>
          <p className="text-sm text-[#6B7280] mt-1">Total Partners</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#D5F5E3]">
          <p className="text-3xl font-black text-amber-600">{stats.pending}</p>
          <p className="text-sm text-[#6B7280] mt-1">Pending Verification</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#D5F5E3]">
          <p className="text-3xl font-black text-red-600">{stats.suspended}</p>
          <p className="text-sm text-[#6B7280] mt-1">Suspended</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#D5F5E3] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#f8faf9] text-xs text-[#6B7280] uppercase font-bold">
            <tr>
              <th className="p-4">Partner</th>
              <th className="p-4">Type</th>
              <th className="p-4 hidden md:table-cell">Listings</th>
              <th className="p-4 hidden lg:table-cell">Revenue</th>
              <th className="p-4 hidden lg:table-cell">Joined</th>
              <th className="p-4">Status</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {partners.map((partner) => (
              <tr key={partner.id} className="border-t border-[#D5F5E3] hover:bg-[#f8faf9] transition">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#D5F5E3] text-[#145A32] flex items-center justify-center">
                      <Building2 size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#111827]">{partner.businessName || partner.name}</p>
                      <p className="text-xs text-[#6B7280]">{partner.user?.name || partner.owner}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm">{partner.category || partner.type}</td>
                <td className="p-4 text-sm hidden md:table-cell">{partner._count?.listings || 0}</td>
                <td className="p-4 font-black text-sm hidden lg:table-cell text-[#145A32]">${(partner._count?.listings || 0) * 1200}</td>
                <td className="p-4 text-sm hidden lg:table-cell">{new Date(partner.createdAt).toLocaleDateString()}</td>
                <td className="p-4">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusStyle[partner.status] || "bg-gray-100 text-gray-700"}`}>{partner.status}</span>
                </td>
                <td className="p-4">
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(activeDropdown === partner.id ? null : partner.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-[#D5F5E3] transition"
                      aria-label={`Options for ${partner.businessName || partner.name}`}
                    >
                      <MoreHorizontal size={16} className="text-[#6B7280]" aria-hidden />
                    </button>
                    
                    {activeDropdown === partner.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                        <button
                          onClick={() => handleAction(partner.id, "view")}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                        >
                          <Eye size={16} />
                          View Details
                        </button>
                        {partner.status !== "VERIFIED" && (
                          <button
                            onClick={() => handleAction(partner.id, "verify")}
                            disabled={processingAction === `${partner.id}-verify`}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-green-700 hover:bg-green-50 transition disabled:opacity-50"
                          >
                            <CheckCircle2 size={16} />
                            {processingAction === `${partner.id}-verify` ? "Verifying..." : "Verify Partner"}
                          </button>
                        )}
                        {partner.status !== "SUSPENDED" && (
                          <button
                            onClick={() => handleAction(partner.id, "suspend")}
                            disabled={processingAction === `${partner.id}-suspend`}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 transition disabled:opacity-50"
                          >
                            <Ban size={16} />
                            {processingAction === `${partner.id}-suspend` ? "Suspending..." : "Suspend Partner"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
