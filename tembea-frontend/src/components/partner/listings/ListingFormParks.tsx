"use client";

import { useState, useRef } from "react";
import {
  Plus, Trash2, X, Upload, MapPin, Star, Calendar,
  Clock, Globe, Users, ChevronDown, ChevronUp,
  CheckCircle, Circle, AlertCircle, Mountain, Leaf, Activity,
  Camera, Heart, Image as ImageIcon, Video, FileText, Sun
} from "lucide-react";
import { uploadsApi } from "@/lib/api-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ParkActivity {
  id: string;
  name: string;
  price: number;
  duration: string;
  availableTimes: string;
  minAge: number;
  maxGuests: number;
  description: string;
}

export interface ParkFormData {
  // 1. Basic Info
  name: string;
  parkCategory: string;
  managedBy: string;
  establishedYear: string;
  officialWebsite: string;
  // 2. Location
  country: string;
  province: string;
  district: string;
  sector: string;
  nearestTown: string;
  mapLocation: string;
  gpsCoordinates: string;
  // 3. Entry Information
  currency: string;
  adultFee: number;
  childFee: number;
  eastAfricanFee: number;
  internationalFee: number;
  vehicleFee: number;
  campingFee: number;
  guideFee: number;
  // 4. Opening Hours
  mondayOpen: string; mondayClose: string;
  tuesdayOpen: string; tuesdayClose: string;
  wednesdayOpen: string; wednesdayClose: string;
  thursdayOpen: string; thursdayClose: string;
  fridayOpen: string; fridayClose: string;
  saturdayOpen: string; saturdayClose: string;
  sundayOpen: string; sundayClose: string;
  openDaily: boolean;
  seasonal: boolean;
  publicHolidays: boolean;
  // 5. Visitor Capacity
  maxVisitorsPerDay: number;
  morningSlots: number;
  afternoonSlots: number;
  eveningSlots: number;
  maxGroupSize: number;
  maxVehicles: number;
  // 6. Reservation Settings
  advanceBookingRequired: boolean;
  bookingWindow: string;
  cancellationPolicy: string;
  minVisitors: number;
  maxVisitors: number;
  // 7. Description
  about: string;
  history: string;
  conservationStory: string;
  wildlifeDescription: string;
  landscape: string;
  climate: string;
  visitorExperience: string;
  // 8. Wildlife
  wildlife: string[];
  // 9. Activities
  activities: ParkActivity[];
  // 10. Facilities
  facilities: string[];
  // 11. Safety
  emergencyContact: string;
  medicalCenterInfo: string;
  rangerAvailable: boolean;
  emergencyProcedures: string;
  // 12. Best Time to Visit
  bestMonths: string[];
  drySeasonDescription: string;
  rainySeasonDescription: string;
  // 13. What to Bring
  whatToBring: string[];
  // 14. Gallery
  coverImage: string;
  wildlifePhotos: string[];
  landscapePhotos: string[];
  lodgesPhotos: string[];
  videos: string[];
  tour360: string;
  // 15. Nearby Attractions
  hotelsNearby: string;
  restaurantsNearby: string;
  museumsNearby: string;
  lakesNearby: string;
  memorialSitesNearby: string;
  transportNearby: string;
  // 16. SEO
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  // 17. Search and discovery
  suitableFor: string[];
}

