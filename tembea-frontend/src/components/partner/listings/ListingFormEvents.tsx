"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus, Trash2, X, Upload, MapPin, Ticket, Star, Calendar,
  Clock, Globe, Music, Users, ChevronDown, ChevronUp,
  CheckCircle, Circle, AlertCircle, Eye, Save, Send,
  Link2, Instagram, Facebook, Youtube, Linkedin
} from "lucide-react";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { uploadsApi } from "@/lib/api-client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TicketCategory {
  id: string;
  name: string;
  icon: string;
  price: number;
  quantity: number;
  maxPerCustomer: number;
  salesStart: string;
  salesEnd: string;
  benefits: string[];
  refundable: boolean;
  seatNumber?: string;
  groupSize?: number;
  color: string;
}

interface EventFormData {
  // Basic
  name: string;
  eventCategory: string;
  organizerName: string;
  organizerLogo: string;
  bannerImage: string;
  coverPhoto: string;
  galleryImages: string[];
  promoVideo: string;
  youtubeLink: string;
  // Location
  country: string;
  province: string;
  district: string;
  sector: string;
  venueName: string;
  streetAddress: string;
  mapLocation: string;
  indoorOutdoor: string;
  // Schedule
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  isOneDayEvent: boolean;
  isMultipleDays: boolean;
  isRecurringEvent: boolean;
  isOnlineEvent: boolean;
  meetingLink: string;
  onlinePlatform: string;
  // Description
  description: string;
  agenda: string;
  highlights: string;
  attendeeExpectations: string;
  dressCode: string;
  languages: string[];
  ageRestriction: string;
  accessibilityInfo: string;
  // Tickets
  ticketCategories: TicketCategory[];
  // Seating
  hasSeats: boolean;
  seatingMapUrl: string;
  seatSections: string;
  seatRows: string;
  seatNumbers: string;
  // Capacity
  maxAttendance: number;
  standingCapacity: number;
  seatedCapacity: number;
  // Pricing
  currency: string;
  taxesIncluded: boolean;
  discountCode: string;
  earlyBirdDiscount: number;
  studentDiscount: number;
  bulkDiscount: number;
  // Contact
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  website: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  twitter: string;
  linkedin: string;
  // Amenities
  amenities: string[];
  // Tags
  tags: string[];
  // SEO
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  // AI
  suitableFor: string[];
  // Policies
  policies: string[];
}

interface EventFormProps {
  data: Partial<EventFormData>;
  onChange: (data: Partial<EventFormData>) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EVENT_CATEGORIES = [
  "Concert", "Festival", "Conference", "Business Summit", "Sports",
  "Comedy Show", "Workshop", "Exhibition", "Cultural Event", "Fashion Show",
  "Networking", "Religious Event", "Community Event", "Other"
];

const ONLINE_PLATFORMS = ["Zoom", "Google Meet", "Teams", "YouTube Live", "Other"];

const ALL_LANGUAGES = [
  "English", "French", "Kinyarwanda", "Swahili", "Arabic",
  "German", "Italian", "Portuguese", "Mandarin", "Spanish"
];

const AMENITIES_OPTIONS = [
  "Wi-Fi", "Parking", "Restrooms", "Food & Drinks", "Wheelchair Accessible",
  "Air Conditioning", "Security", "Medical Staff", "Merchandise Stalls",
  "VIP Lounge", "Smoking Area"
];

const TICKET_ICONS: Record<string, string> = {
  "General Admission": "🎟",
  "Regular": "🎫",
  "VIP": "⭐",
  "VVIP": "👑",
  "Student": "🎓",
  "Children": "👶",
  "Early Bird": "🐦",
  "Couple": "💑",
  "Group/Family": "👪",
  "Table": "🍽️",
  "Group Ticket": "👥",
  "Corporate": "💼",
  "Sponsor": "🏆",
};

const TICKET_COLORS: Record<string, string> = {
  "General Admission": "bg-blue-50 border-blue-300",
  "Regular": "bg-cyan-50 border-cyan-300",
  "VIP": "bg-amber-50 border-amber-300",
  "VVIP": "bg-purple-50 border-purple-300",
  "Student": "bg-green-50 border-green-300",
  "Children": "bg-pink-50 border-pink-300",
  "Early Bird": "bg-teal-50 border-teal-300",
  "Couple": "bg-rose-50 border-rose-300",
  "Group/Family": "bg-orange-50 border-orange-300",
  "Table": "bg-stone-50 border-stone-300",
  "Group Ticket": "bg-indigo-50 border-indigo-300",
  "Corporate": "bg-slate-50 border-slate-300",
  "Sponsor": "bg-yellow-50 border-yellow-300",
};

const TICKET_PRESET_BENEFITS: Record<string, string[]> = {
  "VIP": ["Reserved Seat", "Free Drink", "Priority Entry", "Backstage Access"],
  "VVIP": ["Meet & Greet", "Reserved Table", "Parking", "Private Entrance", "Gift Package", "Dinner", "Private Lounge"],
  "Early Bird": ["Early Entry", "Discount Applied"],
  "Group": ["Group Seating", "Group Discount"],
  "Corporate": ["Branded Seating", "Networking Access", "Business Lounge"],
};

const AMENITY_LIST = [
  "Parking", "Food Court", "WiFi", "Wheelchair Access", "Medical Services",
  "Restrooms", "Security", "VIP Lounge", "ATM", "Charging Station",
  "Photography Allowed", "Smoking Area", "Child Friendly"
];

const TAGS = [
  "Music", "Business", "Education", "Culture", "Tourism",
  "Networking", "Festival", "Family", "Food", "Technology",
  "Art", "Comedy", "Sports"
];

const SUITABLE_FOR = [
  "Families", "Students", "Business", "Tourists", "Foreign Visitors",
  "Children", "Couples", "Groups"
];

const POLICY_OPTIONS = [
  "Refund Policy", "Cancellation Policy", "No Refund",
  "Transfer Ticket", "Age Restriction", "Terms & Conditions"
];

// ─── Helper Components ────────────────────────────────────────────────────────

function SectionHeader({ step, title, icon }: { step: number; title: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-black flex-shrink-0">
        {step}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-emerald-600">{icon}</span>
        <h3 className="text-base font-black text-gray-800">{title}</h3>
      </div>
    </div>
  );
}

function ESection({ step, title, icon, children }: {
  step: number; title: string; icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 p-5 shadow-sm space-y-4">
      <SectionHeader step={step} title={title} icon={icon} />
      {children}
    </div>
  );
}

function ELabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <span className="text-sm font-bold text-gray-700">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </span>
  );
}

