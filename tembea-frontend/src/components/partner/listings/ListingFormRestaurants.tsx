"use client";

import { useState, useRef } from "react";
import {
  Plus, Trash2, X, Upload, MapPin, Star, Calendar,
  Clock, Globe, Users, ChevronDown, ChevronUp,
  CheckCircle, Circle, AlertCircle, Utensils, Coffee, Heart, Image as ImageIcon, Video, FileText
} from "lucide-react";
import { uploadsApi } from "@/lib/api-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  photo: string;
  isAvailable: boolean;
  isVegetarian: boolean;
  isSpicy: boolean;
  isPopular: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface RestaurantFormData {
  // 1. Basic Info
  name: string;
  businessType: string;
  ownerName: string;
  tagline: string;
  // 2. Location
  country: string;
  province: string;
  district: string;
  sector: string;
  city: string;
  streetAddress: string;
  mapLocation: string;
  nearestLandmark: string;
  // 3. Contact Info
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  twitter: string;
  // 4. Operating Hours
  mondayHours: string;
  tuesdayHours: string;
  wednesdayHours: string;
  thursdayHours: string;
  fridayHours: string;
  saturdayHours: string;
  sundayHours: string;
  isOpen24Hours: boolean;
  isClosedOnSundays: boolean;
  isReservationsOnly: boolean;
  // 5. Details
  priceRange: string;
  averagePricePerPerson: number;
  maxCapacity: number;
  indoorSeats: number;
  outdoorSeats: number;
  privateRooms: number;
  vipRooms: number;
  // 6. Cuisine
  cuisine: string[];
  // 7. Menu Builder
  menuCategories: MenuCategory[];
  // 8. Dining Experience
  diningExperience: string[];
  // 9. Services
  services: string[];
  // 10. Amenities
  amenities: string[];
  // 11. Reservation Settings
  acceptReservations: boolean;
  reservationFee: number;
  minGuests: number;
  maxGuests: number;
  maxTables: number;
  advanceBooking: string;
  sameDayBooking: boolean;
  cancellationPolicy: string;
  // 12. Gallery
  coverPhoto: string;
  logo: string;
  foodImages: string[];
  interiorPhotos: string[];
  exteriorPhotos: string[];
  kitchenPhotos: string[];
  tour360: string;
  video: string;
  // 13. Description
  about: string;
  signatureDishes: string;
  chefStory: string;
  awards: string;
  history: string;
  whyVisit: string;
  // 14. Search and discovery
  suitableFor: string[];
  // 15. Search Tags
  searchTags: string[];
  // 16. SEO
  metaTitle: string;
  metaDescription: string;
  keywords: string;
}

