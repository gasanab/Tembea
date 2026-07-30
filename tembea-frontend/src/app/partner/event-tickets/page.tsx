"use client";

import { useState } from "react";
import {
  Ticket,
  Plus,
  Edit2,
  Download,
  DollarSign,
  Users,
  TrendingUp,
  X,
} from "lucide-react";

interface TicketCategory {
  id: number;
  name: string;
  price: number;
  totalSeats: number;
  sold: number;
  color: string;
  perks: string[];
}

const COLOR_OPTIONS: { label: string; value: string }[] = [
  { label: "Gold (VIP)", value: "#EAB308" },
  { label: "Purple (Premium)", value: "#9333EA" },
  { label: "Green (Standard)", value: "#22c55e" },
  { label: "Blue (Early Bird)", value: "#3B82F6" },
];

const initialCategories: TicketCategory[] = [
  {
    id: 1,
    name: "VIP",
    price: 150,
    totalSeats: 150,
    sold: 120,
    color: "#9333EA",
    perks: ["Meet & Greet", "Front Row", "Gift Pack", "Backstage Access"],
  },
  {
    id: 2,
    name: "Premium",
    price: 75,
    totalSeats: 350,
    sold: 300,
    color: "#3B82F6",
    perks: ["Priority Entry", "Reserved Seating", "Complimentary Drink"],
  },
  {
    id: 3,
    name: "Standard",
    price: 35,
    totalSeats: 500,
    sold: 430,
    color: "#22c55e",
    perks: ["General Admission"],
  },
];

const emptyForm: Omit<TicketCategory, "id"> = {
  name: "",
  price: 0,
  totalSeats: 100,
  sold: 0,
  color: "#22c55e",
  perks: [],
};

interface ModalState {
  open: boolean;
  mode: "add" | "edit";
  category: TicketCategory | null;
}