function EInput({ label, required, ...props }: any) {
  return (
    <label className="block space-y-1">
      <ELabel required={required}>{label}</ELabel>
      <input
        {...props}
        className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none font-semibold text-sm"
      />
    </label>
  );
}

function ETextarea({ label, required, rows = 4, ...props }: any) {
  return (
    <label className="block space-y-1">
      <ELabel required={required}>{label}</ELabel>
      <textarea
        rows={rows}
        {...props}
        className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none font-semibold text-sm resize-none"
      />
    </label>
  );
}

function ESelect({ label, required, options, ...props }: any) {
  return (
    <label className="block space-y-1">
      <ELabel required={required}>{label}</ELabel>
      <select
        {...props}
        className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none font-semibold text-sm"
      >
        <option value="">Select...</option>
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function CheckChip({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 cursor-pointer transition-all text-sm font-semibold select-none ${checked ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"}`}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="hidden" />
      {checked ? <CheckCircle size={14} className="text-emerald-600" /> : <Circle size={14} className="text-gray-400" />}
      {label}
    </label>
  );
}

function TagPill({ label, selected, onToggle }: { label: string; selected: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${selected ? "bg-emerald-600 text-white shadow" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
    >
      {selected && "✓ "}{label}
    </button>
  );
}

// ─── Image Upload ─────────────────────────────────────────────────────────────

function SmallImageUpload({ value, onChange, label }: { value: string; onChange: (url: string) => void; label: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadsApi.uploadImage(file);
      onChange(result.url);
    } catch { /* silent */ } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-1">
      <ELabel>{label}</ELabel>
      <div
        onClick={() => ref.current?.click()}
        className="relative w-full h-28 rounded-xl border-2 border-dashed border-gray-300 hover:border-emerald-500 cursor-pointer overflow-hidden transition-all group"
      >
        {value ? (
          <>
            <img src={value} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
              <Upload size={20} className="text-white" />
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-gray-400">
            <Upload size={20} />
            <span className="text-xs font-semibold">{uploading ? "Uploading..." : "Click to upload"}</span>
          </div>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

function GalleryUpload({ images, onChange, max = 10 }: { images: string[]; onChange: (urls: string[]) => void; max?: number }) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const results = await Promise.all(files.slice(0, max - images.length).map(f => uploadsApi.uploadImage(f)));
      onChange([...images, ...results.map(r => r.url)]);
    } catch { /* silent */ } finally {
      setUploading(false);
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-5 gap-2">
        {images.map((img, i) => (
          <div key={i} className="relative group aspect-square">
            <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, idx) => idx !== i))}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        {images.length < max && (
          <div
            onClick={() => ref.current?.click()}
            className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-emerald-500 cursor-pointer flex items-center justify-center text-gray-400 hover:text-emerald-500 transition-all"
          >
            <Plus size={20} />
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400">{images.length}/{max} images</p>
      <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
      {uploading && <p className="text-xs text-emerald-600 font-semibold animate-pulse">Uploading images...</p>}
    </div>
  );
}

// ─── Ticket Builder ───────────────────────────────────────────────────────────

const TICKET_TYPES = [
  "General Admission", "Regular", "VIP", "VVIP", "Student",
  "Children", "Early Bird", "Couple", "Group/Family", "Table", "Corporate", "Sponsor"
];

function TicketCard({
  ticket,
  index,
  onUpdate,
  onRemove,
  formatRwf
}: {
  ticket: TicketCategory;
  index: number;
  onUpdate: (field: string, value: any) => void;
  onRemove: () => void;
  formatRwf: (v: number) => string;
}) {
  const [expanded, setExpanded] = useState(true);
  const [newBenefit, setNewBenefit] = useState("");
  const presets = TICKET_PRESET_BENEFITS[ticket.name] || [];

  return (
    <div className={`border-2 rounded-2xl overflow-hidden ${TICKET_COLORS[ticket.name] || "bg-gray-50 border-gray-200"}`}>
      {/* Card Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="text-2xl">{TICKET_ICONS[ticket.name] || "🎟"}</span>
        <div className="flex-1">
          <p className="font-black text-gray-900">{ticket.name || `Ticket ${index + 1}`}</p>
          <p className="text-xs text-gray-500">
            ${ticket.price} · {ticket.quantity} available · {formatRwf(ticket.price)}
          </p>
        </div>
        <button type="button" onClick={() => setExpanded(!expanded)} className="p-1 text-gray-500 hover:text-gray-800">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        <button type="button" onClick={onRemove} className="p-1 text-red-500 hover:bg-red-50 rounded-lg">
          <Trash2 size={16} />
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-white/60">
          <div className="grid grid-cols-2 gap-3 mt-3">
            {/* Name */}
            <div className="col-span-2">
              <ELabel>Ticket Name</ELabel>
              <input
                type="text"
                list="ticket-types"
                value={ticket.name}
                onChange={e => onUpdate("name", e.target.value)}
                placeholder="e.g. VIP, Regular, Student..."
                className="w-full px-4 py-2.5 rounded-xl border-2 border-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none font-semibold text-sm mt-1"
              />
              <datalist id="ticket-types">
                {TICKET_TYPES.map(t => <option key={t} value={t} />)}
              </datalist>
            </div>
            {/* Price */}
            <div>
              <ELabel>Price ($)</ELabel>
              <div className="mt-1">
                <input
                  type="number"
                  value={ticket.price || ""}
                  onChange={e => onUpdate("price", parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none font-semibold text-sm"
                />
                <p className="text-xs font-semibold text-emerald-700 mt-1">{formatRwf(ticket.price)}</p>
              </div>
            </div>
            {/* Quantity */}
            <div>
              <ELabel>Available Quantity</ELabel>
              <input
                type="number"
                value={ticket.quantity || ""}
                onChange={e => onUpdate("quantity", parseInt(e.target.value) || 0)}
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none font-semibold text-sm mt-1"
              />
            </div>
            {/* Max per customer */}
            <div>
              <ELabel>Max per Customer</ELabel>
              <input
                type="number"
                value={ticket.maxPerCustomer || ""}
                onChange={e => onUpdate("maxPerCustomer", parseInt(e.target.value) || 0)}
                placeholder="10"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none font-semibold text-sm mt-1"
              />
            </div>
            {/* Seat (VVIP) */}
            {ticket.name === "VVIP" && (
              <div>
                <ELabel>Seat Number</ELabel>
                <input
                  type="text"
                  value={ticket.seatNumber || ""}
                  onChange={e => onUpdate("seatNumber", e.target.value)}
                  placeholder="e.g. A12"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none font-semibold text-sm mt-1"
                />
              </div>
            )}
            {/* Number of People / Seats */}
            {(ticket.name === "Group/Family" || ticket.name.toLowerCase().includes("group") || ticket.name === "Table") && (
              <div>
                <ELabel>{ticket.name === "Table" ? "Number of Seats per Table" : "Number of People"}</ELabel>
                <input
                  type="number"
                  value={ticket.groupSize || ""}
                  onChange={e => onUpdate("groupSize", parseInt(e.target.value) || 0)}
                  placeholder={ticket.name === "Table" ? "e.g. 6" : "e.g. 4"}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none font-semibold text-sm mt-1"
                />
              </div>
            )}

            {/* Sales dates */}
            <div>
              <ELabel>Sales Start Date</ELabel>
              <input
                type="date"
                value={ticket.salesStart || ""}
                onChange={e => onUpdate("salesStart", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none font-semibold text-sm mt-1"
              />
            </div>
            <div>
              <ELabel>Sales End Date</ELabel>
              <input
                type="date"
                value={ticket.salesEnd || ""}
                onChange={e => onUpdate("salesEnd", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none font-semibold text-sm mt-1"
              />
            </div>
          </div>

          {/* Benefits */}
          <div>
            <ELabel>Benefits</ELabel>
            {presets.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 mb-2">
                {presets.map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => {
                      if (!ticket.benefits.includes(b)) onUpdate("benefits", [...ticket.benefits, b]);
                    }}
                    className={`text-xs px-2 py-1 rounded-lg border font-semibold transition-all ${ticket.benefits.includes(b) ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-gray-300 text-gray-600 hover:border-emerald-400"}`}
                  >
                    {ticket.benefits.includes(b) ? "✓ " : "+ "}{b}
                  </button>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {ticket.benefits.map((b, bi) => (
                <span key={bi} className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">
                  ✓ {b}
                  <button type="button" onClick={() => onUpdate("benefits", ticket.benefits.filter((_, i) => i !== bi))}>
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newBenefit}
                onChange={e => setNewBenefit(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (newBenefit.trim()) {
                      onUpdate("benefits", [...ticket.benefits, newBenefit.trim()]);
                      setNewBenefit("");
                    }
                  }
                }}
                placeholder="Type a benefit & press Enter"
                className="flex-1 px-3 py-2 rounded-xl border-2 border-white focus:border-emerald-500 outline-none text-sm font-semibold"
              />
            </div>
          </div>

          {/* Refundable */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={ticket.refundable}
              onChange={e => onUpdate("refundable", e.target.checked)}
              className="accent-emerald-600 w-4 h-4"
            />
            <span className="text-sm font-bold text-gray-700">Refundable Ticket</span>
          </label>
        </div>
      )}
    </div>
  );
}

// Removed LivePreview component from here

// ─── Pre-submission Checklist ─────────────────────────────────────────────────

function ChecklistItem({ done, label }: { done: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-3 py-2 px-3 rounded-xl text-sm font-semibold ${done ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-500"}`}>
      {done
        ? <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
        : <Circle size={16} className="text-gray-400 flex-shrink-0" />}
      {label}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function EventForm({ data, onChange }: EventFormProps) {
  const { formatRwf } = useExchangeRate();
  const [activeTab, setActiveTab] = useState(1);
  const [form, setForm] = useState<Partial<EventFormData>>({
    ticketCategories: [],
    galleryImages: [],
    amenities: [],
    tags: [],
    suitableFor: [],
    policies: [],
    languages: [],
    ...data,
  });

  const update = (field: string, value: any) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    onChange(updated);
  };

  const toggleArr = (field: string, item: string) => {
    const current = (form as any)[field] || [];
    const updated = current.includes(item)
      ? current.filter((x: string) => x !== item)
      : [...current, item];
    update(field, updated);
  };

  // Ticket helpers
  const addTicket = (type: string) => {
    const preset: TicketCategory = {
      id: `t_${Date.now()}`,
      name: type,
      icon: TICKET_ICONS[type] || "🎟",
      price: 0,
      quantity: 0,
      maxPerCustomer: 10,
      salesStart: "",
      salesEnd: "",
      benefits: TICKET_PRESET_BENEFITS[type] || [],
      refundable: false,
      color: TICKET_COLORS[type] || "bg-gray-50 border-gray-200",
    };
    update("ticketCategories", [...(form.ticketCategories || []), preset]);
  };

  const updateTicket = (index: number, field: string, value: any) => {
    const tickets = [...(form.ticketCategories || [])];
    tickets[index] = { ...tickets[index], [field]: value };
    update("ticketCategories", tickets);
  };

  const removeTicket = (index: number) => {
    update("ticketCategories", (form.ticketCategories || []).filter((_, i) => i !== index));
  };

  // Remaining capacity auto-calc
  const remainingCapacity = (form.maxAttendance || 0) -
    (form.ticketCategories || []).reduce((s, t) => s + (t.quantity || 0), 0);

  // Checklist
  const checks = {
    info: !!(form.name && form.eventCategory && form.organizerName),
    banner: !!form.bannerImage,
    tickets: (form.ticketCategories || []).length > 0,
    venue: !!(form.venueName || form.isOnlineEvent),
    schedule: !!(form.startDate && form.startTime),
    contact: !!(form.contactPerson && form.contactPhone),
    policies: (form.policies || []).length > 0,
  };
  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="bg-white rounded-3xl shadow-xl border-2 border-emerald-100 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto custom-scrollbar">
        {[
          { id: 1, label: "Basic Info", icon: Calendar },
          { id: 2, label: "Location & Time", icon: MapPin },
          { id: 3, label: "Details & Amenities", icon: CheckCircle },
          { id: 4, label: "Tickets & Seating", icon: Ticket },
          { id: 5, label: "Media & SEO", icon: Globe }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-bold text-sm border-b-4 transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50/50" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="p-4 md:p-8">
        {activeTab === 1 && (
          <div className="space-y-8 animate-fade-in">
        {/* ── Section 1: Basic Information ── */}
        <ESection step={1} title="Basic Event Information" icon={<Calendar size={18} />}>
          <div className="grid grid-cols-1 gap-4">
            <EInput
              label="Event Name"
              required
              value={form.name || ""}
              onChange={(e: any) => update("name", e.target.value)}
              placeholder="e.g., Kigali Jazz Festival 2025"
            />
            <ESelect
              label="Event Category"
              required
              options={EVENT_CATEGORIES}
              value={form.eventCategory || ""}
              onChange={(e: any) => update("eventCategory", e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <EInput
                label="Organizer Name"
                required
                value={form.organizerName || ""}
                onChange={(e: any) => update("organizerName", e.target.value)}
                placeholder="e.g., Rwanda Arts Council"
              />
              <SmallImageUpload
                label="Organizer Logo"
                value={form.organizerLogo || ""}
                onChange={v => update("organizerLogo", v)}
              />
            </div>
            <SmallImageUpload
              label="Event Banner"
              value={form.bannerImage || ""}
              onChange={v => update("bannerImage", v)}
            />
            <div>
              <ELabel>Gallery Images (up to 10)</ELabel>
              <div className="mt-1">
                <GalleryUpload
                  images={form.galleryImages || []}
                  onChange={v => update("galleryImages", v)}
                />
              </div>
            </div>
          </div>
        </ESection>
          </div>
        )}

        {activeTab === 2 && (
          <div className="space-y-8 animate-fade-in">
        {/* ── Section 2: Location ── */}
        <ESection step={2} title="Event Location" icon={<MapPin size={18} />}>
          <div className="grid grid-cols-2 gap-4">
            <EInput label="Country" value={form.country || ""} onChange={(e: any) => update("country", e.target.value)} placeholder="Rwanda" />
            <EInput label="Province" value={form.province || ""} onChange={(e: any) => update("province", e.target.value)} placeholder="Kigali City" />
            <EInput label="District" value={form.district || ""} onChange={(e: any) => update("district", e.target.value)} placeholder="Gasabo" />
            <EInput label="Sector" value={form.sector || ""} onChange={(e: any) => update("sector", e.target.value)} placeholder="Kimironko" />
          </div>
          <EInput label="Venue Name" required value={form.venueName || ""} onChange={(e: any) => update("venueName", e.target.value)} placeholder="e.g., BK Arena, Kigali" />
          <EInput label="Street Address" value={form.streetAddress || ""} onChange={(e: any) => update("streetAddress", e.target.value)} placeholder="e.g., KG 8 Ave" />
          <div>
            <ELabel>Google Map Location</ELabel>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={form.mapLocation || ""}
                onChange={e => update("mapLocation", e.target.value)}
                placeholder="Paste Google Maps link or coordinates"
                className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none font-semibold text-sm"
              />
              <button type="button" className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 border-2 border-emerald-200 text-emerald-700 font-bold text-sm hover:bg-emerald-100 transition-all">
                <MapPin size={16} /> Pin
              </button>
            </div>
          </div>
          <div>
            <ELabel>Indoor / Outdoor</ELabel>
            <div className="flex gap-3 mt-1">
              {["Indoor", "Outdoor", "Both"].map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => update("indoorOutdoor", opt)}
                  className={`flex-1 py-2 rounded-xl border-2 text-sm font-bold transition-all ${form.indoorOutdoor === opt ? "bg-emerald-600 text-white border-emerald-600" : "border-gray-200 text-gray-600 hover:border-emerald-300"}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </ESection>

        {/* ── Section 3: Schedule ── */}
        <ESection step={3} title="Event Schedule" icon={<Clock size={18} />}>
          <div className="grid grid-cols-2 gap-4">
            <EInput label="Start Date" type="date" value={form.startDate || ""} onChange={(e: any) => update("startDate", e.target.value)} />
            <EInput label="End Date" type="date" value={form.endDate || ""} onChange={(e: any) => update("endDate", e.target.value)} />
            <EInput label="Start Time" type="time" value={form.startTime || ""} onChange={(e: any) => update("startTime", e.target.value)} />
            <EInput label="End Time" type="time" value={form.endTime || ""} onChange={(e: any) => update("endTime", e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-3">
            <CheckChip label="One Day Event" checked={!!form.isOneDayEvent} onChange={v => update("isOneDayEvent", v)} />
            <CheckChip label="Multiple Days" checked={!!form.isMultipleDays} onChange={v => update("isMultipleDays", v)} />
            <CheckChip label="Recurring Event" checked={!!form.isRecurringEvent} onChange={v => update("isRecurringEvent", v)} />
            <CheckChip label="Online Event" checked={!!form.isOnlineEvent} onChange={v => update("isOnlineEvent", v)} />
          </div>
          {form.isOnlineEvent && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
              <EInput
                label="Meeting Link"
                value={form.meetingLink || ""}
                onChange={(e: any) => update("meetingLink", e.target.value)}
                placeholder="https://zoom.us/j/..."
              />
              <ESelect
                label="Platform"
                options={ONLINE_PLATFORMS}
                value={form.onlinePlatform || ""}
                onChange={(e: any) => update("onlinePlatform", e.target.value)}
              />
            </div>
          )}
        </ESection>
          </div>
        )}

        {activeTab === 3 && (
          <div className="space-y-8 animate-fade-in">
        {/* ── Section 4: Event Description ── */}
        <ESection step={4} title="Event Description" icon={<Globe size={18} />}>
          <ETextarea label="About the Event" required rows={5} value={form.description || ""} onChange={(e: any) => update("description", e.target.value)} placeholder="Describe your event in detail..." />
          <ETextarea label="Agenda" rows={4} value={form.agenda || ""} onChange={(e: any) => update("agenda", e.target.value)} placeholder="08:00 – Registration&#10;09:00 – Opening Ceremony..." />
          <ETextarea label="Highlights" rows={3} value={form.highlights || ""} onChange={(e: any) => update("highlights", e.target.value)} placeholder="Live performances, guest speakers, networking..." />
          <ETextarea label="What Attendees Should Expect" rows={3} value={form.attendeeExpectations || ""} onChange={(e: any) => update("attendeeExpectations", e.target.value)} placeholder="An unforgettable evening of..." />
          <div className="grid grid-cols-2 gap-4">
            <EInput label="Dress Code" value={form.dressCode || ""} onChange={(e: any) => update("dressCode", e.target.value)} placeholder="Smart casual, Black tie..." />
            <EInput label="Age Restriction" value={form.ageRestriction || ""} onChange={(e: any) => update("ageRestriction", e.target.value)} placeholder="18+, All ages..." />
          </div>
          <div>
            <ELabel>Languages</ELabel>
            <div className="flex flex-wrap gap-2 mt-2">
              {ALL_LANGUAGES.map(l => (
                <TagPill key={l} label={l} selected={(form.languages || []).includes(l)} onToggle={() => toggleArr("languages", l)} />
              ))}
            </div>
          </div>
          <ETextarea label="Accessibility Information" rows={2} value={form.accessibilityInfo || ""} onChange={(e: any) => update("accessibilityInfo", e.target.value)} placeholder="Wheelchair accessible, sign language interpreter available..." />
        </ESection>

        {/* ── Section 11: Amenities ── */}
        <ESection step={11} title="Amenities" icon={<CheckCircle size={18} />}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {AMENITIES_OPTIONS.map(a => (
              <CheckChip key={a} label={a} checked={(form.amenities || []).includes(a)} onChange={() => toggleArr("amenities", a)} />
            ))}
          </div>
        </ESection>

        {/* ── Section 12: Tags ── */}
        <ESection step={12} title="Event Tags" icon={<Music size={18} />}>
          <p className="text-xs text-gray-500">Select all relevant tags. These help with discovery and SEO.</p>
          <div className="flex flex-wrap gap-2">
            {TAGS.map(t => (
              <TagPill key={t} label={t} selected={(form.tags || []).includes(t)} onToggle={() => toggleArr("tags", t)} />
            ))}
          </div>
        </ESection>

        {/* ── Section 14: AI Tags ── */}
        <ESection step={14} title="Search & Discovery Tags" icon={<Star size={18} />}>
          <p className="text-xs text-gray-500">The AI recommendation engine uses these to surface your event to the right audience.</p>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Suitable For</p>
          <div className="flex flex-wrap gap-2">
            {SUITABLE_FOR.map(s => (
              <TagPill key={s} label={s} selected={(form.suitableFor || []).includes(s)} onToggle={() => toggleArr("suitableFor", s)} />
            ))}
          </div>
        </ESection>

        {/* ── Section 15: Policies ── */}
        <ESection step={15} title="Policies" icon={<AlertCircle size={18} />}>
          <div className="grid grid-cols-2 gap-2">
            {POLICY_OPTIONS.map(p => (
              <CheckChip
                key={p}
                label={p}
                checked={(form.policies || []).includes(p)}
                onChange={() => toggleArr("policies", p)}
              />
            ))}
          </div>
        </ESection>
          </div>
        )}

        {activeTab === 4 && (
          <div className="space-y-8 animate-fade-in">
        {/* ── Section 5: Ticket Configuration ── */}
        <ESection step={5} title="Ticket Configuration" icon={<Ticket size={18} />}>
          {/* Existing tickets */}
          {(form.ticketCategories || []).map((ticket, index) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              index={index}
              onUpdate={(field, value) => updateTicket(index, field, value)}
              onRemove={() => removeTicket(index)}
              formatRwf={formatRwf}
            />
          ))}

          {/* Add ticket buttons */}
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center">
            <p className="text-sm font-bold text-gray-500 mb-4">Click to add a ticket category</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {TICKET_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => addTicket(type)}
                  className="px-4 py-2 rounded-xl bg-white border-2 border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 text-sm font-bold text-gray-700 transition-all shadow-sm flex items-center gap-2"
                >
                  <span className="text-lg">{TICKET_ICONS[type] || "🎟"}</span>
                  {type}
                </button>
              ))}
            </div>
          </div>
        </ESection>

        {/* ── Section 6: Seating ── */}
        <ESection step={6} title="Seating Configuration (Optional)" icon={<Users size={18} />}>
          <CheckChip label="Event has assigned seats" checked={!!form.hasSeats} onChange={v => update("hasSeats", v)} />
          {form.hasSeats && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
              <SmallImageUpload label="Upload Seating Map" value={form.seatingMapUrl || ""} onChange={v => update("seatingMapUrl", v)} />
              <div className="grid grid-cols-3 gap-3">
                <EInput label="Seat Sections" value={form.seatSections || ""} onChange={(e: any) => update("seatSections", e.target.value)} placeholder="A, B, C..." />
                <EInput label="Rows" value={form.seatRows || ""} onChange={(e: any) => update("seatRows", e.target.value)} placeholder="1-50" />
                <EInput label="Seat Numbers" value={form.seatNumbers || ""} onChange={(e: any) => update("seatNumbers", e.target.value)} placeholder="1-200" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-amber-50 border-2 border-amber-200 rounded-xl">
                  <p className="text-xs font-bold text-amber-700">⭐ VIP Zone</p>
                  <p className="text-xs text-amber-600 mt-1">Configure VIP seating above via ticket builder</p>
                </div>
                <div className="p-3 bg-gray-100 border-2 border-gray-300 rounded-xl">
                  <p className="text-xs font-bold text-gray-700">🎟 General Zone</p>
                  <p className="text-xs text-gray-500 mt-1">Standard seating for all other tickets</p>
                </div>
              </div>
            </div>
          )}
        </ESection>

        {/* ── Section 7: Capacity ── */}
        <ESection step={7} title="Capacity" icon={<Users size={18} />}>
          <div className="grid grid-cols-3 gap-4">
            <EInput
              label="Maximum Attendance"
              type="number"
              value={form.maxAttendance || ""}
              onChange={(e: any) => update("maxAttendance", parseInt(e.target.value) || 0)}
              placeholder="e.g., 5000"
            />
            <div>
              <ELabel>Remaining Capacity</ELabel>
              <div className="mt-1 px-4 py-2.5 rounded-xl border-2 border-gray-100 bg-gray-50 font-black text-lg text-emerald-700">
                {remainingCapacity.toLocaleString()}
                <p className="text-xs text-gray-500 font-semibold">auto-calculated</p>
              </div>
            </div>
            <EInput
              label="Standing Capacity"
              type="number"
              value={form.standingCapacity || ""}
              onChange={(e: any) => update("standingCapacity", parseInt(e.target.value) || 0)}
              placeholder="e.g., 2000"
            />
          </div>
          <EInput
            label="Seated Capacity"
            type="number"
            value={form.seatedCapacity || ""}
            onChange={(e: any) => update("seatedCapacity", parseInt(e.target.value) || 0)}
            placeholder="e.g., 3000"
          />
        </ESection>

        {/* ── Section 8: Pricing Rules ── */}
        <ESection step={8} title="Pricing Rules" icon={<Star size={18} />}>
          <div className="grid grid-cols-2 gap-4">
            <ESelect
              label="Currency"
              options={["USD", "RWF", "EUR", "GBP", "KES", "TZS", "UGX"]}
              value={form.currency || "USD"}
              onChange={(e: any) => update("currency", e.target.value)}
            />
            <div className="flex items-end">
              <CheckChip label="Taxes Included in Price" checked={!!form.taxesIncluded} onChange={v => update("taxesIncluded", v)} />
            </div>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 font-semibold">
            🏦 Platform Commission: <span className="font-black text-gray-900">Auto-calculated at checkout</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <EInput label="Discount Code" value={form.discountCode || ""} onChange={(e: any) => update("discountCode", e.target.value)} placeholder="e.g., EARLY20" />
            <EInput label="Early Bird Discount (%)" type="number" value={form.earlyBirdDiscount || ""} onChange={(e: any) => update("earlyBirdDiscount", parseFloat(e.target.value) || 0)} placeholder="e.g., 20" />
            <EInput label="Student Discount (%)" type="number" value={form.studentDiscount || ""} onChange={(e: any) => update("studentDiscount", parseFloat(e.target.value) || 0)} placeholder="e.g., 15" />
            <EInput label="Bulk Discount (%)" type="number" value={form.bulkDiscount || ""} onChange={(e: any) => update("bulkDiscount", parseFloat(e.target.value) || 0)} placeholder="e.g., 10" />
          </div>
        </ESection>
          </div>
        )}

        {activeTab === 5 && (
          <div className="space-y-8 animate-fade-in">
        {/* ── Section 9: Contact Information ── */}
        <ESection step={9} title="Contact Information" icon={<Link2 size={18} />}>
          <div className="grid grid-cols-2 gap-4">
            <EInput label="Contact Person" value={form.contactPerson || ""} onChange={(e: any) => update("contactPerson", e.target.value)} placeholder="e.g., John Doe" />
            <EInput label="Phone" type="tel" value={form.contactPhone || ""} onChange={(e: any) => update("contactPhone", e.target.value)} placeholder="+250 780 000 000" />
            <EInput label="Email" type="email" value={form.contactEmail || ""} onChange={(e: any) => update("contactEmail", e.target.value)} placeholder="events@example.com" />
            <EInput label="Website" value={form.website || ""} onChange={(e: any) => update("website", e.target.value)} placeholder="https://yoursite.com" />
          </div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Social Media</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Facebook size={16} className="text-blue-600 flex-shrink-0" />
              <input type="text" value={form.facebook || ""} onChange={e => update("facebook", e.target.value)} placeholder="Facebook URL" className="flex-1 min-w-0 px-3 py-2 rounded-xl border-2 border-gray-200 text-sm font-semibold outline-none focus:border-emerald-500" />
            </div>
            <div className="flex items-center gap-2">
              <Instagram size={16} className="text-pink-500 flex-shrink-0" />
              <input type="text" value={form.instagram || ""} onChange={e => update("instagram", e.target.value)} placeholder="Instagram URL" className="flex-1 min-w-0 px-3 py-2 rounded-xl border-2 border-gray-200 text-sm font-semibold outline-none focus:border-emerald-500" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base flex-shrink-0">🎵</span>
              <input type="text" value={form.tiktok || ""} onChange={e => update("tiktok", e.target.value)} placeholder="TikTok URL" className="flex-1 min-w-0 px-3 py-2 rounded-xl border-2 border-gray-200 text-sm font-semibold outline-none focus:border-emerald-500" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base flex-shrink-0 font-black text-gray-800">𝕏</span>
              <input type="text" value={form.twitter || ""} onChange={e => update("twitter", e.target.value)} placeholder="X (Twitter) URL" className="flex-1 min-w-0 px-3 py-2 rounded-xl border-2 border-gray-200 text-sm font-semibold outline-none focus:border-emerald-500" />
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <Linkedin size={16} className="text-blue-700 flex-shrink-0" />
              <input type="text" value={form.linkedin || ""} onChange={e => update("linkedin", e.target.value)} placeholder="LinkedIn URL" className="flex-1 min-w-0 px-3 py-2 rounded-xl border-2 border-gray-200 text-sm font-semibold outline-none focus:border-emerald-500" />
            </div>
          </div>
        </ESection>

        {/* ── Section 10: Media ── */}
        <ESection step={10} title="Event Media" icon={<Youtube size={18} />}>
          <div className="grid grid-cols-2 gap-4">
            <SmallImageUpload label="Cover Photo" value={form.coverPhoto || ""} onChange={v => update("coverPhoto", v)} />
            <EInput label="YouTube Link" value={form.youtubeLink || ""} onChange={(e: any) => update("youtubeLink", e.target.value)} placeholder="https://youtube.com/..." />
          </div>
          <EInput label="Promo Video / Trailer Link" value={form.promoVideo || ""} onChange={(e: any) => update("promoVideo", e.target.value)} placeholder="https://..." />
        </ESection>

        {/* ── Section 11: Amenities ── */}
        <ESection step={11} title="Amenities" icon={<CheckCircle size={18} />}>
          <div className="grid grid-cols-3 gap-2">
            {AMENITY_LIST.map(a => (
              <CheckChip
                key={a}
                label={a}
                checked={(form.amenities || []).includes(a)}
                onChange={() => toggleArr("amenities", a)}
              />
            ))}
          </div>
        </ESection>

        {/* ── Section 13: SEO ── */}
        <ESection step={13} title="Search Optimization" icon={<Globe size={18} />}>
          <EInput label="Meta Title" value={form.metaTitle || ""} onChange={(e: any) => update("metaTitle", e.target.value)} placeholder="Kigali Jazz Festival 2025 — Best Event in Rwanda" />
          <ETextarea label="Meta Description" rows={3} value={form.metaDescription || ""} onChange={(e: any) => update("metaDescription", e.target.value)} placeholder="Join us for an unforgettable evening of jazz music at BK Arena..." />
          <EInput label="Keywords (comma separated)" value={form.keywords || ""} onChange={(e: any) => update("keywords", e.target.value)} placeholder="kigali event, jazz festival, rwanda concert" />
        </ESection>
          </div>
        )}

      </div>
    </div>
  );
}
