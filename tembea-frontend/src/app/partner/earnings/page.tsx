"use client";

import { DollarSign, TrendingUp, Download, ArrowUpRight } from "lucide-react";

const monthly = [
  { month: "Jan 2025", gross: 12400, fee: 1240, net: 11160, bookings: 18 },
  { month: "Feb 2025", gross: 15300, fee: 1530, net: 13770, bookings: 22 },
  { month: "Mar 2025", gross: 14100, fee: 1410, net: 12690, bookings: 20 },
  { month: "Apr 2025", gross: 18700, fee: 1870, net: 16830, bookings: 27 },
  { month: "May 2025", gross: 16200, fee: 1620, net: 14580, bookings: 23 },
  { month: "Jun 2025", gross: 19800, fee: 1980, net: 17820, bookings: 31 },
];

export default function PartnerEarningsPage() {
  const totalNet = monthly.reduce((s, m) => s + m.net, 0);
  const totalGross = monthly.reduce((s, m) => s + m.gross, 0);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D5F5E3]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-[#111827]">Earnings</h1>
            <p className="text-[#6B7280] mt-1">Your revenue and payout history.</p>
          </div>
          <button className="btn-base btn-dark btn-sm">
            <Download size={14} aria-hidden /> Download Statement
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#D5F5E3]">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-9 h-9 rounded-xl bg-[#D5F5E3] flex items-center justify-center">
              <DollarSign size={18} className="text-[#145A32]" aria-hidden />
            </span>
            <p className="text-xs font-bold text-[#6B7280]">Total Gross (6mo)</p>
          </div>
          <p className="text-3xl font-black text-[#111827]">${(totalGross / 1000).toFixed(1)}k</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#D5F5E3]">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-9 h-9 rounded-xl bg-[#D5F5E3] flex items-center justify-center">
              <TrendingUp size={18} className="text-[#145A32]" aria-hidden />
            </span>
            <p className="text-xs font-bold text-[#6B7280]">Total Net (6mo)</p>
          </div>
          <p className="text-3xl font-black text-[#111827]">${(totalNet / 1000).toFixed(1)}k</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#D5F5E3]">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-9 h-9 rounded-xl bg-[#D5F5E3] flex items-center justify-center">
              <ArrowUpRight size={18} className="text-[#145A32]" aria-hidden />
            </span>
            <p className="text-xs font-bold text-[#6B7280]">Platform Fee</p>
          </div>
          <p className="text-3xl font-black text-[#111827]">10%</p>
        </div>
      </div>

      {/* Monthly table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#D5F5E3] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#f8faf9] text-xs text-[#6B7280] uppercase font-bold">
            <tr>
              <th className="p-4">Month</th>
              <th className="p-4">Bookings</th>
              <th className="p-4">Gross Revenue</th>
              <th className="p-4">Platform Fee (10%)</th>
              <th className="p-4 text-[#145A32]">Net Payout</th>
            </tr>
          </thead>
          <tbody>
            {monthly.map((m) => (
              <tr key={m.month} className="border-t border-[#D5F5E3] hover:bg-[#f8faf9] transition">
                <td className="p-4 font-bold">{m.month}</td>
                <td className="p-4">{m.bookings}</td>
                <td className="p-4">${m.gross.toLocaleString()}</td>
                <td className="p-4 text-red-600">-${m.fee.toLocaleString()}</td>
                <td className="p-4 font-black text-[#145A32]">${m.net.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