export default function EventTicketsPage() {
  const [categories, setCategories] = useState<TicketCategory[]>(initialCategories);
  const [modal, setModal] = useState<ModalState>({ open: false, mode: "add", category: null });
  const [formData, setFormData] = useState<Omit<TicketCategory, "id">>(emptyForm);
  const [perksInput, setPerksInput] = useState("");

  const totalRevenue = categories.reduce((s, c) => s + c.price * c.sold, 0);
  const totalSold = categories.reduce((s, c) => s + c.sold, 0);
  const totalSeats = categories.reduce((s, c) => s + c.totalSeats, 0);
  const remaining = totalSeats - totalSold;
  const salesPercent = totalSeats > 0 ? Math.round((totalSold / totalSeats) * 100) : 0;

  function openAdd() {
    setFormData(emptyForm);
    setPerksInput("");
    setModal({ open: true, mode: "add", category: null });
  }

  function openEdit(cat: TicketCategory) {
    setFormData({ ...cat });
    setPerksInput(cat.perks.join(", "));
    setModal({ open: true, mode: "edit", category: cat });
  }

  function closeModal() {
    setModal({ open: false, mode: "add", category: null });
  }

  function handleSave() {
    const perks = perksInput
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    const data = { ...formData, perks };

    if (modal.mode === "add") {
      setCategories((prev) => [...prev, { ...data, id: Date.now() }]);
    } else {
      setCategories((prev) =>
        prev.map((c) => (c.id === modal.category!.id ? { ...data, id: modal.category!.id } : c))
      );
    }
    closeModal();
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D5F5E3]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-[#111827]">Event Tickets</h1>
            <p className="text-[#6B7280] mt-1">Manage ticket categories and track sales</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#145A32] text-white font-bold text-sm hover:bg-[#0e3d22] transition"
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign },
          { label: "Tickets Sold", value: totalSold.toLocaleString(), icon: Ticket },
          { label: "Remaining", value: remaining.toLocaleString(), icon: Users },
          { label: "Sales Progress", value: `${salesPercent}%`, icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-[#D5F5E3]">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-9 h-9 rounded-xl bg-[#D5F5E3] flex items-center justify-center">
                <Icon size={18} className="text-[#145A32]" />
              </span>
              <p className="text-xs font-bold text-[#6B7280]">{label}</p>
            </div>
            <p className="text-3xl font-black text-[#111827]">{value}</p>
          </div>
        ))}
      </div>

      {/* Overall progress */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#D5F5E3]">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-bold text-[#374151]">Overall Sales Progress</span>
          <span className="text-sm font-black text-[#145A32]">{salesPercent}%</span>
        </div>
        <div className="h-3 bg-[#D5F5E3] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#2ECC71] to-[#145A32] rounded-full transition-all"
            style={{ width: `${salesPercent}%` }}
          />
        </div>
        <p className="text-xs text-[#6B7280] mt-1.5">
          {totalSold} sold of {totalSeats} total seats
        </p>
      </div>

      {/* Category cards */}
      <div className="grid md:grid-cols-3 gap-5">
        {categories.map((cat) => {
          const pct = cat.totalSeats > 0 ? Math.round((cat.sold / cat.totalSeats) * 100) : 0;
          return (
            <div
              key={cat.id}
              className="bg-white rounded-2xl shadow-sm border border-[#D5F5E3] overflow-hidden"
              style={{ borderLeft: `4px solid ${cat.color}` }}
            >
              <div className="p-5 space-y-4">
                {/* Name & price */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-black text-[#111827] text-lg">{cat.name}</h3>
                    <p className="text-2xl font-black mt-0.5" style={{ color: cat.color }}>
                      ${cat.price}
                    </p>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-lg text-white text-xs font-bold"
                    style={{ backgroundColor: cat.color }}
                  >
                    {pct}% sold
                  </span>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: cat.color }}
                    />
                  </div>
                  <p className="text-xs text-[#6B7280] mt-1">
                    {cat.sold} sold / {cat.totalSeats - cat.sold} remaining
                  </p>
                </div>

                {/* Perks */}
                {cat.perks.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-[#374151] mb-1.5">Perks</p>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.perks.map((perk) => (
                        <span
                          key={perk}
                          className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: `${cat.color}18`, color: cat.color }}
                        >
                          {perk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-[#D5F5E3]">
                  <button
                    onClick={() => openEdit(cat)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[#145A32] text-[#145A32] font-bold text-sm hover:bg-[#D5F5E3] transition"
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#f5fbf7] border border-[#D5F5E3] text-[#145A32] font-bold text-sm hover:bg-[#D5F5E3] transition">
                    <Download size={14} />
                    Export
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#D5F5E3]">
              <h2 className="text-xl font-black text-[#111827]">
                {modal.mode === "add" ? "Add Ticket Category" : "Edit Category"}
              </h2>
              <button onClick={closeModal} className="p-2 rounded-xl hover:bg-[#D5F5E3] transition">
                <X size={18} className="text-[#145A32]" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: "Category Name", key: "name", type: "text" },
                { label: "Price ($)", key: "price", type: "number" },
                { label: "Total Seats", key: "totalSeats", type: "number" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-sm font-bold text-[#374151] mb-1">{label}</label>
                  <input
                    type={type}
                    value={(formData as Record<string, unknown>)[key] as string | number}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [key]: type === "number" ? Number(e.target.value) : e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D5F5E3] focus:outline-none focus:border-[#2ECC71] text-sm"
                  />
                </div>
              ))}

              {/* Color picker */}
              <div>
                <label className="block text-sm font-bold text-[#374151] mb-2">Category Color</label>
                <div className="flex gap-3 flex-wrap">
                  {COLOR_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, color: opt.value }))}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition ${
                        formData.color === opt.value
                          ? "border-[#145A32] bg-[#f5fbf7]"
                          : "border-transparent bg-gray-50"
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: opt.value }}
                      />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#374151] mb-1">
                  Perks (comma-separated)
                </label>
                <input
                  type="text"
                  value={perksInput}
                  onChange={(e) => setPerksInput(e.target.value)}
                  placeholder="Meet & Greet, Front Row, Gift Pack"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D5F5E3] focus:outline-none focus:border-[#2ECC71] text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-[#D5F5E3]">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-xl border border-[#D5F5E3] text-[#6B7280] font-bold text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 rounded-xl bg-[#145A32] text-white font-bold text-sm hover:bg-[#0e3d22] transition"
              >
                {modal.mode === "add" ? "Add Category" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
