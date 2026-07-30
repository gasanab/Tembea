"use client";

import { useState, useEffect } from "react";
import { Filter, Download, MoreHorizontal } from "lucide-react";
import { adminApi } from "@/lib/api-client";

const statusColor: Record<string, string> = {
  COMPLETED: "bg-[#D5F5E3] text-[#145A32]",
  PENDING: "bg-[#FEF3C7] text-[#92400E]",
  REFUNDED: "bg-red-100 text-red-700",
  FAILED: "bg-red-100 text-red-700",
};

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getTransactions();
      const transactionsList = Array.isArray(response) ? response : response?.data || response?.transactions || [];
      setTransactions(transactionsList);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      setTransactions([]);
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
            <h1 className="text-2xl font-black text-[#111827]">Transactions</h1>
            <p className="text-[#6B7280] mt-1">All financial transactions across the platform.</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-base btn-ghost btn-sm"><Filter size={14} aria-hidden /> Filter</button>
            <button className="btn-base btn-dark btn-sm"><Download size={14} aria-hidden /> Export</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#D5F5E3] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#f8faf9] text-xs text-[#6B7280] uppercase font-bold">
            <tr>
              <th className="p-4">TXN ID</th>
              <th className="p-4">User</th>
              <th className="p-4 hidden md:table-cell">Service</th>
              <th className="p-4">Amount</th>
              <th className="p-4 hidden lg:table-cell">Commission</th>
              <th className="p-4 hidden lg:table-cell">Net</th>
              <th className="p-4">Status</th>
              <th className="p-4 hidden md:table-cell">Date</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr key={txn.id} className="border-t border-[#D5F5E3] hover:bg-[#f8faf9] transition">
                <td className="p-4 font-black text-sm text-[#145A32]">{txn.id}</td>
                <td className="p-4 font-bold text-sm">{txn.user?.name || txn.userName || "Guest"}</td>
                <td className="p-4 text-sm hidden md:table-cell">{txn.listing?.name || txn.serviceName || "N/A"}</td>
                <td className="p-4 font-black">${txn.amount || 0}</td>
                <td className="p-4 text-sm text-[#6B7280] hidden lg:table-cell">${txn.commission || 0}</td>
                <td className="p-4 font-bold text-[#145A32] hidden lg:table-cell">${txn.netAmount || txn.net || 0}</td>
                <td className="p-4">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor[txn.status] || "bg-gray-100 text-gray-700"}`}>{txn.status}</span>
                </td>
                <td className="p-4 text-sm text-[#6B7280] hidden md:table-cell">{new Date(txn.createdAt).toLocaleDateString()}</td>
                <td className="p-4">
                  <button className="p-1.5 rounded-lg hover:bg-[#D5F5E3] transition" aria-label="Transaction options">
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