interface RestaurantFormProps {
  data: Partial<RestaurantFormData>;
  onChange: (data: Partial<RestaurantFormData>) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BUSINESS_TYPES = [
  "Restaurant", "Cafe", "Coffee Shop", "Fast Food", "Bakery", "Bar & Grill",
  "Fine Dining", "Buffet", "Food Court", "Food Truck", "Lounge", "Pub"
];

const CUISINES = [
  "Rwandan", "African", "Italian", "Chinese", "Indian", "French", "Mexican",
  "Japanese", "Korean", "Seafood", "BBQ", "Vegan", "Vegetarian", "Fast Food",
  "Desserts", "Coffee", "Pizza", "Burgers"
];

const DINING_EXPERIENCES = [
  "Breakfast", "Lunch", "Dinner", "Brunch", "Buffet", "Romantic", "Family Friendly",
  "Business Meetings", "Private Dining", "Live Music", "Sports Viewing", "Rooftop",
  "Garden", "Lake View", "Mountain View"
];

const SERVICES = [
  "Dine In", "Takeaway", "Delivery", "Drive Through", "Reservation", "Private Events",
  "Birthday Parties", "Wedding Reception", "Corporate Meetings", "Catering", "Outdoor Dining"
];

const AMENITIES = [
  "Free WiFi", "Parking", "Outdoor Seating", "Indoor Seating", "Kids Area",
  "Wheelchair Accessible", "Air Conditioning", "Pet Friendly", "Smoking Area",
  "Private Parking", "Charging Station", "Security", "Bar", "Live Music",
  "TV Screens", "Power Backup", "Conference Room", "Prayer Room", "Restrooms"
];

const SUITABLE_FOR = [
  "Family", "Couples", "Business", "Tourists", "Kids", "Groups", "Solo Travelers",
  "Birthday", "Wedding", "Corporate"
];

const SEARCH_TAGS = [
  "Luxury", "Budget", "Romantic", "Coffee", "Local Food", "African", "Seafood",
  "BBQ", "Halal", "Vegetarian", "Vegan", "Late Night", "Breakfast"
];

const PRICE_RANGES = ["$", "$$", "$$$", "$$$$"];

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
      const results = await Promise.all(files.slice(0, max - (images?.length || 0)).map(f => uploadsApi.uploadImage(f)));
      onChange([...(images || []), ...results.map(r => r.url)]);
    } catch { /* silent */ } finally {
      setUploading(false);
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-5 gap-2">
        {(images || []).map((img, i) => (
          <div key={i} className="relative group aspect-square">
            <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
            <button
              type="button"
              onClick={() => onChange((images || []).filter((_, idx) => idx !== i))}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        {(images || []).length < max && (
          <div
            onClick={() => ref.current?.click()}
            className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-emerald-500 cursor-pointer flex items-center justify-center text-gray-400 hover:text-emerald-500 transition-all"
          >
            <Plus size={20} />
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400">{(images || []).length}/{max} images</p>
      <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
      {uploading && <p className="text-xs text-emerald-600 font-semibold animate-pulse">Uploading images...</p>}
    </div>
  );
}

// ─── Main Form Component ──────────────────────────────────────────────────────

export function RestaurantForm({ data, onChange }: RestaurantFormProps) {
  const [activeTab, setActiveTab] = useState(1);
  const form = data as Partial<RestaurantFormData>;

  const update = (field: keyof RestaurantFormData, value: any) => {
    onChange({ ...form, [field]: value });
  };

  const toggleArr = (field: keyof RestaurantFormData, value: string) => {
    const arr = (form[field] as string[]) || [];
    if (arr.includes(value)) {
      update(field, arr.filter(x => x !== value));
    } else {
      update(field, [...arr, value]);
    }
  };

  // Menu Builder Helpers
  const addMenuCategory = () => {
    const cats = form.menuCategories || [];
    update("menuCategories", [
      ...cats,
      { id: Date.now().toString(), name: "New Category", items: [] }
    ]);
  };

  const updateMenuCategory = (catId: string, name: string) => {
    const cats = form.menuCategories || [];
    update("menuCategories", cats.map(c => c.id === catId ? { ...c, name } : c));
  };

  const removeMenuCategory = (catId: string) => {
    const cats = form.menuCategories || [];
    update("menuCategories", cats.filter(c => c.id !== catId));
  };

  const addMenuItem = (catId: string) => {
    const cats = form.menuCategories || [];
    update("menuCategories", cats.map(c => {
      if (c.id === catId) {
        return {
          ...c,
          items: [
            ...c.items,
            {
              id: Date.now().toString(),
              name: "",
              price: 0,
              description: "",
              photo: "",
              isAvailable: true,
              isVegetarian: false,
              isSpicy: false,
              isPopular: false
            }
          ]
        };
      }
      return c;
    }));
  };

  const updateMenuItem = (catId: string, itemId: string, field: keyof MenuItem, value: any) => {
    const cats = form.menuCategories || [];
    update("menuCategories", cats.map(c => {
      if (c.id === catId) {
        return {
          ...c,
          items: c.items.map(item => item.id === itemId ? { ...item, [field]: value } : item)
        };
      }
      return c;
    }));
  };

  const removeMenuItem = (catId: string, itemId: string) => {
    const cats = form.menuCategories || [];
    update("menuCategories", cats.map(c => {
      if (c.id === catId) {
        return { ...c, items: c.items.filter(item => item.id !== itemId) };
      }
      return c;
    }));
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border-2 border-emerald-100 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto custom-scrollbar">
        {[
          { id: 1, label: "Profile", icon: Utensils },
          { id: 2, label: "Location & Contact", icon: MapPin },
          { id: 3, label: "Menu & Cuisine", icon: Coffee },
          { id: 4, label: "Dining & Services", icon: Star },
          { id: 5, label: "Schedule & Booking", icon: Calendar },
          { id: 6, label: "Media & SEO", icon: ImageIcon }
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
      {/* 1. Basic Info */}
      <ESection step={1} title="Basic Restaurant Information" icon={<Utensils size={18} />}>
        <EInput label="Restaurant Name" required value={form.name || ""} onChange={(e: any) => update("name", e.target.value)} />
        <ESelect label="Business Type" required options={BUSINESS_TYPES} value={form.businessType || ""} onChange={(e: any) => update("businessType", e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <EInput label="Owner / Business Name" value={form.ownerName || ""} onChange={(e: any) => update("ownerName", e.target.value)} />
          <EInput label="Short Tagline" value={form.tagline || ""} onChange={(e: any) => update("tagline", e.target.value)} placeholder="e.g. The best pizza in town" />
        </div>
      </ESection>

      {/* 13. Description */}
      <ESection step={13} title="Description" icon={<FileText size={18} />}>
        <ETextarea label="About Restaurant" rows={6} value={form.about || ""} onChange={(e: any) => update("about", e.target.value)} />
        <ETextarea label="Signature Dishes" rows={3} value={form.signatureDishes || ""} onChange={(e: any) => update("signatureDishes", e.target.value)} />
        <ETextarea label="Chef's Story" rows={3} value={form.chefStory || ""} onChange={(e: any) => update("chefStory", e.target.value)} />
        <ETextarea label="History & Awards" rows={3} value={form.history || ""} onChange={(e: any) => update("history", e.target.value)} />
        <ETextarea label="Why Visit?" rows={2} value={form.whyVisit || ""} onChange={(e: any) => update("whyVisit", e.target.value)} />
      </ESection>
          </div>
        )}

        {activeTab === 2 && (
          <div className="space-y-8 animate-fade-in">
      {/* 2. Location */}
      <ESection step={2} title="Location" icon={<MapPin size={18} />}>
        <div className="grid grid-cols-2 gap-4">
          <EInput label="Country" value={form.country || "Rwanda"} onChange={(e: any) => update("country", e.target.value)} />
          <EInput label="Province" value={form.province || ""} onChange={(e: any) => update("province", e.target.value)} />
          <EInput label="District" value={form.district || ""} onChange={(e: any) => update("district", e.target.value)} />
          <EInput label="Sector" value={form.sector || ""} onChange={(e: any) => update("sector", e.target.value)} />
        </div>
        <EInput label="City" required value={form.city || ""} onChange={(e: any) => update("city", e.target.value)} />
        <EInput label="Street Address" required value={form.streetAddress || ""} onChange={(e: any) => update("streetAddress", e.target.value)} />
        <EInput label="Google Maps Location (Link)" value={form.mapLocation || ""} onChange={(e: any) => update("mapLocation", e.target.value)} />
        <EInput label="Nearest Landmark" value={form.nearestLandmark || ""} onChange={(e: any) => update("nearestLandmark", e.target.value)} />
      </ESection>

      {/* 3. Contact Info */}
      <ESection step={3} title="Contact Information" icon={<Globe size={18} />}>
        <div className="grid grid-cols-2 gap-4">
          <EInput label="Phone Number" type="tel" value={form.phone || ""} onChange={(e: any) => update("phone", e.target.value)} />
          <EInput label="WhatsApp Number" type="tel" value={form.whatsapp || ""} onChange={(e: any) => update("whatsapp", e.target.value)} />
          <EInput label="Email" type="email" value={form.email || ""} onChange={(e: any) => update("email", e.target.value)} />
          <EInput label="Website" type="url" value={form.website || ""} onChange={(e: any) => update("website", e.target.value)} />
        </div>
        <p className="text-xs font-bold text-gray-500 uppercase mt-4 mb-2">Social Media</p>
        <div className="grid grid-cols-2 gap-4">
          <EInput label="Facebook" value={form.facebook || ""} onChange={(e: any) => update("facebook", e.target.value)} />
          <EInput label="Instagram" value={form.instagram || ""} onChange={(e: any) => update("instagram", e.target.value)} />
          <EInput label="TikTok" value={form.tiktok || ""} onChange={(e: any) => update("tiktok", e.target.value)} />
          <EInput label="X (Twitter)" value={form.twitter || ""} onChange={(e: any) => update("twitter", e.target.value)} />
        </div>
      </ESection>
          </div>
        )}

        {activeTab === 5 && (
          <div className="space-y-8 animate-fade-in">
      {/* 4. Operating Hours */}
      <ESection step={4} title="Operating Hours" icon={<Clock size={18} />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <EInput label="Monday" value={form.mondayHours || ""} onChange={(e: any) => update("mondayHours", e.target.value)} placeholder="08:00 - 22:00" />
          <EInput label="Tuesday" value={form.tuesdayHours || ""} onChange={(e: any) => update("tuesdayHours", e.target.value)} />
          <EInput label="Wednesday" value={form.wednesdayHours || ""} onChange={(e: any) => update("wednesdayHours", e.target.value)} />
          <EInput label="Thursday" value={form.thursdayHours || ""} onChange={(e: any) => update("thursdayHours", e.target.value)} />
          <EInput label="Friday" value={form.fridayHours || ""} onChange={(e: any) => update("fridayHours", e.target.value)} />
          <EInput label="Saturday" value={form.saturdayHours || ""} onChange={(e: any) => update("saturdayHours", e.target.value)} />
          <EInput label="Sunday" value={form.sundayHours || ""} onChange={(e: any) => update("sundayHours", e.target.value)} />
        </div>
        <div className="flex gap-4 mt-4">
          <CheckChip label="Open 24 Hours" checked={!!form.isOpen24Hours} onChange={v => update("isOpen24Hours", v)} />
          <CheckChip label="Closed on Sundays" checked={!!form.isClosedOnSundays} onChange={v => update("isClosedOnSundays", v)} />
          <CheckChip label="Reservations Only" checked={!!form.isReservationsOnly} onChange={v => update("isReservationsOnly", v)} />
        </div>
      </ESection>

      {/* 11. Reservation Settings */}
      <ESection step={11} title="Reservation Settings" icon={<Calendar size={18} />}>
        <div className="mb-4">
          <CheckChip label="Accept Reservations" checked={!!form.acceptReservations} onChange={v => update("acceptReservations", v)} />
        </div>
        
        {form.acceptReservations && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <EInput label="Reservation Fee ($)" type="number" value={form.reservationFee || ""} onChange={(e: any) => update("reservationFee", parseFloat(e.target.value))} />
            <div className="grid grid-cols-2 gap-2">
              <EInput label="Min Guests" type="number" value={form.minGuests || ""} onChange={(e: any) => update("minGuests", parseInt(e.target.value))} />
              <EInput label="Max Guests" type="number" value={form.maxGuests || ""} onChange={(e: any) => update("maxGuests", parseInt(e.target.value))} />
            </div>
            <EInput label="Max Tables" type="number" value={form.maxTables || ""} onChange={(e: any) => update("maxTables", parseInt(e.target.value))} />
            <ESelect label="Advance Booking" options={["Up to 1 week", "Up to 1 month", "Up to 3 months", "Up to 6 months", "Up to 1 year"]} value={form.advanceBooking || ""} onChange={(e: any) => update("advanceBooking", e.target.value)} />
            <ESelect label="Cancellation Policy" options={["Flexible", "Moderate", "Strict", "Non-refundable"]} value={form.cancellationPolicy || ""} onChange={(e: any) => update("cancellationPolicy", e.target.value)} />
            <div className="flex items-end mb-2">
              <CheckChip label="Allow Same Day Booking" checked={!!form.sameDayBooking} onChange={v => update("sameDayBooking", v)} />
            </div>
          </div>
        )}
      </ESection>
          </div>
        )}

        {activeTab === 4 && (
          <div className="space-y-8 animate-fade-in">
      {/* 5. Details */}
      <ESection step={5} title="Restaurant Details" icon={<AlertCircle size={18} />}>
        <div className="grid grid-cols-2 gap-4">
          <ESelect label="Price Range" options={PRICE_RANGES} value={form.priceRange || ""} onChange={(e: any) => update("priceRange", e.target.value)} />
          <EInput label="Average Price Per Person ($)" type="number" value={form.averagePricePerPerson || ""} onChange={(e: any) => update("averagePricePerPerson", parseFloat(e.target.value))} />
          <EInput label="Maximum Capacity" type="number" value={form.maxCapacity || ""} onChange={(e: any) => update("maxCapacity", parseInt(e.target.value))} />
          <EInput label="Indoor Seats" type="number" value={form.indoorSeats || ""} onChange={(e: any) => update("indoorSeats", parseInt(e.target.value))} />
          <EInput label="Outdoor Seats" type="number" value={form.outdoorSeats || ""} onChange={(e: any) => update("outdoorSeats", parseInt(e.target.value))} />
          <div className="grid grid-cols-2 gap-2">
            <EInput label="Private Rooms" type="number" value={form.privateRooms || ""} onChange={(e: any) => update("privateRooms", parseInt(e.target.value))} />
            <EInput label="VIP Rooms" type="number" value={form.vipRooms || ""} onChange={(e: any) => update("vipRooms", parseInt(e.target.value))} />
          </div>
        </div>
      </ESection>

      {/* 8. Dining Experience */}
      <ESection step={8} title="Dining Experience" icon={<Star size={18} />}>
        <div className="flex flex-wrap gap-2">
          {DINING_EXPERIENCES.map(e => (
            <CheckChip key={e} label={e} checked={(form.diningExperience || []).includes(e)} onChange={() => toggleArr("diningExperience", e)} />
          ))}
        </div>
      </ESection>

      {/* 9. Services */}
      <ESection step={9} title="Services" icon={<CheckCircle size={18} />}>
        <div className="flex flex-wrap gap-2">
          {SERVICES.map(s => (
            <CheckChip key={s} label={s} checked={(form.services || []).includes(s)} onChange={() => toggleArr("services", s)} />
          ))}
        </div>
      </ESection>

      {/* 10. Amenities */}
      <ESection step={10} title="Amenities" icon={<Heart size={18} />}>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map(a => (
            <CheckChip key={a} label={a} checked={(form.amenities || []).includes(a)} onChange={() => toggleArr("amenities", a)} />
          ))}
        </div>
      </ESection>
          </div>
        )}

        {activeTab === 3 && (
          <div className="space-y-8 animate-fade-in">
      {/* 6. Cuisine */}
      <ESection step={6} title="Cuisine" icon={<Utensils size={18} />}>
        <p className="text-xs text-gray-500 mb-2">Select all that apply.</p>
        <div className="flex flex-wrap gap-2">
          {CUISINES.map(c => (
            <CheckChip key={c} label={c} checked={(form.cuisine || []).includes(c)} onChange={() => toggleArr("cuisine", c)} />
          ))}
        </div>
      </ESection>

      {/* 7. Menu Builder */}
      <ESection step={7} title="Menu Builder" icon={<Coffee size={18} />}>
        <p className="text-xs text-gray-500 mb-4">Create categories (e.g. Starters, Main Course) and add items to them.</p>
        
        <div className="space-y-6">
          {(form.menuCategories || []).map((cat, i) => (
            <div key={cat.id} className="border-2 border-emerald-100 rounded-xl overflow-hidden bg-white shadow-sm">
              <div className="bg-emerald-50 px-4 py-3 flex items-center justify-between border-b-2 border-emerald-100">
                <input
                  type="text"
                  value={cat.name}
                  onChange={e => updateMenuCategory(cat.id, e.target.value)}
                  className="bg-transparent font-black text-emerald-900 outline-none text-lg w-full"
                  placeholder="Category Name (e.g. Starters)"
                />
                <button onClick={() => removeMenuCategory(cat.id)} className="text-red-500 p-1 hover:bg-red-50 rounded-md">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {cat.items.map(item => (
                  <div key={item.id} className="grid grid-cols-[80px_1fr] gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div>
                      <SmallImageUpload label="" value={item.photo || ""} onChange={v => updateMenuItem(cat.id, item.id, "photo", v)} />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={e => updateMenuItem(cat.id, item.id, "name", e.target.value)}
                          placeholder="Dish Name"
                          className="font-bold text-gray-900 bg-white px-3 py-1.5 rounded-lg border border-gray-200 outline-none w-full"
                        />
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-gray-500">$</span>
                          <input
                            type="number"
                            value={item.price || ""}
                            onChange={e => updateMenuItem(cat.id, item.id, "price", parseFloat(e.target.value))}
                            placeholder="Price"
                            className="font-bold text-gray-900 bg-white px-2 py-1.5 rounded-lg border border-gray-200 outline-none w-20 text-right"
                          />
                        </div>
                      </div>
                      <input
                        type="text"
                        value={item.description}
                        onChange={e => updateMenuItem(cat.id, item.id, "description", e.target.value)}
                        placeholder="Short description of the dish..."
                        className="text-sm text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-200 outline-none w-full"
                      />
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-2">
                          <label className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md cursor-pointer ${item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-500'}`}>
                            <input type="checkbox" checked={item.isAvailable} onChange={e => updateMenuItem(cat.id, item.id, "isAvailable", e.target.checked)} className="hidden" />
                            {item.isAvailable ? 'Available' : 'Sold Out'}
                          </label>
                          <label className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md cursor-pointer ${item.isVegetarian ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-400'}`}>
                            <input type="checkbox" checked={item.isVegetarian} onChange={e => updateMenuItem(cat.id, item.id, "isVegetarian", e.target.checked)} className="hidden" />
                            🥬 Veg
                          </label>
                          <label className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md cursor-pointer ${item.isSpicy ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-400'}`}>
                            <input type="checkbox" checked={item.isSpicy} onChange={e => updateMenuItem(cat.id, item.id, "isSpicy", e.target.checked)} className="hidden" />
                            🌶️ Spicy
                          </label>
                          <label className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md cursor-pointer ${item.isPopular ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-400'}`}>
                            <input type="checkbox" checked={item.isPopular} onChange={e => updateMenuItem(cat.id, item.id, "isPopular", e.target.checked)} className="hidden" />
                            ⭐ Popular
                          </label>
                        </div>
                        <button onClick={() => removeMenuItem(cat.id, item.id)} className="text-red-500 text-xs font-bold hover:underline">Remove</button>
                      </div>
                    </div>
                  </div>
                ))}

                <button onClick={() => addMenuItem(cat.id)} className="w-full py-2 border-2 border-dashed border-emerald-200 text-emerald-600 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors flex items-center justify-center gap-1">
                  <Plus size={16} /> Add Dish
                </button>
              </div>
            </div>
          ))}

          <button onClick={addMenuCategory} className="w-full py-4 border-2 border-dashed border-gray-300 text-gray-500 rounded-xl font-bold hover:border-emerald-500 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2">
            <Plus size={18} /> Add Menu Category
          </button>
        </div>
      </ESection>
          </div>
        )}

        {activeTab === 6 && (
          <div className="space-y-8 animate-fade-in">
      {/* 12. Gallery */}
      <ESection step={12} title="Gallery" icon={<ImageIcon size={18} />}>
        <div className="grid grid-cols-2 gap-4">
          <SmallImageUpload label="Restaurant Cover" value={form.coverPhoto || ""} onChange={v => update("coverPhoto", v)} />
          <SmallImageUpload label="Restaurant Logo" value={form.logo || ""} onChange={v => update("logo", v)} />
        </div>
        
        <div className="space-y-4 pt-4 border-t border-gray-100 mt-4">
          <div>
            <ELabel>Food Images (up to 10)</ELabel>
            <GalleryUpload images={form.foodImages || []} onChange={v => update("foodImages", v)} max={10} />
          </div>
          <div>
            <ELabel>Interior Photos (up to 5)</ELabel>
            <GalleryUpload images={form.interiorPhotos || []} onChange={v => update("interiorPhotos", v)} max={5} />
          </div>
          <div>
            <ELabel>Exterior Photos (up to 5)</ELabel>
            <GalleryUpload images={form.exteriorPhotos || []} onChange={v => update("exteriorPhotos", v)} max={5} />
          </div>
          <div>
            <ELabel>Kitchen/Staff Photos (up to 3)</ELabel>
            <GalleryUpload images={form.kitchenPhotos || []} onChange={v => update("kitchenPhotos", v)} max={3} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 mt-4">
          <EInput label="360° Tour Link" value={form.tour360 || ""} onChange={(e: any) => update("tour360", e.target.value)} placeholder="https://..." />
          <EInput label="Promo Video Link" value={form.video || ""} onChange={(e: any) => update("video", e.target.value)} placeholder="https://youtube.com/..." />
        </div>
      </ESection>

      {/* 14. Search and discovery */}
      <ESection step={14} title="Search & Discovery" icon={<Star size={18} />}>
        <p className="text-xs text-gray-500 mb-2">Suitable For</p>
        <div className="flex flex-wrap gap-2">
          {SUITABLE_FOR.map(s => (
            <TagPill key={s} label={s} selected={(form.suitableFor || []).includes(s)} onToggle={() => toggleArr("suitableFor", s)} />
          ))}
        </div>
      </ESection>

      {/* 15. Search Tags */}
      <ESection step={15} title="Search Tags" icon={<Globe size={18} />}>
        <div className="flex flex-wrap gap-2">
          {SEARCH_TAGS.map(t => (
            <TagPill key={t} label={t} selected={(form.searchTags || []).includes(t)} onToggle={() => toggleArr("searchTags", t)} />
          ))}
        </div>
      </ESection>

      {/* 16. SEO */}
      <ESection step={16} title="SEO Settings" icon={<Globe size={18} />}>
        <EInput label="Meta Title" value={form.metaTitle || ""} onChange={(e: any) => update("metaTitle", e.target.value)} />
        <ETextarea label="Meta Description" rows={2} value={form.metaDescription || ""} onChange={(e: any) => update("metaDescription", e.target.value)} />
        <EInput label="Keywords" value={form.keywords || ""} onChange={(e: any) => update("keywords", e.target.value)} placeholder="comma separated..." />
      </ESection>
          </div>
        )}

      </div>
    </div>
  );
}
