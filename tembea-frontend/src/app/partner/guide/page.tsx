"use client";

import { useState } from "react";
import {
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Users,
  DollarSign,
  CheckCircle,
  X,
} from "lucide-react";

interface GuideProfile {
  bio: string;
  languages: string[];
  specialties: string[];
  yearsExperience: number;
  certifications: string[];
  availability: string[];
  responseTime: string;
}

interface TourPackage {
  id: number;
  name: string;
  description: string;
  duration: string;
  price: number;
  maxGuests: number;
  includes: string[];
  excludes: string[];
  itinerary: string;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const RESPONSE_TIMES = [
  "within 1 hour",
  "within 2 hours",
  "within 4 hours",
  "same day",
  "within 24 hours",
];

const initialProfile: GuideProfile = {
  bio: "Passionate Rwandan tour guide with over 8 years of experience leading visitors through Rwanda's breathtaking landscapes, rich history, and vibrant culture. I specialise in immersive experiences that connect travellers with local communities.",
  languages: ["English", "French", "Kinyarwanda"],
  specialties: ["Wildlife", "History", "Culture", "Bird Watching"],
  yearsExperience: 8,
  certifications: ["Rwanda Tourism Board Certified", "First Aid Certified"],
  availability: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  responseTime: "within 2 hours",
};

const initialPackages: TourPackage[] = [
  {
    id: 1,
    name: "Kigali City Tour",
    description: "Explore the heart of Rwanda's capital — markets, memorials, and modern landmarks.",
    duration: "3 hours",
    price: 120,
    maxGuests: 8,
    includes: ["Transport", "Water", "Entry Fees"],
    excludes: ["Meals", "Tips"],
    itinerary: "9:00 AM - Kimironko Market, 10:30 AM - Nyamirambo neighbourhood, 12:00 PM - Kigali Heights",
  },
  {
    id: 2,
    name: "Genocide Memorial & History Tour",
    description: "A solemn and educational journey through Rwanda's most significant historical sites.",
    duration: "4 hours",
    price: 80,
    maxGuests: 12,
    includes: ["Transport", "Audio Guide"],
    excludes: ["Meals", "Photography Fees"],
    itinerary: "Kigali Genocide Memorial, Nyamata Church, Ntarama Church",
  },
  {
    id: 3,
    name: "Nyungwe Forest Walk",
    description: "Trek through ancient rainforest, spot chimpanzees, and discover rare bird species.",
    duration: "Full Day",
    price: 200,
    maxGuests: 6,
    includes: ["Transport", "Lunch", "Entry Fees", "Ranger Guide"],
    excludes: ["Optional chimp tracking permit"],
    itinerary: "5:30 AM departure, canopy walk, forest hike, picnic lunch, return by 6 PM",
  },
];

const emptyPackage: Omit<TourPackage, "id"> = {
  name: "",
  description: "",
  duration: "",
  price: 0,
  maxGuests: 8,
  includes: [],
  excludes: [],
  itinerary: "",
};

interface PackageModal {
  open: boolean;
  mode: "add" | "edit";
  pkg: TourPackage | null;
}

function computeCompleteness(profile: GuideProfile): number {
  let score = 0;
  if (profile.bio.trim().length > 20) score += 20;
  if (profile.languages.length > 0) score += 20;
  if (profile.specialties.length > 0) score += 20;
  if (profile.certifications.length > 0) score += 20;
  if (profile.availability.length > 0) score += 20;
  return score;
}

export default function GuidePage() {
  const [profile, setProfile] = useState<GuideProfile>(initialProfile);
  const [packages, setPackages] = useState<TourPackage[]>(initialPackages);
  const [saved, setSaved] = useState(false);

  // New tag input states
  const [newLanguage, setNewLanguage] = useState("");
  const [newSpecialty, setNewSpecialty] = useState("");
  const [newCert, setNewCert] = useState("");

  // Package modal
  const [pkgModal, setPkgModal] = useState<PackageModal>({ open: false, mode: "add", pkg: null });
  const [pkgForm, setPkgForm] = useState<Omit<TourPackage, "id">>(emptyPackage);
  const [includesInput, setIncludesInput] = useState("");
  const [excludesInput, setExcludesInput] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const completeness = computeCompleteness(profile);

  function toggleDay(day: string) {
    setProfile((prev) => ({
      ...prev,
      availability: prev.availability.includes(day)
        ? prev.availability.filter((d) => d !== day)
        : [...prev.availability, day],
    }));
  }

  function removeTag(key: keyof GuideProfile, value: string) {
    setProfile((prev) => ({
      ...prev,
      [key]: (prev[key] as string[]).filter((v) => v !== value),
    }));
  }

  function addTag(key: keyof GuideProfile, value: string, clear: () => void) {
    if (!value.trim()) return;
    setProfile((prev) => ({
      ...prev,
      [key]: [...(prev[key] as string[]), value.trim()],
    }));
    clear();
  }

  function saveProfile() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function openAddPackage() {
    setPkgForm(emptyPackage);
    setIncludesInput("");
    setExcludesInput("");
    setPkgModal({ open: true, mode: "add", pkg: null });
  }

  function openEditPackage(pkg: TourPackage) {
    setPkgForm({ ...pkg });
    setIncludesInput(pkg.includes.join(", "));
    setExcludesInput(pkg.excludes.join(", "));
    setPkgModal({ open: true, mode: "edit", pkg });
  }

  function savePackage() {
    const includes = includesInput.split(",").map((s) => s.trim()).filter(Boolean);
    const excludes = excludesInput.split(",").map((s) => s.trim()).filter(Boolean);
    const data = { ...pkgForm, includes, excludes };

    if (pkgModal.mode === "add") {
      setPackages((prev) => [...prev, { ...data, id: Date.now() }]);
    } else {
      setPackages((prev) =>
        prev.map((p) => (p.id === pkgModal.pkg!.id ? { ...data, id: pkgModal.pkg!.id } : p))
      );
    }
    setPkgModal({ open: false, mode: "add", pkg: null });
  }

  function handleDeletePackage(id: number) {
    if (deleteConfirm === id) {
      setPackages((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D5F5E3]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-[#111827]">Guide Profile</h1>
            <p className="text-[#6B7280] mt-1">Your public guide profile and tour packages</p>
          </div>
          {/* Completeness */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold text-[#6B7280]">Profile Completeness</p>
              <p className="text-lg font-black text-[#145A32]">{completeness}%</p>
            </div>
            <div className="w-16 h-16 relative">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#D5F5E3" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="#2ECC71"
                  strokeWidth="3"
                  strokeDasharray={`${completeness} ${100 - completeness}`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Profile card — 3/5 */}
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D5F5E3] space-y-5">
            <h2 className="font-black text-[#111827] text-lg">Profile Details</h2>

            {/* Bio */}
            <div>
              <label className="block text-sm font-bold text-[#374151] mb-1">Bio</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2.5 rounded-xl border border-[#D5F5E3] focus:outline-none focus:border-[#2ECC71] text-sm resize-none"
              />
            </div>

            {/* Years Experience */}
            <div>
              <label className="block text-sm font-bold text-[#374151] mb-1">Years of Experience</label>
              <input
                type="number"
                value={profile.yearsExperience}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, yearsExperience: Number(e.target.value) }))
                }
                className="w-32 px-3 py-2.5 rounded-xl border border-[#D5F5E3] focus:outline-none focus:border-[#2ECC71] text-sm"
              />
            </div>

            {/* Languages */}
            <div>
              <label className="block text-sm font-bold text-[#374151] mb-2">Languages</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {profile.languages.map((lang) => (
                  <span
                    key={lang}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#D5F5E3] text-[#145A32] text-xs font-bold"
                  >
                    {lang}
                    <button onClick={() => removeTag("languages", lang)}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  placeholder="Add language..."
                  className="flex-1 px-3 py-2 rounded-xl border border-[#D5F5E3] focus:outline-none focus:border-[#2ECC71] text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addTag("languages", newLanguage, () => setNewLanguage(""));
                  }}
                />
                <button
                  onClick={() => addTag("languages", newLanguage, () => setNewLanguage(""))}
                  className="px-3 py-2 rounded-xl bg-[#145A32] text-white text-sm font-bold hover:bg-[#0e3d22] transition"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Specialties */}
            <div>
              <label className="block text-sm font-bold text-[#374151] mb-2">Specialties</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {profile.specialties.map((spec) => (
                  <span
                    key={spec}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f5fbf7] border border-[#D5F5E3] text-[#145A32] text-xs font-bold"
                  >
                    {spec}
                    <button onClick={() => removeTag("specialties", spec)}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  placeholder="Add specialty..."
                  className="flex-1 px-3 py-2 rounded-xl border border-[#D5F5E3] focus:outline-none focus:border-[#2ECC71] text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      addTag("specialties", newSpecialty, () => setNewSpecialty(""));
                  }}
                />
                <button
                  onClick={() => addTag("specialties", newSpecialty, () => setNewSpecialty(""))}
                  className="px-3 py-2 rounded-xl bg-[#145A32] text-white text-sm font-bold hover:bg-[#0e3d22] transition"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Certifications */}
            <div>
              <label className="block text-sm font-bold text-[#374151] mb-2">Certifications</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {profile.certifications.map((cert) => (
                  <span
                    key={cert}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D5F5E3] text-[#145A32] text-xs font-bold"
                  >
                    <CheckCircle size={10} />
                    {cert}
                    <button onClick={() => removeTag("certifications", cert)}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCert}
                  onChange={(e) => setNewCert(e.target.value)}
                  placeholder="Add certification..."
                  className="flex-1 px-3 py-2 rounded-xl border border-[#D5F5E3] focus:outline-none focus:border-[#2ECC71] text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addTag("certifications", newCert, () => setNewCert(""));
                  }}
                />
                <button
                  onClick={() => addTag("certifications", newCert, () => setNewCert(""))}
                  className="px-3 py-2 rounded-xl bg-[#145A32] text-white text-sm font-bold hover:bg-[#0e3d22] transition"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-bold text-[#374151] mb-2">Available Days</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      profile.availability.includes(day)
                        ? "bg-[#145A32] text-white"
                        : "bg-[#f5fbf7] border border-[#D5F5E3] text-[#6B7280]"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Response time */}
            <div>
              <label className="block text-sm font-bold text-[#374151] mb-1">Response Time</label>
              <select
                value={profile.responseTime}
                onChange={(e) => setProfile((prev) => ({ ...prev, responseTime: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-[#D5F5E3] focus:outline-none focus:border-[#2ECC71] text-sm bg-white"
              >
                {RESPONSE_TIMES.map((rt) => (
                  <option key={rt} value={rt}>
                    {rt}
                  </option>
                ))}
              </select>
            </div>

            {/* Save button */}
            <button
              onClick={saveProfile}
              className={`w-full py-3 rounded-xl font-black text-sm transition ${
                saved
                  ? "bg-[#2ECC71] text-white"
                  : "bg-[#145A32] text-white hover:bg-[#0e3d22]"
              }`}
            >
              {saved ? "Profile Saved!" : "Save Profile"}
            </button>
          </div>
        </div>

        {/* Packages — 2/5 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-[#111827] text-lg">Tour Packages</h2>
            <button
              onClick={openAddPackage}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#145A32] text-white font-bold text-sm hover:bg-[#0e3d22] transition"
            >
              <Plus size={14} />
              Add Package
            </button>
          </div>

          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-2xl shadow-sm border border-[#D5F5E3] p-5 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-black text-[#111827]">{pkg.name}</h3>
                <span className="px-2 py-0.5 rounded-full bg-[#D5F5E3] text-[#145A32] text-xs font-bold shrink-0">
                  {pkg.duration}
                </span>
              </div>
              <p className="text-[#6B7280] text-sm line-clamp-2">{pkg.description}</p>

              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 font-black text-[#145A32]">
                  <DollarSign size={14} />
                  ${pkg.price}
                </span>
                <span className="flex items-center gap-1 text-[#6B7280] font-semibold">
                  <Users size={14} />
                  Max {pkg.maxGuests}
                </span>
              </div>

              {pkg.includes.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-[#374151] mb-1">Includes</p>
                  <div className="flex flex-wrap gap-1">
                    {pkg.includes.map((inc) => (
                      <span
                        key={inc}
                        className="px-2 py-0.5 rounded-full bg-[#D5F5E3] text-[#145A32] text-xs font-semibold"
                      >
                        {inc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-[#D5F5E3]">
                <button
                  onClick={() => openEditPackage(pkg)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[#145A32] text-[#145A32] font-bold text-sm hover:bg-[#D5F5E3] transition"
                >
                  <Edit2 size={13} />
                  Edit
                </button>
                <button
                  onClick={() => handleDeletePackage(pkg.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold text-sm transition ${
                    deleteConfirm === pkg.id
                      ? "bg-red-600 text-white"
                      : "border border-red-300 text-red-500 hover:bg-red-50"
                  }`}
                >
                  <Trash2 size={13} />
                  {deleteConfirm === pkg.id ? "Confirm?" : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Package Modal */}
      {pkgModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#D5F5E3]">
              <h2 className="text-xl font-black text-[#111827]">
                {pkgModal.mode === "add" ? "Add Tour Package" : "Edit Package"}
              </h2>
              <button
                onClick={() => setPkgModal({ open: false, mode: "add", pkg: null })}
                className="p-2 rounded-xl hover:bg-[#D5F5E3] transition"
              >
                <X size={18} className="text-[#145A32]" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: "Package Name", key: "name", type: "text" },
                { label: "Duration (e.g. 3 hours, Full Day)", key: "duration", type: "text" },
                { label: "Price ($)", key: "price", type: "number" },
                { label: "Max Guests", key: "maxGuests", type: "number" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-sm font-bold text-[#374151] mb-1">{label}</label>
                  <input
                    type={type}
                    value={(pkgForm as Record<string, unknown>)[key] as string | number}
                    onChange={(e) =>
                      setPkgForm((prev) => ({
                        ...prev,
                        [key]: type === "number" ? Number(e.target.value) : e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D5F5E3] focus:outline-none focus:border-[#2ECC71] text-sm"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-bold text-[#374151] mb-1">Description</label>
                <textarea
                  value={pkgForm.description}
                  onChange={(e) => setPkgForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D5F5E3] focus:outline-none focus:border-[#2ECC71] text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#374151] mb-1">
                  Includes (comma-separated)
                </label>
                <input
                  type="text"
                  value={includesInput}
                  onChange={(e) => setIncludesInput(e.target.value)}
                  placeholder="Transport, Lunch, Entry Fees"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D5F5E3] focus:outline-none focus:border-[#2ECC71] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#374151] mb-1">
                  Excludes (comma-separated)
                </label>
                <input
                  type="text"
                  value={excludesInput}
                  onChange={(e) => setExcludesInput(e.target.value)}
                  placeholder="Tips, Personal Expenses"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D5F5E3] focus:outline-none focus:border-[#2ECC71] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#374151] mb-1">
                  Itinerary
                </label>
                <textarea
                  value={pkgForm.itinerary}
                  onChange={(e) => setPkgForm((prev) => ({ ...prev, itinerary: e.target.value }))}
                  rows={3}
                  placeholder="Describe the schedule..."
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D5F5E3] focus:outline-none focus:border-[#2ECC71] text-sm resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-[#D5F5E3]">
              <button
                onClick={() => setPkgModal({ open: false, mode: "add", pkg: null })}
                className="flex-1 py-2.5 rounded-xl border border-[#D5F5E3] text-[#6B7280] font-bold text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={savePackage}
                className="flex-1 py-2.5 rounded-xl bg-[#145A32] text-white font-bold text-sm hover:bg-[#0e3d22] transition"
              >
                {pkgModal.mode === "add" ? "Add Package" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
