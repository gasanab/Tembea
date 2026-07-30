"use client";

import { useState, useRef } from "react";
import {
  Upload, Trash2, X, Plus, MapPin, Map,
  Clock, Calendar, CheckSquare, ImageIcon, BookOpen,
  Info, History, Camera, Landmark, HeartHandshake, Shield, Users, Church,
  CheckCircle, Link2, PlusCircle
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MemorialTour {
  id: string;
  name: string;
  duration: string;
  language: string;
  price: number;
}

export interface MemorialFormData {
  // 1. Basic Info
  siteName: string;
  city: string;
  province: string;
  district: string;
  gpsLocation: string;
  googleMapsPin: string;

  // 2. Visitor Info
  isFree: boolean;
  entryFee: number;
  openingDays: string[];
  openingHours: string;
  averageVisitDuration: string;
  guidedToursAvailable: boolean;
  parkingAvailable: boolean;
  wheelchairAccessible: boolean;
  childrenAllowed: boolean;

  // 3. Historical Info
  historicalBackground: string;
  historicalImportance: string;
  yearEstablished: string;
  importantEvents: string;
  famousPeople: string;

  // 4. Visitor Experience
  visitorActivities: string[];

  // 5. Facilities
  facilities: string[];

  // 6. Guided Tours
  guidedTours: MemorialTour[];

  // 7. Media
  coverImage: string;
  galleryImages: string[];
  image360: string;
  video: string;

  // 8. Visitor Tips
  bestTimeToVisit: string;
  dressCode: string;
  photographyRules: string;
  respectGuidelines: string;
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const VISITOR_ACTIVITIES = [
  "Museum Visit", "Guided Tour", "Memorial Walk", "Educational Session", 
  "Photography Area", "Gift Shop", "Prayer Area", "Documentary Viewing", "Library"
];

const FACILITIES = [
  "Parking", "Washrooms", "Wheelchair Access", "Cafe", "Restaurant", 
  "Souvenir Shop", "WiFi", "Prayer Room", "Security", "Emergency Services"
];

type Props = {
  data: Partial<MemorialFormData>;
  updateField: (field: string, value: any) => void;
};

export function MemorialSiteForm({ data, updateField }: Props) {
  const [activeTab, setActiveTab] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<string | null>(null);

  const form = data as MemorialFormData;

  const toggleArrayItem = (field: string, item: string) => {
    const current = (form[field as keyof MemorialFormData] as string[]) || [];
    if (current.includes(item)) {
      updateField(field, current.filter(i => i !== item));
    } else {
      updateField(field, [...current, item]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTarget) return;

    try {
      const fakeUrl = URL.createObjectURL(file);
      
      if (["coverImage", "image360", "video"].includes(uploadTarget)) {
        updateField(uploadTarget, fakeUrl);
      } else if (uploadTarget === "galleryImages") {
        const current = form.galleryImages || [];
        updateField("galleryImages", [...current, fakeUrl]);
      }
    } catch (error) {
      console.error("Upload failed", error);
    }
    
    setUploadTarget(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const triggerUpload = (target: string) => {
    setUploadTarget(target);
    fileInputRef.current?.click();
  };

  const addTour = () => {
    const currentTours = form.guidedTours || [];
    updateField("guidedTours", [
      ...currentTours,
      { id: Date.now().toString(), name: "", duration: "", language: "", price: 0 }
    ]);
  };

  const updateTour = (id: string, field: keyof MemorialTour, value: any) => {
    const currentTours = form.guidedTours || [];
    updateField("guidedTours", currentTours.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const removeTour = (id: string) => {
    const currentTours = form.guidedTours || [];
    updateField("guidedTours", currentTours.filter(t => t.id !== id));
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border-2 border-indigo-100 overflow-hidden">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept={uploadTarget === 'video' ? "video/*" : "image/*"}
        onChange={handleFileUpload} 
      />

      <div className="flex border-b border-gray-200 overflow-x-auto">
        {[
          { id: 1, label: "Basic Info", icon: Landmark },
          { id: 2, label: "History", icon: History },
          { id: 3, label: "Experience", icon: BookOpen },
          { id: 4, label: "Tours", icon: Users },
          { id: 5, label: "Guidelines", icon: Shield },
          { id: 6, label: "Media", icon: ImageIcon }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-bold text-sm border-b-4 transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? "border-indigo-600 text-indigo-700 bg-indigo-50/50" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="p-8">
        {/* 1. BASIC & VISITOR INFO */}
        {activeTab === 1 && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Landmark className="text-indigo-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Basic & Visitor Information</h3>
                <p className="text-sm text-gray-500 font-semibold">Location, entry details, and opening times.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Site Name</label>
                <input
                  type="text"
                  value={form.siteName || ""}
                  onChange={(e) => updateField("siteName", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all font-semibold outline-none text-lg"
                  placeholder="E.g. Kigali Genocide Memorial"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Province</label>
                <input
                  type="text"
                  value={form.province || ""}
                  onChange={(e) => updateField("province", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 transition-all font-semibold outline-none"
                  placeholder="E.g. Kigali City"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">District</label>
                <input
                  type="text"
                  value={form.district || ""}
                  onChange={(e) => updateField("district", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 transition-all font-semibold outline-none"
                  placeholder="E.g. Gasabo"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">City / Town</label>
                <input
                  type="text"
                  value={form.city || ""}
                  onChange={(e) => updateField("city", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 transition-all font-semibold outline-none"
                  placeholder="E.g. Kigali"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Google Maps Pin (Link)</label>
                <input
                  type="text"
                  value={form.googleMapsPin || ""}
                  onChange={(e) => updateField("googleMapsPin", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 transition-all font-semibold outline-none"
                  placeholder="https://goo.gl/maps/..."
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 space-y-6">
              <h4 className="font-black text-gray-900 uppercase tracking-wide">Visitor Access & Pricing</h4>
              
              <div className="grid md:grid-cols-2 gap-6 bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                <div>
                  <label className="flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all border-indigo-200 bg-white" onClick={() => updateField('isFree', !form.isFree)}>
                    <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors shrink-0 ${
                      form.isFree ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-300"
                    }`}>
                      {form.isFree && <CheckSquare size={16} />}
                    </div>
                    <div>
                      <span className="font-bold text-indigo-900">Free Entry</span>
                      <p className="text-xs text-indigo-700 font-semibold">No general admission fee</p>
                    </div>
                  </label>
                </div>
                {!form.isFree && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Standard Entry Fee</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-gray-500 font-bold">$</span>
                      </div>
                      <input
                        type="number"
                        value={form.entryFee || ""}
                        onChange={(e) => updateField("entryFee", Number(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all font-black outline-none"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Opening Days</label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map(day => {
                      const isSelected = (form.openingDays || []).includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleArrayItem("openingDays", day)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                            isSelected ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
                          }`}
                        >
                          {day.substring(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Opening Hours</label>
                  <input
                    type="text"
                    value={form.openingHours || ""}
                    onChange={(e) => updateField("openingHours", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 transition-all font-semibold outline-none"
                    placeholder="E.g. 08:00 AM - 05:00 PM"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 cursor-pointer" onClick={() => updateField('guidedToursAvailable', !form.guidedToursAvailable)}>
                  <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${form.guidedToursAvailable ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-300"}`}>
                    {form.guidedToursAvailable && <CheckSquare size={14} />}
                  </div>
                  <span className="text-xs font-bold text-gray-700">Guided Tours</span>
                </label>
                <label className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 cursor-pointer" onClick={() => updateField('parkingAvailable', !form.parkingAvailable)}>
                  <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${form.parkingAvailable ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-300"}`}>
                    {form.parkingAvailable && <CheckSquare size={14} />}
                  </div>
                  <span className="text-xs font-bold text-gray-700">Parking</span>
                </label>
                <label className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 cursor-pointer" onClick={() => updateField('wheelchairAccessible', !form.wheelchairAccessible)}>
                  <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${form.wheelchairAccessible ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-300"}`}>
                    {form.wheelchairAccessible && <CheckSquare size={14} />}
                  </div>
                  <span className="text-xs font-bold text-gray-700">Wheelchair Access</span>
                </label>
                <label className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 cursor-pointer" onClick={() => updateField('childrenAllowed', !form.childrenAllowed)}>
                  <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${form.childrenAllowed ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-300"}`}>
                    {form.childrenAllowed && <CheckSquare size={14} />}
                  </div>
                  <span className="text-xs font-bold text-gray-700">Children Allowed</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* 2. HISTORICAL INFO */}
        {activeTab === 2 && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <History className="text-orange-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Historical Information</h3>
                <p className="text-sm text-gray-500 font-semibold">The history and significance of the memorial site.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Year Established</label>
                <input
                  type="text"
                  value={form.yearEstablished || ""}
                  onChange={(e) => updateField("yearEstablished", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 transition-all font-semibold outline-none"
                  placeholder="E.g. 1999"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Important Events</label>
                <input
                  type="text"
                  value={form.importantEvents || ""}
                  onChange={(e) => updateField("importantEvents", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 transition-all font-semibold outline-none"
                  placeholder="Events related to the site"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Historical Importance & Background</label>
              <textarea
                value={form.historicalBackground || ""}
                onChange={(e) => updateField("historicalBackground", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 transition-all font-semibold outline-none min-h-[150px]"
                placeholder="Explain the history behind this memorial site..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Notable Figures / Famous People</label>
              <textarea
                value={form.famousPeople || ""}
                onChange={(e) => updateField("famousPeople", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 transition-all font-semibold outline-none min-h-[100px]"
                placeholder="List any key historical figures associated with this site..."
              />
            </div>
          </div>
        )}

        {/* 3. EXPERIENCE & FACILITIES */}
        {activeTab === 3 && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                <BookOpen className="text-teal-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Visitor Experience & Facilities</h3>
                <p className="text-sm text-gray-500 font-semibold">What can visitors do and what amenities are available.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-gray-900 mb-3 uppercase tracking-wider">Things Visitors Can Do</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {VISITOR_ACTIVITIES.map(activity => {
                  const isSelected = (form.visitorActivities || []).includes(activity);
                  return (
                    <label key={activity} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected ? "border-teal-500 bg-teal-50" : "border-gray-200 bg-white hover:border-teal-200"
                    }`} onClick={() => toggleArrayItem("visitorActivities", activity)}>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-teal-600 border-teal-600 text-white" : "border-gray-300"
                      }`}>
                        {isSelected && <CheckSquare size={14} />}
                      </div>
                      <span className={`text-sm font-bold ${isSelected ? "text-teal-900" : "text-gray-700"}`}>{activity}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <label className="block text-sm font-black text-gray-900 mb-3 uppercase tracking-wider">Available Facilities</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {FACILITIES.map(facility => {
                  const isSelected = (form.facilities || []).includes(facility);
                  return (
                    <label key={facility} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected ? "border-teal-500 bg-teal-50" : "border-gray-200 bg-white hover:border-teal-200"
                    }`} onClick={() => toggleArrayItem("facilities", facility)}>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-teal-600 border-teal-600 text-white" : "border-gray-300"
                      }`}>
                        {isSelected && <CheckSquare size={14} />}
                      </div>
                      <span className={`text-sm font-bold ${isSelected ? "text-teal-900" : "text-gray-700"}`}>{facility}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Average Visit Duration</label>
                <input
                  type="text"
                  value={form.averageVisitDuration || ""}
                  onChange={(e) => updateField("averageVisitDuration", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 transition-all font-semibold outline-none"
                  placeholder="E.g. 1.5 - 2 Hours"
                />
              </div>
            </div>
          </div>
        )}

        {/* 4. GUIDED TOURS */}
        {activeTab === 4 && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-gray-900">Guided Tours</h3>
                <p className="text-sm text-gray-500 font-semibold">Add available guided tours at this site.</p>
              </div>
              <button 
                onClick={addTour}
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md"
              >
                <PlusCircle size={18} /> Add Tour
              </button>
            </div>

            {(!form.guidedTours || form.guidedTours.length === 0) ? (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                <Users size={48} className="text-gray-300 mb-4" />
                <h4 className="text-lg font-black text-gray-800 mb-1">No Guided Tours Added</h4>
                <p className="text-gray-500 font-semibold mb-4">You can add specific tours that visitors can book.</p>
                <button onClick={addTour} className="px-6 py-2.5 bg-white border-2 border-gray-200 hover:border-blue-500 text-gray-700 font-bold rounded-xl transition-all">
                  Add First Tour
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {form.guidedTours.map((tour, index) => (
                  <div key={tour.id} className="p-5 rounded-2xl border-2 border-gray-200 bg-white relative group">
                    <button 
                      onClick={() => removeTour(tour.id)}
                      className="absolute top-4 right-4 text-red-400 hover:text-red-600 p-1 bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={18} />
                    </button>
                    
                    <h4 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs">{index + 1}</span>
                      Tour Configuration
                    </h4>
                    
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tour Name</label>
                        <input
                          type="text"
                          value={tour.name}
                          onChange={(e) => updateTour(tour.id, "name", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 font-semibold outline-none"
                          placeholder="e.g. Full Audio Tour"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Duration</label>
                        <input
                          type="text"
                          value={tour.duration}
                          onChange={(e) => updateTour(tour.id, "duration", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 font-semibold outline-none"
                          placeholder="e.g. 1h 30m"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Language(s)</label>
                        <input
                          type="text"
                          value={tour.language}
                          onChange={(e) => updateTour(tour.id, "language", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 font-semibold outline-none"
                          placeholder="e.g. EN, FR"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <label className="text-sm font-bold text-gray-700">Tour Price (Add $0 if included in entry)</label>
                      <div className="relative w-48">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 font-bold">$</span>
                        </div>
                        <input
                          type="number"
                          value={tour.price}
                          onChange={(e) => updateTour(tour.id, "price", Number(e.target.value))}
                          className="w-full pl-8 pr-3 py-2 rounded-lg border-2 border-blue-200 focus:border-blue-500 font-black outline-none"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. GUIDELINES */}
        {activeTab === 5 && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <Shield className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Visitor Tips & Guidelines</h3>
                <p className="text-sm text-gray-500 font-semibold">Rules, dress codes, and how to respect the site.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Best Time to Visit</label>
                <input
                  type="text"
                  value={form.bestTimeToVisit || ""}
                  onChange={(e) => updateField("bestTimeToVisit", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 transition-all font-semibold outline-none"
                  placeholder="E.g. Early mornings, weekdays"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Dress Code</label>
                <input
                  type="text"
                  value={form.dressCode || ""}
                  onChange={(e) => updateField("dressCode", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 transition-all font-semibold outline-none"
                  placeholder="E.g. Modest clothing required"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-red-50 p-5 rounded-2xl border border-red-100">
                <label className="block text-sm font-black text-red-900 mb-2 uppercase flex items-center gap-2">
                  <Camera size={16} /> Photography Rules
                </label>
                <textarea
                  value={form.photographyRules || ""}
                  onChange={(e) => updateField("photographyRules", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-red-200 focus:border-red-500 transition-all font-semibold outline-none min-h-[120px] bg-white"
                  placeholder="E.g. Photography is permitted outside, but flash is strictly prohibited inside the main memorial rooms..."
                />
              </div>
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                <label className="block text-sm font-black text-gray-900 mb-2 uppercase flex items-center gap-2">
                  <HeartHandshake size={16} /> Respect Guidelines
                </label>
                <textarea
                  value={form.respectGuidelines || ""}
                  onChange={(e) => updateField("respectGuidelines", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-gray-500 transition-all font-semibold outline-none min-h-[120px] bg-white"
                  placeholder="E.g. Please maintain silence, switch phones to silent mode..."
                />
              </div>
            </div>
          </div>
        )}

        {/* 6. MEDIA */}
        {activeTab === 6 && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
                <ImageIcon className="text-pink-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Media</h3>
                <p className="text-sm text-gray-500 font-semibold">Upload photos, videos, and 360 tours.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Cover Image (Main Photo)</label>
                <div 
                  className="w-full h-48 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-500 hover:border-pink-400 hover:bg-pink-50 cursor-pointer transition-all overflow-hidden relative group"
                  onClick={() => triggerUpload("coverImage")}
                >
                  {form.coverImage ? (
                    <>
                      <img src={form.coverImage} alt="Cover" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold">
                        <Upload size={20} className="mr-2" /> Change Cover
                      </div>
                    </>
                  ) : (
                    <>
                      <ImageIcon size={32} className="mb-2 text-gray-400" />
                      <span className="font-bold">Upload Cover Image</span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-gray-700">Gallery Photos</label>
                  <button 
                    onClick={() => triggerUpload("galleryImages")}
                    className="text-sm font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1 bg-pink-50 px-3 py-1.5 rounded-lg"
                  >
                    <Plus size={16} /> Add Photo
                  </button>
                </div>
                
                {form.galleryImages && form.galleryImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {form.galleryImages.map((img, idx) => (
                      <div key={idx} className="aspect-square rounded-xl overflow-hidden relative group border border-gray-200 shadow-sm">
                        <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => {
                            const newGal = [...form.galleryImages];
                            newGal.splice(idx, 1);
                            updateField("galleryImages", newGal);
                          }}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg transform hover:scale-110"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-gray-50 border border-gray-200 text-center">
                    <p className="text-sm font-semibold text-gray-500">No gallery photos added yet.</p>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">360° Virtual Tour Link</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Link2 size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={form.image360 || ""}
                      onChange={(e) => updateField("image360", e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-500 transition-all font-semibold outline-none"
                      placeholder="https://my.matterport.com/show/..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Documentary / Video Link</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Link2 size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={form.video || ""}
                      onChange={(e) => updateField("video", e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-500 transition-all font-semibold outline-none"
                      placeholder="YouTube / Vimeo link"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