interface ParkFormProps {
  data: Partial<ParkFormData>;
  onChange: (data: Partial<ParkFormData>) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PARK_CATEGORIES = [
  "National Park", "Nature Reserve", "Forest", "Wetland",
  "Wildlife Sanctuary", "Game Reserve", "Conservation Area"
];

const WILDLIFE_LIST = [
  "Lion", "Elephant", "Rhino", "Buffalo", "Leopard", "Giraffe",
  "Zebra", "Hippo", "Crocodile", "Bird Species", "Primates", "Antelopes"
];

const FACILITIES_LIST = [
  "Visitor Center", "Restaurant", "Gift Shop", "Parking", "Washrooms",
  "Camping", "Lodge", "Picnic Area", "Observation Tower", "First Aid",
  "Medical Center", "ATM", "WiFi", "Charging Station", "Wheelchair Access", "Prayer Room"
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WHAT_TO_BRING_LIST = [
  "Camera", "Hat", "Sunscreen", "Hiking Boots", "Rain Jacket", "Binoculars", "Water Bottle"
];

const SUITABLE_FOR = [
  "Families", "Children", "Photographers", "Adventure", "Couples",
  "Luxury Travelers", "Groups", "Schools"
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

export function ParkForm({ data, onChange }: ParkFormProps) {
  const [activeTab, setActiveTab] = useState(1);
  const form = data as Partial<ParkFormData>;

  const update = (field: keyof ParkFormData, value: any) => {
    onChange({ ...form, [field]: value });
  };

  const toggleArr = (field: keyof ParkFormData, value: string) => {
    const arr = (form[field] as string[]) || [];
    if (arr.includes(value)) {
      update(field, arr.filter(x => x !== value));
    } else {
      update(field, [...arr, value]);
    }
  };

  // Activity Builder Helpers
  const addActivity = () => {
    const acts = form.activities || [];
    update("activities", [
      ...acts,
      {
        id: Date.now().toString(),
        name: "",
        price: 0,
        duration: "",
        availableTimes: "",
        minAge: 0,
        maxGuests: 0,
        description: ""
      }
    ]);
  };

  const updateActivity = (actId: string, field: keyof ParkActivity, value: any) => {
    const acts = form.activities || [];
    update("activities", acts.map(a => a.id === actId ? { ...a, [field]: value } : a));
  };

  const removeActivity = (actId: string) => {
    const acts = form.activities || [];
    update("activities", acts.filter(a => a.id !== actId));
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border-2 border-emerald-100 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto custom-scrollbar">
        {[
          { id: 1, label: "Park Info", icon: Mountain },
          { id: 2, label: "Location", icon: MapPin },
          { id: 3, label: "Wildlife & Nature", icon: Leaf },
          { id: 4, label: "Activities & Facilities", icon: Activity },
          { id: 5, label: "Logistics & Booking", icon: Calendar },
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
      <ESection step={1} title="Basic Information" icon={<Mountain size={18} />}>
        <EInput label="Park Name" required value={form.name || ""} onChange={(e: any) => update("name", e.target.value)} />
        <ESelect label="Park Category" required options={PARK_CATEGORIES} value={form.parkCategory || ""} onChange={(e: any) => update("parkCategory", e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <EInput label="Managed By (e.g. RDB, Private, NGO)" value={form.managedBy || ""} onChange={(e: any) => update("managedBy", e.target.value)} />
          <EInput label="Established Year" value={form.establishedYear || ""} onChange={(e: any) => update("establishedYear", e.target.value)} />
        </div>
        <EInput label="Official Website" value={form.officialWebsite || ""} onChange={(e: any) => update("officialWebsite", e.target.value)} />
      </ESection>

      {/* 7. Description */}
      <ESection step={7} title="Description" icon={<FileText size={18} />}>
        <ETextarea label="About the Park" rows={4} value={form.about || ""} onChange={(e: any) => update("about", e.target.value)} />
        <ETextarea label="History" rows={3} value={form.history || ""} onChange={(e: any) => update("history", e.target.value)} />
        <ETextarea label="Conservation Story" rows={3} value={form.conservationStory || ""} onChange={(e: any) => update("conservationStory", e.target.value)} />
        <ETextarea label="Wildlife Overview" rows={3} value={form.wildlifeDescription || ""} onChange={(e: any) => update("wildlifeDescription", e.target.value)} />
        <ETextarea label="Landscape" rows={2} value={form.landscape || ""} onChange={(e: any) => update("landscape", e.target.value)} />
        <ETextarea label="Climate" rows={2} value={form.climate || ""} onChange={(e: any) => update("climate", e.target.value)} />
        <ETextarea label="Visitor Experience" rows={2} value={form.visitorExperience || ""} onChange={(e: any) => update("visitorExperience", e.target.value)} />
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
        <EInput label="Nearest Town" value={form.nearestTown || ""} onChange={(e: any) => update("nearestTown", e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <EInput label="Google Map Location (Link)" value={form.mapLocation || ""} onChange={(e: any) => update("mapLocation", e.target.value)} />
          <EInput label="GPS Coordinates" value={form.gpsCoordinates || ""} onChange={(e: any) => update("gpsCoordinates", e.target.value)} placeholder="e.g. -1.9403, 29.8739" />
        </div>
      </ESection>

      {/* 15. Nearby Attractions */}
      <ESection step={15} title="Nearby Attractions" icon={<MapPin size={18} />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <EInput label="Hotels & Lodges" value={form.hotelsNearby || ""} onChange={(e: any) => update("hotelsNearby", e.target.value)} />
          <EInput label="Restaurants" value={form.restaurantsNearby || ""} onChange={(e: any) => update("restaurantsNearby", e.target.value)} />
          <EInput label="Museums" value={form.museumsNearby || ""} onChange={(e: any) => update("museumsNearby", e.target.value)} />
          <EInput label="Lakes" value={form.lakesNearby || ""} onChange={(e: any) => update("lakesNearby", e.target.value)} />
          <EInput label="Memorial Sites" value={form.memorialSitesNearby || ""} onChange={(e: any) => update("memorialSitesNearby", e.target.value)} />
          <EInput label="Transport Options" value={form.transportNearby || ""} onChange={(e: any) => update("transportNearby", e.target.value)} />
        </div>
      </ESection>
          </div>
        )}

        {activeTab === 5 && (
          <div className="space-y-8 animate-fade-in">
      {/* 3. Entry Information */}
      <ESection step={3} title="Entry Information" icon={<Users size={18} />}>
        <div className="mb-4">
          <ESelect label="Currency" options={["USD", "RWF", "EUR"]} value={form.currency || "USD"} onChange={(e: any) => update("currency", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <EInput label="Adult Entry Fee" type="number" value={form.adultFee || ""} onChange={(e: any) => update("adultFee", parseFloat(e.target.value))} />
          <EInput label="Child Entry Fee" type="number" value={form.childFee || ""} onChange={(e: any) => update("childFee", parseFloat(e.target.value))} />
          <EInput label="East African Citizen Fee" type="number" value={form.eastAfricanFee || ""} onChange={(e: any) => update("eastAfricanFee", parseFloat(e.target.value))} />
          <EInput label="International Visitor Fee" type="number" value={form.internationalFee || ""} onChange={(e: any) => update("internationalFee", parseFloat(e.target.value))} />
          <EInput label="Vehicle Fee" type="number" value={form.vehicleFee || ""} onChange={(e: any) => update("vehicleFee", parseFloat(e.target.value))} />
          <EInput label="Camping Fee" type="number" value={form.campingFee || ""} onChange={(e: any) => update("campingFee", parseFloat(e.target.value))} />
          <EInput label="Guide Fee (Optional)" type="number" value={form.guideFee || ""} onChange={(e: any) => update("guideFee", parseFloat(e.target.value))} />
        </div>
      </ESection>

      {/* 4. Opening Hours */}
      <ESection step={4} title="Opening Hours" icon={<Clock size={18} />}>
        <div className="flex gap-4 mb-4">
          <CheckChip label="Open Daily" checked={!!form.openDaily} onChange={v => update("openDaily", v)} />
          <CheckChip label="Seasonal" checked={!!form.seasonal} onChange={v => update("seasonal", v)} />
          <CheckChip label="Public Holidays" checked={!!form.publicHolidays} onChange={v => update("publicHolidays", v)} />
        </div>
        
        <div className="grid grid-cols-[100px_1fr_1fr] items-center gap-4 text-sm font-bold text-gray-700 mb-2">
          <div>Day</div>
          <div>Opening Time</div>
          <div>Closing Time</div>
        </div>
        
        {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map(day => (
          <div key={day} className="grid grid-cols-[100px_1fr_1fr] items-center gap-4 mb-2">
            <div className="text-sm font-bold text-gray-600 capitalize">{day}</div>
            <input
              type="time"
              value={(form as any)[`${day}Open`] || ""}
              onChange={e => update(`${day}Open` as keyof ParkFormData, e.target.value)}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 outline-none focus:border-emerald-500"
            />
            <input
              type="time"
              value={(form as any)[`${day}Close`] || ""}
              onChange={e => update(`${day}Close` as keyof ParkFormData, e.target.value)}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 outline-none focus:border-emerald-500"
            />
          </div>
        ))}
      </ESection>

      {/* 5. Visitor Capacity */}
      <ESection step={5} title="Visitor Capacity" icon={<Users size={18} />}>
        <div className="grid grid-cols-2 gap-4">
          <EInput label="Max Visitors Per Day" type="number" value={form.maxVisitorsPerDay || ""} onChange={(e: any) => update("maxVisitorsPerDay", parseInt(e.target.value))} />
          <EInput label="Max Group Size" type="number" value={form.maxGroupSize || ""} onChange={(e: any) => update("maxGroupSize", parseInt(e.target.value))} />
          <EInput label="Morning Slots" type="number" value={form.morningSlots || ""} onChange={(e: any) => update("morningSlots", parseInt(e.target.value))} />
          <EInput label="Afternoon Slots" type="number" value={form.afternoonSlots || ""} onChange={(e: any) => update("afternoonSlots", parseInt(e.target.value))} />
          <EInput label="Evening Slots" type="number" value={form.eveningSlots || ""} onChange={(e: any) => update("eveningSlots", parseInt(e.target.value))} />
          <EInput label="Max Vehicles" type="number" value={form.maxVehicles || ""} onChange={(e: any) => update("maxVehicles", parseInt(e.target.value))} />
        </div>
      </ESection>

      {/* 6. Reservation Settings */}
      <ESection step={6} title="Reservation Settings" icon={<Calendar size={18} />}>
        <div className="mb-4">
          <CheckChip label="Advance Booking Required" checked={!!form.advanceBookingRequired} onChange={v => update("advanceBookingRequired", v)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <ESelect label="Booking Window" options={["Up to 24 hours", "Up to 1 week", "Up to 1 month", "Up to 6 months", "Up to 1 year"]} value={form.bookingWindow || ""} onChange={(e: any) => update("bookingWindow", e.target.value)} />
          <ESelect label="Cancellation Policy" options={["Flexible", "Moderate", "Strict", "Non-refundable"]} value={form.cancellationPolicy || ""} onChange={(e: any) => update("cancellationPolicy", e.target.value)} />
          <EInput label="Minimum Visitors" type="number" value={form.minVisitors || ""} onChange={(e: any) => update("minVisitors", parseInt(e.target.value))} />
          <EInput label="Maximum Visitors" type="number" value={form.maxVisitors || ""} onChange={(e: any) => update("maxVisitors", parseInt(e.target.value))} />
        </div>
      </ESection>

      {/* 11. Safety */}
      <ESection step={11} title="Safety" icon={<AlertCircle size={18} />}>
        <div className="grid grid-cols-2 gap-4">
          <EInput label="Emergency Contact Number" value={form.emergencyContact || ""} onChange={(e: any) => update("emergencyContact", e.target.value)} />
          <EInput label="Nearest Medical Center" value={form.medicalCenterInfo || ""} onChange={(e: any) => update("medicalCenterInfo", e.target.value)} />
        </div>
        <div className="my-4">
          <CheckChip label="Rangers / Guides Available on site" checked={!!form.rangerAvailable} onChange={v => update("rangerAvailable", v)} />
        </div>
        <ETextarea label="Emergency Procedures" rows={3} value={form.emergencyProcedures || ""} onChange={(e: any) => update("emergencyProcedures", e.target.value)} />
      </ESection>
          </div>
        )}

        {activeTab === 3 && (
          <div className="space-y-8 animate-fade-in">
      {/* 8. Wildlife */}

      <ESection step={8} title="Wildlife" icon={<Leaf size={18} />}>
        <p className="text-xs text-gray-500 mb-2">Select all wildlife present in the park.</p>
        <div className="flex flex-wrap gap-2">
          {WILDLIFE_LIST.map(w => (
            <CheckChip key={w} label={w} checked={(form.wildlife || []).includes(w)} onChange={() => toggleArr("wildlife", w)} />
          ))}
        </div>
      </ESection>
          </div>
        )}

        {activeTab === 5 && (
          <div className="space-y-8 animate-fade-in">
            {/* 12. Best Time to Visit */}
            <ESection step={12} title="Best Time to Visit" icon={<Sun size={18} />}>
              <p className="text-xs text-gray-500 mb-2">Select the best months to visit</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {MONTHS.map(m => (
                  <TagPill key={m} label={m} selected={(form.bestMonths || []).includes(m)} onToggle={() => toggleArr("bestMonths", m)} />
                ))}
              </div>
              <ETextarea label="Dry Season Details" rows={2} value={form.drySeasonDescription || ""} onChange={(e: any) => update("drySeasonDescription", e.target.value)} />
              <ETextarea label="Rainy Season Details" rows={2} value={form.rainySeasonDescription || ""} onChange={(e: any) => update("rainySeasonDescription", e.target.value)} />
            </ESection>
          </div>
        )}

        {activeTab === 4 && (
          <div className="space-y-8 animate-fade-in">
      {/* 9. Activities */}
      <ESection step={9} title="Activities" icon={<Activity size={18} />}>
        <p className="text-xs text-gray-500 mb-4">Add dynamic activities like Safari, Boat Tour, Hiking, etc.</p>
        
        <div className="space-y-4">
          {(form.activities || []).map((act, i) => (
            <div key={act.id} className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3 relative">
              <button onClick={() => removeActivity(act.id)} className="absolute top-4 right-4 text-red-500 p-1 hover:bg-red-50 rounded-md">
                <Trash2 size={16} />
              </button>
              
              <div className="grid grid-cols-2 gap-4 pr-8">
                <EInput label="Activity Name (e.g. Boat Tour)" value={act.name} onChange={(e: any) => updateActivity(act.id, "name", e.target.value)} />
                <EInput label={`Price (${form.currency || "$"})`} type="number" value={act.price || ""} onChange={(e: any) => updateActivity(act.id, "price", parseFloat(e.target.value))} />
                <EInput label="Duration (e.g. 2 Hours)" value={act.duration} onChange={(e: any) => updateActivity(act.id, "duration", e.target.value)} />
                <EInput label="Available Times" value={act.availableTimes} onChange={(e: any) => updateActivity(act.id, "availableTimes", e.target.value)} placeholder="08:00 AM - 04:00 PM" />
                <EInput label="Minimum Age" type="number" value={act.minAge || ""} onChange={(e: any) => updateActivity(act.id, "minAge", parseInt(e.target.value))} />
                <EInput label="Max Guests per group" type="number" value={act.maxGuests || ""} onChange={(e: any) => updateActivity(act.id, "maxGuests", parseInt(e.target.value))} />
              </div>
              <ETextarea label="Description / Special Rules" rows={2} value={act.description} onChange={(e: any) => updateActivity(act.id, "description", e.target.value)} />
            </div>
          ))}

          <button onClick={addActivity} className="w-full py-4 border-2 border-dashed border-gray-300 text-gray-500 rounded-xl font-bold hover:border-emerald-500 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2">
            <Plus size={18} /> Add Activity
          </button>
        </div>
      </ESection>

      {/* 10. Facilities */}
      <ESection step={10} title="Facilities" icon={<CheckCircle size={18} />}>
        <div className="flex flex-wrap gap-2">
          {FACILITIES_LIST.map(f => (
            <CheckChip key={f} label={f} checked={(form.facilities || []).includes(f)} onChange={() => toggleArr("facilities", f)} />
          ))}
        </div>
      </ESection>

      {/* 13. What to Bring */}
      <ESection step={13} title="What to Bring" icon={<Activity size={18} />}>
        <div className="flex flex-wrap gap-2">
          {WHAT_TO_BRING_LIST.map(w => (
            <CheckChip key={w} label={w} checked={(form.whatToBring || []).includes(w)} onChange={() => toggleArr("whatToBring", w)} />
          ))}
        </div>
      </ESection>
          </div>
        )}

        {activeTab === 6 && (
          <div className="space-y-8 animate-fade-in">
      {/* 14. Gallery */}

      <ESection step={14} title="Gallery" icon={<Camera size={18} />}>
        <div className="mb-4">
          <SmallImageUpload label="Cover Image" value={form.coverImage || ""} onChange={v => update("coverImage", v)} />
        </div>
        
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div>
            <ELabel>Wildlife Photos (up to 10)</ELabel>
            <GalleryUpload images={form.wildlifePhotos || []} onChange={v => update("wildlifePhotos", v)} max={10} />
          </div>
          <div>
            <ELabel>Landscape Photos (up to 10)</ELabel>
            <GalleryUpload images={form.landscapePhotos || []} onChange={v => update("landscapePhotos", v)} max={10} />
          </div>
          <div>
            <ELabel>Lodges & Facilities Photos (up to 5)</ELabel>
            <GalleryUpload images={form.lodgesPhotos || []} onChange={v => update("lodgesPhotos", v)} max={5} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 mt-4">
          <EInput label="360° Tour Link" value={form.tour360 || ""} onChange={(e: any) => update("tour360", e.target.value)} placeholder="https://..." />
          {/* Using a simple comma-separated list for videos for now to keep UI simple */}
          <ETextarea label="Video Links (One per line)" rows={3} value={(form.videos || []).join("\n")} onChange={(e: any) => update("videos", e.target.value.split("\n"))} placeholder="https://youtube.com/...&#10;https://vimeo.com/..." />
        </div>
      </ESection>


      {/* 16. SEO */}
      <ESection step={16} title="SEO Settings" icon={<Globe size={18} />}>
        <EInput label="Meta Title" value={form.metaTitle || ""} onChange={(e: any) => update("metaTitle", e.target.value)} />
        <ETextarea label="Meta Description" rows={2} value={form.metaDescription || ""} onChange={(e: any) => update("metaDescription", e.target.value)} />
        <EInput label="Keywords" value={form.keywords || ""} onChange={(e: any) => update("keywords", e.target.value)} placeholder="comma separated..." />
      </ESection>

      {/* 17. Search and discovery */}
      <ESection step={17} title="Search & Discovery" icon={<Star size={18} />}>
        <p className="text-xs text-gray-500 mb-2">Suitable For</p>
        <div className="flex flex-wrap gap-2">
          {SUITABLE_FOR.map(s => (
            <TagPill key={s} label={s} selected={(form.suitableFor || []).includes(s)} onToggle={() => toggleArr("suitableFor", s)} />
          ))}
        </div>
      </ESection>
          </div>
        )}

      </div>
    </div>
  );
}
