"use client";

import { Car, Search, Filter, MoreHorizontal } from "lucide-react";

const vehicles = [
  { id: "TRP-001", name: "Toyota Prado Fleet", partner: "Kigali Express Transfers", type: "SUV", bookings: 80, revenue: "$6,500", status: "Active" },
  { id: "TRP-002", name: "Coaster Bus — Volcanoes Route", partner: "Rwanda Coaches", type: "Bus", bookings: 140, revenue: "$4,200", status: "Active" },
  { id: "TRP-003", name: "Airport Shuttle", partner: "RwandAir Ground", type: "Minivan", bookings: 210, revenue: "$3,150", status: "Active" },
  { id: "TRP-004", name: "Moto Taxi Network", partner: "SafeBoda Rwanda", type: "Motorcycle", bookings: 520, revenue: "$2,080", status: "Active" },
  { id: "TRP-005", name: "Luxury Sprinter", partner: "Elite Transport", type: "Van", bookings: 24, revenue: "$3,600", status: "Pending" },
];

export default function AdminTransportPage() {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D5F5E3]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-[#111827]">Transport</h1>
            <p className="text-[#6B7280] mt-1">Manage vehicle listings, rentals, and transport bookings.</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" aria-hidden />
              <input type="search" placeholder="Search vehicles…" className="field-control pl-9 py-2 text-sm w-48" aria-label="Search vehicles" />
            </div>
            <button className="btn-base btn-ghost btn-sm"><Filter size={14} aria-hidden /> Filter</button>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 text-center">
        {[
          { label: "Total Listings", value: "96", color: "text-[#145A32]" },
          { label: "Bookings This Month", value: "974", color: "text-[#2ECC71]" },
          { label: "Revenue", value: "$19.5k", color: "text-[#145A32]" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-[#D5F5E3]">
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-sm text-[#6B7280] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#D5F5E3] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#f8faf9] text-xs text-[#6B7280] uppercase font-bold">
            <tr>
              <th className="p-4">Vehicle / Service</th>
              <th className="p-4">Partner</th>
              <th className="p-4">Type</th>
              <th className="p-4 hidden md:table-cell">Bookings</th>
              <th className="p-4 hidden lg:table-cell">Revenue</th>
              <th className="p-4">Status</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id} className="border-t border-[#D5F5E3] hover:bg-[#f8faf9] transition">
                <td className="p-4 font-bold text-sm text-[#111827]">{v.name}</td>
                <td className="p-4 text-sm">{v.partner}</td>
                <td className="p-4 text-sm">{v.type}</td>
                <td className="p-4 text-sm hidden md:table-cell">{v.bookings}</td>
                <td className="p-4 font-black text-sm text-[#145A32] hidden lg:table-cell">{v.revenue}</td>
                <td className="p-4">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${v.status === "Active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{v.status}</span>
                </td>
                <td className="p-4">
                  <button className="p-1.5 rounded-lg hover:bg-[#D5F5E3] transition" aria-label={`Options for ${v.name}`}>
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
