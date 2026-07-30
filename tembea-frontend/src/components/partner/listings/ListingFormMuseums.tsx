"use client";

import { useState, useRef } from "react";
import {
  Upload, Trash2, Plus, PlusCircle, CheckSquare,
  Landmark, Clock, Ticket, Palette, Coffee, Users,
  ImageIcon, Info, MapPin, Globe, Phone, Mail, Link2, FileText, CheckCircle
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MuseumTicket {
  id: string;
  type: string;
  price: number;
}

export interface MuseumExhibition {
  id: string;
  name: string;
  isPermanent: boolean;
  isTemporary: boolean;
  startDate: string;
  endDate: string;
  description: string;
}

export interface MuseumTour {
  id: string;
  guideName: string;
  language: string;
  time: string;
  capacity: number;
  price: number;
}

export interface MuseumFormData {
  // 1. Museum Info
  museumName: string;
  category: string;
  location: string;
  website: string;
  phone: string;
  email: string;

  // 2. Opening Info
  openDays: string[];
  openingHours: string;
  holidayHours: string;
  ticketRequired: boolean;

  // 3. Tickets
  tickets: MuseumTicket[];

  // 4. Exhibitions
  exhibitions: MuseumExhibition[];

  // 5. Collections
  collections: string[];

  // 6. Facilities
  facilities: string[];

  // 7. Guided Tours
  guidedTours: MuseumTour[];

  // 8. Gallery
  coverImage: string;
  galleryImages: string[];
  video: string;
  virtualTour: string;

  // 9. Visitor Info
  averageVisitTime: string;
  bestTimeToVisit: string;
  photographyPolicy: string;
  accessibility: string;
  petsAllowed: boolean;
}

const CATEGORIES = [
  "History", "Art", "Science", "Natural History", "Culture", 
  "Military", "Children", "Technology", "Archaeology"
];

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DEFAULT_TICKET_TYPES = [
  "Adult", "Child", "Student", "Local Resident", "International Visitor", "Family Ticket"
];

const COLLECTIONS = [
  "History", "Traditional Art", "Modern Art", "Photography", "Culture", 
  "Archaeology", "Natural History", "Military", "Technology", 
  "Interactive Displays", "Kids Zone"
];

const FACILITIES = [
  "Cafe", "Restaurant", "Gift Shop", "Parking", "Audio Guide", 
  "Wheelchair Access", "WiFi", "Library", "Conference Hall", 
  "Photography Allowed", "Lockers", "Prayer Room"
];

type Props = {
  data: Partial<MuseumFormData>;
  updateField: (field: string, value: any) => void;
};

export function MuseumForm({ data, updateField }: Props) {
  const [activeTab, setActiveTab] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<string | null>(null);

  const form = data as MuseumFormData;

  const toggleArrayItem = (field: string, item: string) => {
    const current = (form[field as keyof MuseumFormData] as string[]) || [];
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
      
      if (["coverImage", "video"].includes(uploadTarget)) {
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

  // Ticket Handlers
  const addTicket = () => {
    const currentTickets = form.tickets || [];
    updateField("tickets", [
      ...currentTickets,
      { id: Date.now().toString(), type: "", price: 0 }
    ]);
  };
  const updateTicket = (id: string, field: keyof MuseumTicket, value: any) => {
    const currentTickets = form.tickets || [];
    updateField("tickets", currentTickets.map(t => t.id === id ? { ...t, [field]: value } : t));
  };
  const removeTicket = (id: string) => {
    const currentTickets = form.tickets || [];
    updateField("tickets", currentTickets.filter(t => t.id !== id));
  };

  // Exhibition Handlers
  const addExhibition = () => {
    const currentExhibits = form.exhibitions || [];
    updateField("exhibitions", [
      ...currentExhibits,
      { id: Date.now().toString(), name: "", isPermanent: false, isTemporary: false, startDate: "", endDate: "", description: "" }
    ]);
  };
  const updateExhibition = (id: string, field: keyof MuseumExhibition, value: any) => {
    const currentExhibits = form.exhibitions || [];
    updateField("exhibitions", currentExhibits.map(t => t.id === id ? { ...t, [field]: value } : t));
  };
  const removeExhibition = (id: string) => {
    const currentExhibits = form.exhibitions || [];
    updateField("exhibitions", currentExhibits.filter(t => t.id !== id));
  };

  // Tour Handlers
  const addTour = () => {
    const currentTours = form.guidedTours || [];
    updateField("guidedTours", [
      ...currentTours,
      { id: Date.now().toString(), guideName: "", language: "", time: "", capacity: 0, price: 0 }
    ]);
  };
  const updateTour = (id: string, field: keyof MuseumTour, value: any) => {
    const currentTours = form.guidedTours || [];
    updateField("guidedTours", currentTours.map(t => t.id === id ? { ...t, [field]: value } : t));
  };
  const removeTour = (id: string) => {
    const currentTours = form.guidedTours || [];
    updateField("guidedTours", currentTours.filter(t => t.id !== id));
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border-2 border-rose-100 overflow-hidden">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept={uploadTarget === 'video' ? "video/*" : "image/*"}
        onChange={handleFileUpload} 
      />

      <div className="flex border-b border-gray-200 overflow-x-auto">
        {[
          { id: 1, label: "Info", icon: Landmark },
          { id: 2, label: "Opening", icon: Clock },
          { id: 3, label: "Tickets", icon: Ticket },
          { id: 4, label: "Exhibits", icon: Palette },
          { id: 5, label: "Facilities", icon: Coffee },
          { id: 6, label: "Tours", icon: Users },
          { id: 7, label: "Media & Visitor", icon: ImageIcon }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-bold text-sm border-b-4 transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? "border-rose-600 text-rose-700 bg-rose-50/50" 
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
        {/* 1. MUSEUM INFO */}
        {activeTab === 1 && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center">
                <Landmark className="text-rose-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Museum Information</h3>
                <p className="text-sm text-gray-500 font-semibold">Basic details and contact information.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Museum Name</label>
                <input
                  type="text"
                  value={form.museumName || ""}
                  onChange={(e) => updateField("museumName", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-rose-500 transition-all font-semibold outline-none text-lg"
                  placeholder="E.g. Rwanda Art Museum"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                <select
                  value={form.category || ""}
                  onChange={(e) => updateField("category", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-rose-500 transition-all font-semibold outline-none bg-white"
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Location</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={form.location || ""}
                    onChange={(e) => updateField("location", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-rose-500 transition-all font-semibold outline-none"
                    placeholder="E.g. Kanombe, Kigali"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Website</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={form.website || ""}
                    onChange={(e) => updateField("website", e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-lg border-2 border-gray-200 focus:border-rose-500 transition-all font-semibold outline-none text-sm"
                    placeholder="www.example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Phone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={form.phone || ""}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-lg border-2 border-gray-200 focus:border-rose-500 transition-all font-semibold outline-none text-sm"
                    placeholder="+250..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={form.email || ""}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-lg border-2 border-gray-200 focus:border-rose-500 transition-all font-semibold outline-none text-sm"
                    placeholder="info@museum.rw"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. OPENING INFO */}
        {activeTab === 2 && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <Clock className="text-orange-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Opening Information</h3>
                <p className="text-sm text-gray-500 font-semibold">When is the museum open to the public?</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Open Days</label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map(day => {
                  const isSelected = (form.openDays || []).includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleArrayItem("openDays", day)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-colors ${
                        isSelected ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Standard Opening Hours</label>
                <input
                  type="text"
                  value={form.openingHours || ""}
                  onChange={(e) => updateField("openingHours", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 transition-all font-semibold outline-none"
                  placeholder="E.g. 09:00 AM - 06:00 PM"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Holiday Hours / Exceptions</label>
                <input
                  type="text"
                  value={form.holidayHours || ""}
                  onChange={(e) => updateField("holidayHours", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 transition-all font-semibold outline-none"
                  placeholder="E.g. Closed on National Heroes Day"
                />
              </div>
            </div>

            <div className="pt-4">
              <label className="flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all border-gray-200 bg-white hover:border-orange-200 w-fit" onClick={() => updateField('ticketRequired', !form.ticketRequired)}>
                <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors shrink-0 ${
                  form.ticketRequired ? "bg-orange-500 border-orange-500 text-white" : "border-gray-300"
                }`}>
                  {form.ticketRequired && <CheckSquare size={16} />}
                </div>
                <span className="font-bold text-gray-900">Tickets Required for Entry</span>
              </label>
            </div>
          </div>
        )}

        {/* 3. TICKETS */}
        {activeTab === 3 && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Ticket className="text-green-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-gray-900">Tickets</h3>
                <p className="text-sm text-gray-500 font-semibold">Configure ticket types and pricing.</p>
              </div>
              <button 
                onClick={addTicket}
                className="px-4 py-2 bg-green-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-green-700 transition-colors shadow-md"
              >
                <PlusCircle size={18} /> Add Ticket
              </button>
            </div>

            {(!form.tickets || form.tickets.length === 0) ? (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                <Ticket size={48} className="text-gray-300 mb-4" />
                <h4 className="text-lg font-black text-gray-800 mb-1">No Tickets Configured</h4>
                <p className="text-gray-500 font-semibold mb-4">Set up admission prices for different categories.</p>
                <button onClick={addTicket} className="px-6 py-2.5 bg-white border-2 border-gray-200 hover:border-green-500 text-gray-700 font-bold rounded-xl transition-all">
                  Add First Ticket
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {form.tickets.map((ticket, index) => (
                  <div key={ticket.id} className="p-4 rounded-2xl border-2 border-gray-200 bg-white relative group hover:border-green-300 transition-all">
                    <button 
                      onClick={() => removeTicket(ticket.id)}
                      className="absolute top-2 right-2 text-red-400 hover:text-red-600 p-1 bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                    
                    <div className="mb-3">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ticket Type</label>
                      <input
                        type="text"
                        value={ticket.type}
                        onChange={(e) => updateTicket(ticket.id, "type", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-green-500 font-bold outline-none text-gray-900"
                        placeholder="e.g. Adult"
                        list="ticket-types"
                      />
                      <datalist id="ticket-types">
                        {DEFAULT_TICKET_TYPES.map(t => <option key={t} value={t} />)}
                      </datalist>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 font-bold">$</span>
                        </div>
                        <input
                          type="number"
                          value={ticket.price}
                          onChange={(e) => updateTicket(ticket.id, "price", Number(e.target.value))}
                          className="w-full pl-8 pr-3 py-2 rounded-lg border-2 border-green-200 focus:border-green-500 font-black outline-none text-green-700 text-lg"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. EXHIBITIONS & COLLECTIONS */}
        {activeTab === 4 && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Palette className="text-purple-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-gray-900">Exhibitions</h3>
                <p className="text-sm text-gray-500 font-semibold">Manage permanent and temporary exhibits.</p>
              </div>
              <button 
                onClick={addExhibition}
                className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-purple-700 transition-colors shadow-md"
              >
                <PlusCircle size={18} /> Add Exhibit
              </button>
            </div>

            {(!form.exhibitions || form.exhibitions.length === 0) ? (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center mb-8">
                <Palette size={40} className="text-gray-300 mb-3" />
                <h4 className="font-black text-gray-800 mb-1">No Exhibitions Added</h4>
                <button onClick={addExhibition} className="px-5 py-2 mt-3 bg-white border border-gray-200 hover:border-purple-500 text-gray-700 font-bold rounded-xl transition-all text-sm">
                  Add Exhibition
                </button>
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                {form.exhibitions.map((exhibit, index) => (
                  <div key={exhibit.id} className="p-5 rounded-2xl border-2 border-gray-200 bg-white relative group">
                    <button 
                      onClick={() => removeExhibition(exhibit.id)}
                      className="absolute top-4 right-4 text-red-400 hover:text-red-600 p-1 bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={18} />
                    </button>
                    
                    <h4 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center text-xs">{index + 1}</span>
                      Exhibition Details
                    </h4>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Exhibition Name</label>
                        <input
                          type="text"
                          value={exhibit.name}
                          onChange={(e) => updateExhibition(exhibit.id, "name", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-500 font-semibold outline-none text-lg"
                          placeholder="e.g. Ancient Rwanda"
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer mt-5">
                          <input type="checkbox" checked={exhibit.isPermanent} onChange={(e) => updateExhibition(exhibit.id, "isPermanent", e.target.checked)} className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500" />
                          <span className="text-sm font-bold text-gray-700">Permanent</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer mt-5">
                          <input type="checkbox" checked={exhibit.isTemporary} onChange={(e) => updateExhibition(exhibit.id, "isTemporary", e.target.checked)} className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500" />
                          <span className="text-sm font-bold text-gray-700">Temporary</span>
                        </label>
                      </div>
                    </div>

                    {exhibit.isTemporary && (
                      <div className="grid md:grid-cols-2 gap-4 mb-4 bg-purple-50 p-3 rounded-xl border border-purple-100">
                        <div>
                          <label className="block text-xs font-bold text-purple-800 uppercase mb-1">Start Date</label>
                          <input type="date" value={exhibit.startDate} onChange={(e) => updateExhibition(exhibit.id, "startDate", e.target.value)} className="w-full px-3 py-1.5 rounded border border-purple-200 outline-none text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-purple-800 uppercase mb-1">End Date</label>
                          <input type="date" value={exhibit.endDate} onChange={(e) => updateExhibition(exhibit.id, "endDate", e.target.value)} className="w-full px-3 py-1.5 rounded border border-purple-200 outline-none text-sm" />
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                      <textarea
                        value={exhibit.description}
                        onChange={(e) => updateExhibition(exhibit.id, "description", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-500 font-semibold outline-none min-h-[80px] text-sm"
                        placeholder="Brief overview of the exhibition..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-6 border-t border-gray-100">
              <h4 className="text-sm font-black text-gray-900 mb-3 uppercase tracking-wider">Collections Focus</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {COLLECTIONS.map(collection => {
                  const isSelected = (form.collections || []).includes(collection);
                  return (
                    <label key={collection} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected ? "border-purple-500 bg-purple-50" : "border-gray-200 bg-white hover:border-purple-200"
                    }`} onClick={() => toggleArrayItem("collections", collection)}>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-purple-600 border-purple-600 text-white" : "border-gray-300"
                      }`}>
                        {isSelected && <CheckSquare size={14} />}
                      </div>
                      <span className={`text-sm font-bold ${isSelected ? "text-purple-900" : "text-gray-700"}`}>{collection}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 5. FACILITIES & 6. TOURS */}
        {activeTab === 5 && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Coffee className="text-amber-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Museum Facilities</h3>
                <p className="text-sm text-gray-500 font-semibold">Select available amenities for visitors.</p>
              </div>
            </div>

            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {FACILITIES.map(facility => {
                  const isSelected = (form.facilities || []).includes(facility);
                  return (
                    <label key={facility} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected ? "border-amber-500 bg-amber-50" : "border-gray-200 bg-white hover:border-amber-200"
                    }`} onClick={() => toggleArrayItem("facilities", facility)}>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-amber-600 border-amber-600 text-white" : "border-gray-300"
                      }`}>
                        {isSelected && <CheckSquare size={14} />}
                      </div>
                      <span className={`text-sm font-bold ${isSelected ? "text-amber-900" : "text-gray-700"}`}>{facility}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 6 && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-gray-900">Guided Tours</h3>
                <p className="text-sm text-gray-500 font-semibold">Offer guided tours to your visitors.</p>
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
                <h4 className="text-lg font-black text-gray-800 mb-1">No Tours Added</h4>
                <p className="text-gray-500 font-semibold mb-4">Add specific tours available at the museum.</p>
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
                      Tour Details
                    </h4>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div className="lg:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Guide/Tour Name</label>
                        <input
                          type="text"
                          value={tour.guideName}
                          onChange={(e) => updateTour(tour.id, "guideName", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 font-semibold outline-none text-sm"
                          placeholder="e.g. History Walk"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Language</label>
                        <input
                          type="text"
                          value={tour.language}
                          onChange={(e) => updateTour(tour.id, "language", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 font-semibold outline-none text-sm"
                          placeholder="e.g. EN, FR"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Time/Schedule</label>
                        <input
                          type="text"
                          value={tour.time}
                          onChange={(e) => updateTour(tour.id, "time", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 font-semibold outline-none text-sm"
                          placeholder="e.g. 10:00 AM"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Capacity</label>
                        <input
                          type="number"
                          value={tour.capacity}
                          onChange={(e) => updateTour(tour.id, "capacity", Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 font-semibold outline-none text-sm"
                          placeholder="Max ppl"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <label className="text-sm font-bold text-gray-700">Tour Price (If not included)</label>
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

        {/* 7. MEDIA & VISITOR INFO */}
        {activeTab === 7 && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
                <ImageIcon className="text-pink-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Media & Visitor Information</h3>
                <p className="text-sm text-gray-500 font-semibold">Visuals and essential tips for visitors.</p>
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
                  <label className="block text-sm font-bold text-gray-700 mb-2">Virtual Tour (URL)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Link2 size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={form.virtualTour || ""}
                      onChange={(e) => updateField("virtualTour", e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-500 transition-all font-semibold outline-none"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Promotional Video</label>
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

            <div className="pt-8 border-t border-gray-100 space-y-6">
              <h4 className="font-black text-gray-900 uppercase tracking-wide">Visitor Information</h4>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Average Visit Time</label>
                  <input
                    type="text"
                    value={form.averageVisitTime || ""}
                    onChange={(e) => updateField("averageVisitTime", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-500 transition-all font-semibold outline-none"
                    placeholder="E.g. 2-3 Hours"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Best Time to Visit</label>
                  <input
                    type="text"
                    value={form.bestTimeToVisit || ""}
                    onChange={(e) => updateField("bestTimeToVisit", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-500 transition-all font-semibold outline-none"
                    placeholder="E.g. Early Morning"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Photography Policy</label>
                  <input
                    type="text"
                    value={form.photographyPolicy || ""}
                    onChange={(e) => updateField("photographyPolicy", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-500 transition-all font-semibold outline-none"
                    placeholder="E.g. No Flash Photography"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Accessibility Info</label>
                  <input
                    type="text"
                    value={form.accessibility || ""}
                    onChange={(e) => updateField("accessibility", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-500 transition-all font-semibold outline-none"
                    placeholder="E.g. Elevators and ramps available"
                  />
                </div>
              </div>
              
              <div>
                <label className="flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all border-gray-200 bg-white hover:border-pink-200 w-fit" onClick={() => updateField('petsAllowed', !form.petsAllowed)}>
                  <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors shrink-0 ${
                    form.petsAllowed ? "bg-pink-600 border-pink-600 text-white" : "border-gray-300"
                  }`}>
                    {form.petsAllowed && <CheckSquare size={16} />}
                  </div>
                  <span className="font-bold text-gray-900">Pets Allowed</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
