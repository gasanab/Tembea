"use client";

import { useState, useRef } from "react";
import {
  Plus, Trash2, X, Upload, MapPin, Star, Calendar,
  Clock, Globe, Users, ChevronDown, ChevronUp,
  CheckCircle, Circle, AlertCircle, Compass, Image as ImageIcon,
  Video, FileText, CheckSquare, List, Map, Navigation, Shield, Activity,
  Briefcase, GraduationCap, UserRound, DollarSign
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GuideScheduleDay {
  day: string;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
}

export interface GuideFormData {
  // 1. Guide Profile
  profilePhoto: string;
  fullName: string;
  displayName: string;
  gender: string;
  age: string;
  yearsOfExperience: number;
  location: string;
  nationality: string;
  languages: string[];
  contactPhone: string;
  email: string;
  shortIntroduction: string;

  // 2. Professional Info
  licenseNumber: string;
  certifications: string[];
  tourGuideAssociation: string;
  firstAidCertified: boolean;
  driversLicense: boolean;
  insurance: boolean;
  certificates: string[];

  // 3. Specializations
  specializations: string[];

  // 4. Availability
  weeklySchedule: GuideScheduleDay[];
  vacationDates: string[];
  unavailableDates: string[];
  maxToursPerDay: number;
  advanceBookingNotice: string;

  // 5. Pricing
  pricingModel: string;
  pricePerDay: number;
  currency: string;
  additionalHourPrice: number;

  // 6. Included
  included: string[];

  // 7. Not Included
  notIncluded: string;

  // 8. Gallery
  coverImage: string;
  galleryImages: string[];
  promoVideo: string;

  // 9. SEO
  searchTags: string[];
  keywords: string;
}

const LANGUAGES = [
  "English", "French", "Kinyarwanda", "Swahili", "German", "Spanish", "Italian", "Chinese", "Japanese"
];

const SPECIALIZATIONS = [
  "Gorilla Trekking", "Kigali City Tour", "Cultural Tours", "Bird Watching", 
  "Hiking", "Nature Walks", "Photography Tours", "Coffee Tours", 
  "Food Tours", "Historical Tours", "Cycling", "Adventure Tours", "Luxury Tours"
];

const INCLUDED_OPTIONS = [
  "Transport", "Meals", "Bottled Water", "Entrance Fees", 
  "Hotel Pickup", "Insurance", "Equipment", "Photography"
];

const PRICING_MODELS = [
  "Per Person", "Per Group", "Half Day", "Full Day", "Custom Quote"
];

const INITIAL_SCHEDULE: GuideScheduleDay[] = [
  { day: "Monday", isAvailable: true, startTime: "08:00", endTime: "18:00" },
  { day: "Tuesday", isAvailable: true, startTime: "08:00", endTime: "18:00" },
  { day: "Wednesday", isAvailable: true, startTime: "08:00", endTime: "18:00" },
  { day: "Thursday", isAvailable: true, startTime: "08:00", endTime: "18:00" },
  { day: "Friday", isAvailable: true, startTime: "08:00", endTime: "18:00" },
  { day: "Saturday", isAvailable: true, startTime: "08:00", endTime: "18:00" },
  { day: "Sunday", isAvailable: false, startTime: "08:00", endTime: "18:00" },
];

type Props = {
  data: Partial<GuideFormData>;
  updateField: (field: string, value: any) => void;
};

export function GuideForm({ data, updateField }: Props) {
  const [activeTab, setActiveTab] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<string | null>(null);

  const form = data as GuideFormData;

  const toggleArrayItem = (field: string, item: string) => {
    const current = (form[field as keyof GuideFormData] as string[]) || [];
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
      
      if (["profilePhoto", "coverImage", "promoVideo"].includes(uploadTarget)) {
        updateField(uploadTarget, fakeUrl);
      } else if (uploadTarget === "galleryImages") {
        const current = form.galleryImages || [];
        updateField("galleryImages", [...current, fakeUrl]);
      } else if (uploadTarget === "certificates") {
        const current = form.certificates || [];
        updateField("certificates", [...current, fakeUrl]);
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

  return (
    <div className="bg-white rounded-3xl shadow-xl border-2 border-emerald-100 overflow-hidden">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept={uploadTarget === 'promoVideo' ? "video/*" : uploadTarget === 'certificates' ? ".pdf,image/*" : "image/*"}
        onChange={handleFileUpload} 
      />

      <div className="flex border-b border-gray-200 overflow-x-auto">
        {[
          { id: 1, label: "Profile", icon: UserRound },
          { id: 2, label: "Professional", icon: Briefcase },
          { id: 3, label: "Specializations", icon: Compass },
          { id: 4, label: "Availability", icon: Calendar },
          { id: 5, label: "Pricing", icon: CreditCard },
          { id: 6, label: "Media & SEO", icon: ImageIcon }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
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

      <div className="p-8">
        {activeTab === 1 && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <UserRound className="text-emerald-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Guide Profile</h3>
                <p className="text-sm text-gray-500 font-semibold">Your basic personal information.</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="shrink-0">
                <div 
                  className="w-32 h-32 rounded-full border-4 border-emerald-100 bg-gray-50 overflow-hidden relative cursor-pointer group"
                  onClick={() => triggerUpload("profilePhoto")}
                >
                  {form.profilePhoto ? (
                    <img src={form.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <ImageIcon size={32} />
                      <span className="text-[10px] font-bold mt-1 uppercase">Upload</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload size={24} />
                    <span className="text-xs font-bold mt-1">Change</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={form.fullName || ""}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all font-semibold outline-none"
                    placeholder="E.g. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={form.displayName || ""}
                    onChange={(e) => updateField("displayName", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all font-semibold outline-none"
                    placeholder="E.g. John (Guide)"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Gender</label>
                <select
                  value={form.gender || ""}
                  onChange={(e) => updateField("gender", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all font-semibold outline-none bg-white"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Age (Optional)</label>
                <input
                  type="number"
                  value={form.age || ""}
                  onChange={(e) => updateField("age", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all font-semibold outline-none"
                  placeholder="E.g. 30"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Years of Experience</label>
                <input
                  type="number"
                  value={form.yearsOfExperience || ""}
                  onChange={(e) => updateField("yearsOfExperience", Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all font-semibold outline-none"
                  placeholder="E.g. 5"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={form.location || ""}
                  onChange={(e) => updateField("location", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all font-semibold outline-none"
                  placeholder="E.g. Kigali, Rwanda"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nationality</label>
                <input
                  type="text"
                  value={form.nationality || ""}
                  onChange={(e) => updateField("nationality", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all font-semibold outline-none"
                  placeholder="E.g. Rwandan"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Languages Spoken</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {LANGUAGES.map((lang) => {
                  const isSelected = (form.languages || []).includes(lang);
                  return (
                    <label key={lang} className="flex items-center gap-2 cursor-pointer group" onClick={() => toggleArrayItem("languages", lang)}>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        isSelected ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-300 group-hover:border-emerald-500"
                      }`}>
                        {isSelected && <CheckSquare size={14} />}
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{lang}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={form.contactPhone || ""}
                  onChange={(e) => updateField("contactPhone", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all font-semibold outline-none"
                  placeholder="+250 780 000 000"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email || ""}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all font-semibold outline-none"
                  placeholder="user@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Short Introduction (max 150 words)</label>
              <textarea
                value={form.shortIntroduction || ""}
                onChange={(e) => updateField("shortIntroduction", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all font-semibold outline-none min-h-[120px]"
                placeholder="Hi, I'm John! I have been guiding tours in Rwanda for 5 years..."
              />
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Briefcase className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Professional Information</h3>
                <p className="text-sm text-gray-500 font-semibold">Your licenses, certifications, and affiliations.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">License Number (Optional)</label>
                <input
                  type="text"
                  value={form.licenseNumber || ""}
                  onChange={(e) => updateField("licenseNumber", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-semibold outline-none"
                  placeholder="e.g., RDB-TG-2023-104"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Tour Guide Association</label>
                <input
                  type="text"
                  value={form.tourGuideAssociation || ""}
                  onChange={(e) => updateField("tourGuideAssociation", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-semibold outline-none"
                  placeholder="e.g., Rwanda Safari Guides Association"
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 space-y-4">
              <h4 className="text-sm font-black text-gray-800 uppercase tracking-wider mb-2">Qualifications & Compliance</h4>
              
              <label className="flex items-center justify-between cursor-pointer p-4 rounded-xl bg-white border border-gray-200 hover:border-blue-300 transition-all" onClick={() => updateField('firstAidCertified', !form.firstAidCertified)}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-100 text-red-600"><Activity size={20} /></div>
                  <div>
                    <div className="font-bold text-gray-900">First Aid Certified</div>
                    <div className="text-xs text-gray-500 font-semibold">Holds a valid first aid / CPR certificate</div>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors flex items-center p-1 ${form.firstAidCertified ? 'bg-blue-500' : 'bg-gray-300'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${form.firstAidCertified ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer p-4 rounded-xl bg-white border border-gray-200 hover:border-blue-300 transition-all" onClick={() => updateField('driversLicense', !form.driversLicense)}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100 text-orange-600"><Compass size={20} /></div>
                  <div>
                    <div className="font-bold text-gray-900">Driver's License</div>
                    <div className="text-xs text-gray-500 font-semibold">Valid driving license for tour vehicles</div>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors flex items-center p-1 ${form.driversLicense ? 'bg-blue-500' : 'bg-gray-300'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${form.driversLicense ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer p-4 rounded-xl bg-white border border-gray-200 hover:border-blue-300 transition-all" onClick={() => updateField('insurance', !form.insurance)}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-600"><Shield size={20} /></div>
                  <div>
                    <div className="font-bold text-gray-900">Professional Liability Insurance</div>
                    <div className="text-xs text-gray-500 font-semibold">Covered for professional guiding activities</div>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors flex items-center p-1 ${form.insurance ? 'bg-blue-500' : 'bg-gray-300'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${form.insurance ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </label>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-bold text-gray-700">Upload Certificates & Licenses</label>
                <button 
                  onClick={() => triggerUpload("certificates")}
                  className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg"
                >
                  <Upload size={16} /> Add Certificate
                </button>
              </div>
              
              {form.certificates && form.certificates.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {form.certificates.map((cert, idx) => (
                    <div key={idx} className="relative group rounded-xl border border-gray-200 bg-gray-50 aspect-square flex flex-col items-center justify-center p-4">
                      <FileText size={32} className="text-blue-400 mb-2" />
                      <span className="text-xs font-bold text-center text-gray-600 truncate w-full">Certificate {idx+1}</span>
                      <button 
                        onClick={() => {
                          const newCerts = [...form.certificates];
                          newCerts.splice(idx, 1);
                          updateField("certificates", newCerts);
                        }}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div 
                  className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-blue-400 cursor-pointer transition-all"
                  onClick={() => triggerUpload("certificates")}
                >
                  <Upload size={32} className="mb-2 text-gray-400" />
                  <p className="font-bold">Click to upload documents</p>
                  <p className="text-sm font-semibold mt-1">PDF, JPG, PNG (Max 5MB)</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 3 && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <Compass className="text-orange-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Tour Specializations</h3>
                <p className="text-sm text-gray-500 font-semibold">Select the types of tours you specialize in.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {SPECIALIZATIONS.map((spec) => {
                const isSelected = (form.specializations || []).includes(spec);
                return (
                  <label 
                    key={spec} 
                    onClick={() => toggleArrayItem("specializations", spec)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected ? "border-orange-500 bg-orange-50" : "border-gray-200 bg-white hover:border-orange-200"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors shrink-0 ${
                      isSelected ? "bg-orange-500 border-orange-500 text-white" : "border-gray-300"
                    }`}>
                      {isSelected && <CheckSquare size={16} />}
                    </div>
                    <span className={`font-bold ${isSelected ? "text-orange-900" : "text-gray-700"}`}>
                      {spec}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 4 && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Calendar className="text-purple-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Availability</h3>
                <p className="text-sm text-gray-500 font-semibold">Set your working hours and available days.</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">Weekly Schedule</h4>
              <div className="space-y-3">
                {(form.weeklySchedule || INITIAL_SCHEDULE).map((dayObj, idx) => (
                  <div key={dayObj.day} className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
                    <label className="flex items-center gap-3 w-32 cursor-pointer" onClick={() => {
                             const newSched = [...(form.weeklySchedule || INITIAL_SCHEDULE)];
                             newSched[idx] = { ...newSched[idx], isAvailable: !newSched[idx].isAvailable };
                             updateField('weeklySchedule', newSched);
                           }}>
                      <div className={`w-10 h-5 rounded-full transition-colors flex items-center p-1 shrink-0 ${dayObj.isAvailable ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                        <div className={`w-3 h-3 rounded-full bg-white transition-transform ${dayObj.isAvailable ? 'translate-x-5' : 'translate-x-0'}`} />
                      </div>
                      <span className={`font-bold ${dayObj.isAvailable ? 'text-gray-900' : 'text-gray-400'}`}>{dayObj.day}</span>
                    </label>
                    
                    {dayObj.isAvailable ? (
                      <div className="flex items-center gap-3 flex-1">
                        <input 
                          type="time" 
                          value={dayObj.startTime}
                          onChange={(e) => {
                             const newSched = [...(form.weeklySchedule || INITIAL_SCHEDULE)];
                             newSched[idx] = { ...newSched[idx], startTime: e.target.value };
                             updateField('weeklySchedule', newSched);
                          }}
                          className="px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-purple-500 text-sm font-semibold"
                        />
                        <span className="text-gray-400 font-bold">to</span>
                        <input 
                          type="time" 
                          value={dayObj.endTime}
                          onChange={(e) => {
                             const newSched = [...(form.weeklySchedule || INITIAL_SCHEDULE)];
                             newSched[idx] = { ...newSched[idx], endTime: e.target.value };
                             updateField('weeklySchedule', newSched);
                          }}
                          className="px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-purple-500 text-sm font-semibold"
                        />
                      </div>
                    ) : (
                      <div className="text-sm font-semibold text-gray-400 flex-1">Unavailable</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Maximum Tours per Day</label>
                <input
                  type="number"
                  value={form.maxToursPerDay || 1}
                  onChange={(e) => updateField("maxToursPerDay", Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all font-semibold outline-none"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Advance Booking Notice</label>
                <select
                  value={form.advanceBookingNotice || ""}
                  onChange={(e) => updateField("advanceBookingNotice", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all font-semibold outline-none bg-white"
                >
                  <option value="">Select an option</option>
                  <option value="Same Day">Same Day</option>
                  <option value="1 Day Notice">1 Day Notice</option>
                  <option value="2 Days Notice">2 Days Notice</option>
                  <option value="1 Week Notice">1 Week Notice</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 5 && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <CreditCard className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Pricing & Packages</h3>
                <p className="text-sm text-gray-500 font-semibold">Set your rates and what is included in your service.</p>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-2xl border border-green-200 mb-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Pricing Model</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRICING_MODELS.map(model => (
                      <label key={model} className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-colors text-sm font-bold ${
                        form.pricingModel === model ? 'border-green-500 bg-white text-green-700 shadow-sm' : 'border-transparent bg-green-100/50 text-gray-600 hover:bg-green-100'
                      }`} onClick={() => updateField('pricingModel', model)}>
                        {model}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Base Price</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-gray-500 font-bold">$</span>
                      </div>
                      <input
                        type="number"
                        value={form.pricePerDay || ""}
                        onChange={(e) => updateField("pricePerDay", Number(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all font-black text-lg outline-none"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Additional Hour Price (Optional)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-gray-500 font-bold">$</span>
                      </div>
                      <input
                        type="number"
                        value={form.additionalHourPrice || ""}
                        onChange={(e) => updateField("additionalHourPrice", Number(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-white bg-white/50 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all font-semibold outline-none"
                        placeholder="0.00 / hr"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-sm font-black text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-500" /> What's Included
                </h4>
                <div className="space-y-2">
                  {INCLUDED_OPTIONS.map((opt) => {
                    const isSelected = (form.included || []).includes(opt);
                    return (
                      <label key={opt} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200 hover:border-emerald-200'
                      }`} onClick={() => toggleArrayItem("included", opt)}>
                        <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-emerald-500 text-white' : 'border-2 border-gray-300'
                        }`}>
                          {isSelected && <CheckSquare size={14} />}
                        </div>
                        <span className={`font-bold text-sm ${isSelected ? 'text-emerald-900' : 'text-gray-600'}`}>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-black text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <X size={16} className="text-red-500" /> What's NOT Included
                </h4>
                <textarea
                  value={form.notIncluded || ""}
                  onChange={(e) => updateField("notIncluded", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-400 focus:ring-4 focus:ring-red-50 transition-all font-semibold outline-none min-h-[250px]"
                  placeholder="E.g.&#10;- Flights&#10;- Visa fees&#10;- Personal shopping&#10;- Tips&#10;- Alcohol"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 6 && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
                <ImageIcon className="text-pink-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Media & SEO</h3>
                <p className="text-sm text-gray-500 font-semibold">Upload photos and optimize for search.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Cover Image</label>
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

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Introduction Video (Optional)</label>
                <div 
                  className="w-full h-32 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-500 hover:border-pink-400 hover:bg-pink-50 cursor-pointer transition-all relative overflow-hidden"
                  onClick={() => triggerUpload("promoVideo")}
                >
                  {form.promoVideo ? (
                    <div className="flex items-center gap-3 text-pink-700 font-bold bg-pink-100 px-6 py-3 rounded-xl z-10 shadow-sm">
                      <Video size={24} /> Video Uploaded (Click to change)
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Video size={32} className="mb-2 text-gray-400" />
                      <span className="font-bold">Upload Promo Video</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Keywords (Comma separated)</label>
                <input
                  type="text"
                  value={form.keywords || ""}
                  onChange={(e) => updateField("keywords", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all font-semibold outline-none"
                  placeholder="e.g. Kigali, Gorilla Trekking, Expert Guide, French Speaking"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CreditCard(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}
