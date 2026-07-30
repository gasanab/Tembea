"use client";

import { useState, useRef } from "react";
import {
  Plus, Trash2, Upload, MapPin, CheckSquare, Clock,
  Car, Bike, Ship, Bus, Users, DollarSign, Calendar,
  Shield, Star, Phone, Mail, MessageSquare, FileText,
  ImageIcon, Settings, ChevronDown, PlusCircle, X, Globe
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type TransportCategory =
  | "car-rental" | "airport-transfer" | "taxi" | "chauffeur"
  | "motorcycle-rental" | "bicycle-rental" | "tour-bus"
  | "minibus" | "luxury-vehicle" | "boat" | "shuttle";

export interface TransportFormData {
  // 1. Vehicle / Service Info
  vehicleName: string;
  category: TransportCategory | "";
  province: string;
  district: string;
  sector: string;
  googleMapsPin: string;
  pickupAddress: string;
  availableAreas: string[];

  // 2. Vehicle Specs
  brand: string;
  model: string;
  year: string;
  color: string;
  licensePlate: string;

  // 3. Dynamic Category Fields
  // Car Rental
  seats: number;
  transmission: string;
  fuelType: string;
  mileageIncluded: string;
  minimumRental: string;
  securityDepositRequired: boolean;
  depositAmount: number;

  // Airport Transfer
  pickupAirport: string;
  destinationCoverage: string;
  waitingTimeIncluded: string;
  meetAndGreet: boolean;

  // Tour Bus
  busCapacity: number;
  airConditioned: boolean;
  microphone: boolean;
  luggageSpace: boolean;
  driverIncluded: boolean;

  // Motorcycle
  helmetIncluded: boolean;
  passengerHelmet: boolean;
  engineSize: string;

  // Bicycle
  bikeType: string;
  gearCount: string;
  lockIncluded: boolean;

  // Boat
  passengerCapacity: number;
  lifeJackets: boolean;
  tripDuration: string;
  route: string;

  // Shuttle
  pickupPoints: string;
  schedule: string;
  stops: string;

  // Taxi
  serviceArea: string;
  baseFare: number;
  pricePerKm: number;

  // 4. Pricing
  pricingModel: string;
  basePrice: number;
  extraKmPrice: number;
  airportPickupFee: number;
  fuelIncluded: boolean;
  chauffeurIncluded: boolean;
  driverFee: number;

  // 5. Availability
  operatingDays: string[];
  operatingHoursStart: string;
  operatingHoursEnd: string;
  instantBooking: boolean;
  maxAdvanceBooking: string;

  // 6. Description
  shortSummary: string;
  description: string;
  bookingRules: string;
  cancellationPolicy: string;

  // 7. Features
  comfortFeatures: string[];
  safetyFeatures: string[];
  convenienceFeatures: string[];

  // 8. Images
  coverImage: string;
  vehicleFrontImage: string;
  vehicleSideImage: string;
  vehicleInteriorImage: string;
  bootImage: string;
  galleryImages: string[];

  // 9. Documents (admin only)
  insuranceDoc: string;
  registrationDoc: string;
  operatingLicenseDoc: string;
  roadworthinessDoc: string;

  // 10. Contact
  contactPerson: string;
  contactPhone: string;
  contactWhatsapp: string;
  contactEmail: string;
}

const CATEGORIES: { value: TransportCategory; label: string; icon: string }[] = [
  { value: "car-rental", label: "Car Rental", icon: "🚗" },
  { value: "airport-transfer", label: "Airport Transfer", icon: "✈️" },
  { value: "taxi", label: "Taxi Service", icon: "🚕" },
  { value: "chauffeur", label: "Chauffeur Service", icon: "🎩" },
  { value: "motorcycle-rental", label: "Motorcycle Rental", icon: "🏍️" },
  { value: "bicycle-rental", label: "Bicycle Rental", icon: "🚲" },
  { value: "tour-bus", label: "Tour Bus", icon: "🚌" },
  { value: "minibus", label: "Minibus", icon: "🚐" },
  { value: "luxury-vehicle", label: "Luxury Vehicle", icon: "💎" },
  { value: "boat", label: "Boat", icon: "⛵" },
  { value: "shuttle", label: "Shuttle Service", icon: "🔄" },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const AREAS = ["Kigali", "Musanze", "Rubavu", "Huye", "Airport", "Nationwide"];
const BRANDS = ["Toyota", "Mercedes", "Land Cruiser", "Hyundai", "Volkswagen", "Nissan", "BMW", "Mitsubishi", "Ford", "Kia"];
const MODELS = ["Prado", "RAV4", "Coaster", "Hiace", "Corolla", "Camry", "Vigo", "Land Cruiser", "Fortuner"];
const PRICING_MODELS = ["Per Hour", "Per Day", "Per Trip", "Per Week", "Per Month"];
const MAX_ADVANCE_BOOKING = ["7 Days", "14 Days", "30 Days", "60 Days", "90 Days"];
const WAITING_TIMES = ["15 Minutes", "30 Minutes", "60 Minutes", "90 Minutes"];

const COMFORT_FEATURES = ["Air Conditioning", "Leather Seats", "WiFi", "USB Charging", "Bluetooth", "Phone Charger", "Sunroof", "Reclining Seats"];
const SAFETY_FEATURES = ["GPS Tracking", "First Aid Kit", "Child Seat", "Seat Belts", "Fire Extinguisher"];
const CONVENIENCE_FEATURES = ["Driver Included", "Unlimited Mileage", "Fuel Included", "Insurance Included", "Luggage Assistance"];

type Props = {
  data: Partial<TransportFormData>;
  updateField: (field: string, value: any) => void;
};

export function TransportForm({ data, updateField }: Props) {
  const [activeTab, setActiveTab] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<string | null>(null);

  const form = data as TransportFormData;
  const category = form.category || "";

  const toggleArrayItem = (field: string, item: string) => {
    const current = (form[field as keyof TransportFormData] as string[]) || [];
    if (current.includes(item)) {
      updateField(field, current.filter(i => i !== item));
    } else {
      updateField(field, [...current, item]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTarget) return;
    const url = URL.createObjectURL(file);
    if (uploadTarget === "galleryImages") {
      const current = form.galleryImages || [];
      updateField("galleryImages", [...current, url]);
    } else {
      updateField(uploadTarget, url);
    }
    setUploadTarget(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const triggerUpload = (target: string) => {
    setUploadTarget(target);
    fileInputRef.current?.click();
  };

  const tabs = [
    { id: 1, label: "Info & Location", icon: Car },
    { id: 2, label: "Specifications", icon: Settings },
    { id: 3, label: "Pricing", icon: DollarSign },
    { id: 4, label: "Availability", icon: Calendar },
    { id: 5, label: "Description", icon: FileText },
    { id: 6, label: "Features", icon: Star },
    { id: 7, label: "Images", icon: ImageIcon },
    { id: 8, label: "Contact", icon: Phone },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-xl border-2 border-slate-100 overflow-hidden">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto bg-gray-50/50">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 px-4 font-bold text-xs border-b-4 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-slate-700 text-slate-800 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="p-8">

        {/* ── TAB 1: Info & Location ─────────────────────────────── */}
        {activeTab === 1 && (
          <div className="space-y-8">
            <SectionHeader icon={<Car className="text-slate-700" size={22} />} title="Vehicle / Service Information" subtitle="Identify what you are listing" color="slate" />

            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Vehicle / Service Name *</label>
                <input type="text" value={form.vehicleName || ""} onChange={e => updateField("vehicleName", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-slate-500 outline-none font-semibold text-lg"
                  placeholder="e.g. Toyota Prado TX 2024" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Transportation Category *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => updateField("category", cat.value)}
                      className={`p-3 rounded-xl border-2 font-bold text-sm text-left flex items-center gap-2 transition-all ${
                        category === cat.value
                          ? "border-slate-700 bg-slate-700 text-white"
                          : "border-gray-200 text-gray-700 hover:border-slate-400"
                      }`}
                    >
                      <span>{cat.icon}</span> {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="pt-6 border-t border-gray-100">
              <h4 className="font-black text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                <MapPin size={16} /> Location
              </h4>
              <div className="grid md:grid-cols-2 gap-5">
                {[
                  { field: "province", label: "Province", placeholder: "e.g. Kigali City" },
                  { field: "district", label: "District", placeholder: "e.g. Gasabo" },
                  { field: "sector", label: "Sector", placeholder: "e.g. Kimironko" },
                  { field: "pickupAddress", label: "Pickup Address", placeholder: "e.g. KG 15 Ave, Remera" },
                  { field: "googleMapsPin", label: "Google Maps Link", placeholder: "https://goo.gl/maps/..." },
                ].map(f => (
                  <div key={f.field}>
                    <label className="block text-sm font-bold text-gray-700 mb-1">{f.label}</label>
                    <input type="text" value={(form as any)[f.field] || ""} onChange={e => updateField(f.field, e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-slate-500 outline-none font-semibold"
                      placeholder={f.placeholder} />
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <label className="block text-sm font-bold text-gray-700 mb-2">Available Areas</label>
                <div className="flex flex-wrap gap-2">
                  {AREAS.map(area => {
                    const isSelected = (form.availableAreas || []).includes(area);
                    return (
                      <button key={area} type="button" onClick={() => toggleArrayItem("availableAreas", area)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                          isSelected ? "bg-slate-700 text-white border-slate-700" : "bg-white text-gray-600 border-gray-200 hover:border-slate-400"
                        }`}
                      >
                        {isSelected ? "✓ " : ""}{area}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: Specifications ─────────────────────────────────── */}
        {activeTab === 2 && (
          <div className="space-y-8">
            <SectionHeader icon={<Settings className="text-violet-600" size={22} />} title="Vehicle Specifications" subtitle="Brand, model, and category-specific details" color="violet" />

            {/* Base Specs */}
            <div className="grid md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Vehicle Brand</label>
                <select value={form.brand || ""} onChange={e => updateField("brand", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 outline-none font-semibold bg-white">
                  <option value="">Select Brand</option>
                  {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Model</label>
                <select value={form.model || ""} onChange={e => updateField("model", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 outline-none font-semibold bg-white">
                  <option value="">Select Model</option>
                  {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Year</label>
                <input type="text" value={form.year || ""} onChange={e => updateField("year", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 outline-none font-semibold"
                  placeholder="e.g. 2024" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Color</label>
                <input type="text" value={form.color || ""} onChange={e => updateField("color", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 outline-none font-semibold"
                  placeholder="e.g. Pearl White" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">License Plate <span className="text-xs text-gray-400 font-normal">(Admin only)</span></label>
                <input type="text" value={form.licensePlate || ""} onChange={e => updateField("licensePlate", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 outline-none font-semibold"
                  placeholder="e.g. RAC 123A" />
              </div>
            </div>

            {/* Dynamic Category Fields */}
            {!category && (
              <div className="mt-8 pt-8 border-t-2 border-gray-100">
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                  <Settings size={48} className="text-gray-300 mb-4" />
                  <h4 className="text-lg font-black text-gray-800 mb-1">Vehicle Configuration</h4>
                  <p className="text-gray-500 font-semibold">Please select a transport category first to see the configuration options.</p>
                </div>
              </div>
            )}

            {/* Car Rental */}
            {(category === "car-rental" || category === "luxury-vehicle" || category === "minibus") && (
              <DynamicSection title="Car Rental Details" color="violet">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Seats</label>
                    <div className="flex flex-wrap gap-2">
                      {[2,4,5,7,14,30,50].map(s => (
                        <button key={s} type="button" onClick={() => updateField("seats", s)}
                          className={`w-12 h-12 rounded-xl font-black border-2 transition-all ${form.seats === s ? "bg-violet-600 text-white border-violet-600" : "border-gray-200 text-gray-700 hover:border-violet-400"}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Transmission</label>
                    <div className="flex gap-3">
                      {["Automatic", "Manual"].map(t => (
                        <button key={t} type="button" onClick={() => updateField("transmission", t)}
                          className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${form.transmission === t ? "bg-violet-600 text-white border-violet-600" : "border-gray-200 text-gray-700 hover:border-violet-400"}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Fuel Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {["Petrol", "Diesel", "Electric", "Hybrid"].map(f => (
                        <button key={f} type="button" onClick={() => updateField("fuelType", f)}
                          className={`py-2 rounded-xl text-sm font-bold border-2 transition-all ${form.fuelType === f ? "bg-violet-600 text-white border-violet-600" : "border-gray-200 text-gray-700 hover:border-violet-400"}`}>
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Mileage Included</label>
                    <div className="flex gap-3">
                      {["Unlimited", "200 KM/day"].map(m => (
                        <button key={m} type="button" onClick={() => updateField("mileageIncluded", m)}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${form.mileageIncluded === m ? "bg-violet-600 text-white border-violet-600" : "border-gray-200 text-gray-700 hover:border-violet-400"}`}>
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Minimum Rental Period</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["Half Day", "1 Day", "2 Days", "Weekly", "Monthly"].map(m => (
                        <button key={m} type="button" onClick={() => updateField("minimumRental", m)}
                          className={`py-2 rounded-xl text-xs font-bold border-2 transition-all ${form.minimumRental === m ? "bg-violet-600 text-white border-violet-600" : "border-gray-200 text-gray-700 hover:border-violet-400"}`}>
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Security Deposit Required</label>
                    <div className="flex gap-3">
                      {[{ v: true, l: "Yes" }, { v: false, l: "No" }].map(opt => (
                        <button key={opt.l} type="button" onClick={() => updateField("securityDepositRequired", opt.v)}
                          className={`flex-1 py-2.5 rounded-xl font-bold border-2 transition-all ${form.securityDepositRequired === opt.v ? "bg-violet-600 text-white border-violet-600" : "border-gray-200 text-gray-700 hover:border-violet-400"}`}>
                          {opt.l}
                        </button>
                      ))}
                    </div>
                    {form.securityDepositRequired && (
                      <div className="mt-3">
                        <label className="block text-xs font-bold text-gray-600 mb-1">Deposit Amount ($)</label>
                        <input type="number" value={form.depositAmount || ""} onChange={e => updateField("depositAmount", Number(e.target.value))}
                          className="w-full px-4 py-2 rounded-xl border-2 border-violet-200 focus:border-violet-500 outline-none font-bold"
                          placeholder="e.g. 200" />
                      </div>
                    )}
                  </div>
                </div>
              </DynamicSection>
            )}

            {/* Airport Transfer */}
            {category === "airport-transfer" && (
              <DynamicSection title="Airport Transfer Details" color="violet">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Pickup Airport</label>
                    <input type="text" value={form.pickupAirport || ""} onChange={e => updateField("pickupAirport", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 outline-none font-semibold"
                      placeholder="e.g. Kigali International Airport" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Destination Coverage</label>
                    <input type="text" value={form.destinationCoverage || ""} onChange={e => updateField("destinationCoverage", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 outline-none font-semibold"
                      placeholder="e.g. All of Kigali, Musanze" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Waiting Time Included</label>
                    <div className="grid grid-cols-2 gap-2">
                      {WAITING_TIMES.map(t => (
                        <button key={t} type="button" onClick={() => updateField("waitingTimeIncluded", t)}
                          className={`py-2 rounded-xl text-sm font-bold border-2 transition-all ${form.waitingTimeIncluded === t ? "bg-violet-600 text-white border-violet-600" : "border-gray-200 text-gray-700 hover:border-violet-400"}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Meet & Greet Service</label>
                    <div className="flex gap-3">
                      {[{ v: true, l: "Yes" }, { v: false, l: "No" }].map(opt => (
                        <button key={opt.l} type="button" onClick={() => updateField("meetAndGreet", opt.v)}
                          className={`flex-1 py-2.5 rounded-xl font-bold border-2 transition-all ${form.meetAndGreet === opt.v ? "bg-violet-600 text-white border-violet-600" : "border-gray-200 text-gray-700 hover:border-violet-400"}`}>
                          {opt.l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Seats</label>
                    <div className="flex flex-wrap gap-2">
                      {[2,4,5,7].map(s => (
                        <button key={s} type="button" onClick={() => updateField("seats", s)}
                          className={`w-12 h-12 rounded-xl font-black border-2 transition-all ${form.seats === s ? "bg-violet-600 text-white border-violet-600" : "border-gray-200 text-gray-700 hover:border-violet-400"}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </DynamicSection>
            )}

            {/* Tour Bus */}
            {(category === "tour-bus") && (
              <DynamicSection title="Tour Bus Details" color="violet">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Bus Capacity</label>
                    <input type="number" value={form.busCapacity || ""} onChange={e => updateField("busCapacity", Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 outline-none font-semibold"
                      placeholder="e.g. 50" />
                  </div>
                  <div className="flex flex-col gap-3">
                    {[
                      { field: "airConditioned", label: "Air Conditioned" },
                      { field: "microphone", label: "Microphone / PA System" },
                      { field: "luggageSpace", label: "Luggage Space" },
                      { field: "driverIncluded", label: "Driver Included" },
                    ].map(f => (
                      <label key={f.field} className="flex items-center gap-3 cursor-pointer" onClick={() => updateField(f.field, !(form as any)[f.field])}>
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${(form as any)[f.field] ? "bg-violet-600 border-violet-600 text-white" : "border-gray-300"}`}>
                          {(form as any)[f.field] && <CheckSquare size={14} />}
                        </div>
                        <span className="font-bold text-gray-800">{f.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </DynamicSection>
            )}

            {/* Motorcycle */}
            {category === "motorcycle-rental" && (
              <DynamicSection title="Motorcycle Details" color="violet">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Engine Size</label>
                    <input type="text" value={form.engineSize || ""} onChange={e => updateField("engineSize", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 outline-none font-semibold"
                      placeholder="e.g. 150cc" />
                  </div>
                  <div className="flex flex-col gap-3 mt-2">
                    {[
                      { field: "helmetIncluded", label: "Helmet Included" },
                      { field: "passengerHelmet", label: "Passenger Helmet" },
                    ].map(f => (
                      <label key={f.field} className="flex items-center gap-3 cursor-pointer" onClick={() => updateField(f.field, !(form as any)[f.field])}>
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${(form as any)[f.field] ? "bg-violet-600 border-violet-600 text-white" : "border-gray-300"}`}>
                          {(form as any)[f.field] && <CheckSquare size={14} />}
                        </div>
                        <span className="font-bold text-gray-800">{f.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </DynamicSection>
            )}

            {/* Bicycle */}
            {category === "bicycle-rental" && (
              <DynamicSection title="Bicycle Details" color="violet">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Bike Type</label>
                    <input type="text" value={form.bikeType || ""} onChange={e => updateField("bikeType", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 outline-none font-semibold"
                      placeholder="e.g. Mountain, Road, City" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Gear Count</label>
                    <input type="text" value={form.gearCount || ""} onChange={e => updateField("gearCount", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 outline-none font-semibold"
                      placeholder="e.g. 21 gears" />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer" onClick={() => updateField("helmetIncluded", !form.helmetIncluded)}>
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${form.helmetIncluded ? "bg-violet-600 border-violet-600 text-white" : "border-gray-300"}`}>
                      {form.helmetIncluded && <CheckSquare size={14} />}
                    </div>
                    <span className="font-bold text-gray-800">Helmet Included</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer" onClick={() => updateField("lockIncluded", !form.lockIncluded)}>
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${form.lockIncluded ? "bg-violet-600 border-violet-600 text-white" : "border-gray-300"}`}>
                      {form.lockIncluded && <CheckSquare size={14} />}
                    </div>
                    <span className="font-bold text-gray-800">Lock Included</span>
                  </label>
                </div>
              </DynamicSection>
            )}

            {/* Boat */}
            {category === "boat" && (
              <DynamicSection title="Boat Details" color="violet">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Passenger Capacity</label>
                    <input type="number" value={form.passengerCapacity || ""} onChange={e => updateField("passengerCapacity", Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 outline-none font-semibold"
                      placeholder="e.g. 20" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Trip Duration</label>
                    <input type="text" value={form.tripDuration || ""} onChange={e => updateField("tripDuration", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 outline-none font-semibold"
                      placeholder="e.g. 2 Hours" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Route</label>
                    <input type="text" value={form.route || ""} onChange={e => updateField("route", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 outline-none font-semibold"
                      placeholder="e.g. Gisenyi - Cyangugu" />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer mt-4" onClick={() => updateField("lifeJackets", !form.lifeJackets)}>
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${form.lifeJackets ? "bg-violet-600 border-violet-600 text-white" : "border-gray-300"}`}>
                      {form.lifeJackets && <CheckSquare size={14} />}
                    </div>
                    <span className="font-bold text-gray-800">Life Jackets Provided</span>
                  </label>
                </div>
              </DynamicSection>
            )}

            {/* Taxi */}
            {(category === "taxi" || category === "chauffeur") && (
              <DynamicSection title="Taxi / Chauffeur Details" color="violet">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Service Area</label>
                    <input type="text" value={form.serviceArea || ""} onChange={e => updateField("serviceArea", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 outline-none font-semibold"
                      placeholder="e.g. All of Kigali" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Base Fare ($)</label>
                    <input type="number" value={form.baseFare || ""} onChange={e => updateField("baseFare", Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 outline-none font-semibold"
                      placeholder="e.g. 5" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Price per KM ($)</label>
                    <input type="number" value={form.pricePerKm || ""} onChange={e => updateField("pricePerKm", Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 outline-none font-semibold"
                      placeholder="e.g. 1.5" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Seats</label>
                    <div className="flex flex-wrap gap-2">
                      {[2,4,5,7].map(s => (
                        <button key={s} type="button" onClick={() => updateField("seats", s)}
                          className={`w-12 h-12 rounded-xl font-black border-2 transition-all ${form.seats === s ? "bg-violet-600 text-white border-violet-600" : "border-gray-200 text-gray-700 hover:border-violet-400"}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </DynamicSection>
            )}

            {/* Shuttle */}
            {category === "shuttle" && (
              <DynamicSection title="Shuttle Details" color="violet">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Pickup Points</label>
                    <textarea value={form.pickupPoints || ""} onChange={e => updateField("pickupPoints", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 outline-none font-semibold min-h-[80px]"
                      placeholder="e.g. Kigali Convention Centre, Kigali Airport..." />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Schedule</label>
                    <textarea value={form.schedule || ""} onChange={e => updateField("schedule", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 outline-none font-semibold min-h-[80px]"
                      placeholder="e.g. Departs every 2 hours from 06:00 AM..." />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Stops</label>
                    <input type="text" value={form.stops || ""} onChange={e => updateField("stops", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 outline-none font-semibold"
                      placeholder="e.g. Remera, Nyabugogo, Musanze" />
                  </div>
                </div>
              </DynamicSection>
            )}
          </div>
        )}

        {/* ── TAB 3: Pricing ───────────────────────────────────────── */}
        {activeTab === 3 && (
          <div className="space-y-8">
            <SectionHeader icon={<DollarSign className="text-green-600" size={22} />} title="Pricing" subtitle="Set your rates and pricing model" color="green" />

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Pricing Model</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {PRICING_MODELS.map(p => (
                  <button key={p} type="button" onClick={() => updateField("pricingModel", p)}
                    className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${form.pricingModel === p ? "bg-green-600 text-white border-green-600" : "border-gray-200 text-gray-700 hover:border-green-400"}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Base Price ($) *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center"><DollarSign size={16} className="text-gray-400" /></div>
                  <input type="number" value={form.basePrice || ""} onChange={e => updateField("basePrice", Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none font-black text-xl"
                    placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Extra KM Price ($)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center"><DollarSign size={16} className="text-gray-400" /></div>
                  <input type="number" value={form.extraKmPrice || ""} onChange={e => updateField("extraKmPrice", Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none font-semibold"
                    placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Airport Pickup Fee ($)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center"><DollarSign size={16} className="text-gray-400" /></div>
                  <input type="number" value={form.airportPickupFee || ""} onChange={e => updateField("airportPickupFee", Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none font-semibold"
                    placeholder="0.00" />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Fuel Included?</label>
                <div className="flex gap-3">
                  {[{ v: true, l: "Yes" }, { v: false, l: "No" }].map(opt => (
                    <button key={opt.l} type="button" onClick={() => updateField("fuelIncluded", opt.v)}
                      className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${form.fuelIncluded === opt.v ? "bg-green-600 text-white border-green-600" : "border-gray-200 text-gray-700 hover:border-green-400"}`}>
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Driver Included?</label>
                <div className="flex gap-3">
                  {[{ v: true, l: "Yes" }, { v: false, l: "No" }].map(opt => (
                    <button key={opt.l} type="button" onClick={() => updateField("chauffeurIncluded", opt.v)}
                      className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${form.chauffeurIncluded === opt.v ? "bg-green-600 text-white border-green-600" : "border-gray-200 text-gray-700 hover:border-green-400"}`}>
                      {opt.l}
                    </button>
                  ))}
                </div>
                {form.chauffeurIncluded && (
                  <div className="mt-3">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Driver Fee (if separate, $)</label>
                    <input type="number" value={form.driverFee || ""} onChange={e => updateField("driverFee", Number(e.target.value))}
                      className="w-full px-4 py-2 rounded-xl border-2 border-green-200 focus:border-green-500 outline-none font-bold"
                      placeholder="e.g. 20" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: Availability ──────────────────────────────────── */}
        {activeTab === 4 && (
          <div className="space-y-8">
            <SectionHeader icon={<Calendar className="text-blue-600" size={22} />} title="Availability" subtitle="Set operating days, hours, and booking options" color="blue" />

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Operating Days</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map(day => {
                  const isSelected = (form.operatingDays || []).includes(day);
                  return (
                    <button key={day} type="button" onClick={() => toggleArrayItem("operatingDays", day)}
                      className={`px-4 py-2.5 rounded-xl font-bold border-2 transition-all ${isSelected ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-700 hover:border-blue-400"}`}>
                      {day.substring(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Operating Hours — Start</label>
                <input type="time" value={form.operatingHoursStart || "08:00"} onChange={e => updateField("operatingHoursStart", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none font-semibold" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Operating Hours — End</label>
                <input type="time" value={form.operatingHoursEnd || "20:00"} onChange={e => updateField("operatingHoursEnd", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none font-semibold" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Instant Booking</label>
                <div className="flex gap-3">
                  {[{ v: true, l: "Yes — Book instantly" }, { v: false, l: "No — Request to book" }].map(opt => (
                    <button key={opt.l} type="button" onClick={() => updateField("instantBooking", opt.v)}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${form.instantBooking === opt.v ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-700 hover:border-blue-400"}`}>
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Maximum Advance Booking</label>
                <div className="grid grid-cols-3 gap-2">
                  {MAX_ADVANCE_BOOKING.map(m => (
                    <button key={m} type="button" onClick={() => updateField("maxAdvanceBooking", m)}
                      className={`py-2 rounded-xl text-sm font-bold border-2 transition-all ${form.maxAdvanceBooking === m ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-700 hover:border-blue-400"}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5: Description ───────────────────────────────────── */}
        {activeTab === 5 && (
          <div className="space-y-8">
            <SectionHeader icon={<FileText className="text-amber-600" size={22} />} title="Description" subtitle="Describe your service clearly and professionally" color="amber" />

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Short Summary <span className="text-xs font-normal text-gray-400">(max 150 chars)</span></label>
              <input type="text" maxLength={150} value={form.shortSummary || ""} onChange={e => updateField("shortSummary", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-500 outline-none font-semibold"
                placeholder="Perfect for airport transfers around Kigali." />
              <div className="text-xs text-right text-gray-400 mt-1">{(form.shortSummary || "").length}/150</div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Full Description</label>
              <textarea value={form.description || ""} onChange={e => updateField("description", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-500 outline-none font-semibold min-h-[130px]"
                placeholder="Describe your vehicle/service in detail..." />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Booking Rules</label>
                <textarea value={form.bookingRules || ""} onChange={e => updateField("bookingRules", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-500 outline-none font-semibold min-h-[100px]"
                  placeholder="e.g. Driver's license required, min age 25..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Cancellation Policy</label>
                <textarea value={form.cancellationPolicy || ""} onChange={e => updateField("cancellationPolicy", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-500 outline-none font-semibold min-h-[100px]"
                  placeholder="e.g. Free cancellation up to 24 hours before..." />
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 6: Features ──────────────────────────────────────── */}
        {activeTab === 6 && (
          <div className="space-y-8">
            <SectionHeader icon={<Star className="text-yellow-500" size={22} />} title="Features & Amenities" subtitle="Select all features included in this vehicle/service" color="yellow" />

            {[
              { title: "Comfort", icon: "🛋️", items: COMFORT_FEATURES, field: "comfortFeatures", accent: "yellow" },
              { title: "Safety", icon: "🛡️", items: SAFETY_FEATURES, field: "safetyFeatures", accent: "red" },
              { title: "Convenience", icon: "✅", items: CONVENIENCE_FEATURES, field: "convenienceFeatures", accent: "green" },
            ].map(section => (
              <div key={section.field} className="rounded-2xl border border-gray-200 p-5 bg-gray-50/50">
                <h4 className="font-black text-gray-900 mb-3">{section.icon} {section.title}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {section.items.map(item => {
                    const isSelected = ((form[section.field as keyof TransportFormData] as string[]) || []).includes(item);
                    return (
                      <label key={item} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? "border-slate-500 bg-slate-50" : "border-gray-200 bg-white hover:border-slate-200"}`}
                        onClick={() => toggleArrayItem(section.field, item)}>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${isSelected ? "bg-slate-700 border-slate-700 text-white" : "border-gray-300"}`}>
                          {isSelected && <CheckSquare size={13} />}
                        </div>
                        <span className={`text-sm font-bold ${isSelected ? "text-slate-900" : "text-gray-700"}`}>{item}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB 7: Images ────────────────────────────────────────── */}
        {activeTab === 7 && (
          <div className="space-y-8">
            <SectionHeader icon={<ImageIcon className="text-pink-600" size={22} />} title="Images" subtitle="Upload clear, high-quality photos of your vehicle" color="pink" />

            <div className="grid md:grid-cols-2 gap-5">
              {[
                { field: "coverImage", label: "Cover Image *", tip: "Best front view" },
                { field: "vehicleFrontImage", label: "Vehicle Front", tip: "Full front shot" },
                { field: "vehicleSideImage", label: "Vehicle Side", tip: "Full side profile" },
                { field: "vehicleInteriorImage", label: "Vehicle Interior", tip: "Seats & dashboard" },
                { field: "bootImage", label: "Boot / Luggage Space", tip: "Open boot area" },
              ].map(img => (
                <div key={img.field}
                  className="relative h-40 rounded-2xl border-2 border-dashed border-gray-300 overflow-hidden cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition-all group"
                  onClick={() => triggerUpload(img.field)}>
                  {(form as any)[img.field] ? (
                    <>
                      <img src={(form as any)[img.field]} alt={img.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold">
                        <Upload size={20} className="mr-2" /> Change
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                      <ImageIcon size={28} className="mb-2" />
                      <span className="text-sm font-bold">{img.label}</span>
                      <span className="text-xs">{img.tip}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="font-bold text-gray-800">Additional Photos</label>
                <button onClick={() => triggerUpload("galleryImages")}
                  className="flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-700 font-bold rounded-xl border border-pink-200 hover:bg-pink-100 transition-all text-sm">
                  <Plus size={16} /> Add Photo
                </button>
              </div>
              {(form.galleryImages || []).length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {(form.galleryImages || []).map((img, idx) => (
                    <div key={idx} className="aspect-square rounded-xl overflow-hidden relative group border border-gray-200">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => {
                        const arr = [...(form.galleryImages || [])];
                        arr.splice(idx, 1);
                        updateField("galleryImages", arr);
                      }} className="absolute top-1 right-1 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 text-center text-sm text-gray-500 font-semibold">No additional photos yet</div>
              )}
            </div>

            {/* Documents (admin-only) */}
            <div className="pt-6 border-t border-gray-100">
              <h4 className="font-black text-gray-700 uppercase text-sm mb-3 flex items-center gap-2">
                <Shield size={16} className="text-gray-500" /> Documents <span className="text-xs normal-case font-normal text-gray-400">(Admin review only — hidden from customers)</span>
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { field: "insuranceDoc", label: "Insurance" },
                  { field: "registrationDoc", label: "Vehicle Registration" },
                  { field: "operatingLicenseDoc", label: "Operating License" },
                  { field: "roadworthinessDoc", label: "Roadworthiness Certificate" },
                ].map(doc => (
                  <div key={doc.field}
                    className={`p-4 rounded-xl border-2 border-dashed cursor-pointer flex items-center gap-3 transition-all ${(form as any)[doc.field] ? "border-green-300 bg-green-50" : "border-gray-200 hover:border-gray-400"}`}
                    onClick={() => triggerUpload(doc.field)}>
                    <FileText size={20} className={(form as any)[doc.field] ? "text-green-600" : "text-gray-400"} />
                    <div>
                      <div className="text-sm font-bold text-gray-800">{doc.label}</div>
                      <div className="text-xs text-gray-500">{(form as any)[doc.field] ? "✓ Uploaded" : "Click to upload"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 8: Contact ───────────────────────────────────────── */}
        {activeTab === 8 && (
          <div className="space-y-8">
            <SectionHeader icon={<Phone className="text-teal-600" size={22} />} title="Contact Information" subtitle="How clients can reach you" color="teal" />

            <div className="grid md:grid-cols-2 gap-5">
              {[
                { field: "contactPerson", label: "Contact Person", icon: <Users size={16} />, placeholder: "e.g. Jean Pierre" },
                { field: "contactPhone", label: "Phone Number", icon: <Phone size={16} />, placeholder: "+250 7xx xxx xxx" },
                { field: "contactWhatsapp", label: "WhatsApp", icon: <MessageSquare size={16} />, placeholder: "+250 7xx xxx xxx" },
                { field: "contactEmail", label: "Email", icon: <Mail size={16} />, placeholder: "contact@example.rw" },
              ].map(f => (
                <div key={f.field}>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{f.label}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">{f.icon}</div>
                    <input type="text" value={(form as any)[f.field] || ""} onChange={e => updateField(f.field, e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 outline-none font-semibold"
                      placeholder={f.placeholder} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Helper Components ────────────────────────────────────────────────────────

function SectionHeader({ icon, title, subtitle, color }: { icon: React.ReactNode; title: string; subtitle: string; color: string }) {
  return (
    <div className="flex items-center gap-4 border-b border-gray-100 pb-5">
      <div className={`w-12 h-12 rounded-xl bg-${color}-100 flex items-center justify-center`}>{icon}</div>
      <div>
        <h3 className="text-xl font-black text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 font-semibold">{subtitle}</p>
      </div>
    </div>
  );
}

function DynamicSection({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className={`p-5 rounded-2xl border-2 border-${color}-200 bg-${color}-50/30`}>
      <h4 className={`text-sm font-black text-${color}-900 uppercase tracking-wider mb-4`}>{title}</h4>
      {children}
    </div>
  );
}
