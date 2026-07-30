"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Heart,
  Languages,
  Loader2,
  MapPinned,
  ShieldCheck,
  UserCircle,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/context/AuthContext";
import { usersApi } from "@/lib/api-client";
import type { UpdateUserInput } from "@/types/api.types";

const interestOptions = [
  { id: "accommodation", label: "Accommodation" },
  { id: "tours", label: "Tours & safaris" },
  { id: "events", label: "Events" },
  { id: "restaurants", label: "Food & restaurants" },
  { id: "transport", label: "Transport" },
  { id: "marketplace", label: "Made in Rwanda" },
  { id: "parks", label: "National parks" },
];

const languageLabels: Record<string, string> = {
  en: "English",
  rw: "Kinyarwanda",
  fr: "French",
};

const initialForm = {
  name: "",
  phone: "",
  avatar: "",
  language: "en",
  region: "",
  interests: [] as string[],
};

function isValidAvatarUrl(value: string) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function ProfilePage() {
  const { user, partner, updateUser } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name ?? "",
      phone: user.phone ?? "",
      avatar: user.avatar ?? "",
      language: user.language ?? "en",
      region: user.region ?? "",
      interests: user.interests ?? [],
    });
  }, [user]);

  const dashboardHref =
    user?.role === "ADMIN" ? "/admin" : user?.role === "PARTNER" ? "/partner" : "/client";

  const initials = useMemo(
    () =>
      (form.name || user?.email || "T")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join(""),
    [form.name, user?.email],
  );

  const toggleInterest = (interest: string) => {
    setSuccess("");
    setForm((current) => ({
      ...current,
      interests: current.interests.includes(interest)
        ? current.interests.filter((item) => item !== interest)
        : [...current.interests, interest],
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const name = form.name.trim();
    const phone = form.phone.trim();
    const avatar = form.avatar.trim();
    if (name.length < 2) {
      setError("Enter a name with at least two characters.");
      return;
    }
    if (phone && !/^\+?[0-9 ()-]{7,24}$/.test(phone)) {
      setError("Enter a valid phone number using digits, spaces, +, - or parentheses.");
      return;
    }
    if (!isValidAvatarUrl(avatar)) {
      setError("Avatar URL must be a valid https address.");
      return;
    }

    const payload: UpdateUserInput = {
      name,
      phone,
      language: form.language,
      region: form.region,
      interests: form.interests,
      ...(avatar ? { avatar } : {}),
    };

    setIsSaving(true);
    try {
      const updated = await usersApi.updateMe(payload);
      updateUser(updated);
      setSuccess("Your profile has been saved.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "We could not save your profile. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <RoleGuard>
      <main className="section-pad tourism-surface">
        <div className="tembea-container grid gap-5 lg:grid-cols-[1fr_340px]">
          <form
            className="dashboard-card stack-lg p-6"
            noValidate
            onSubmit={handleSubmit}
          >
            <div className="between flex-wrap gap-4">
              <div>
                <p className="section-kicker">Account</p>
                <h1 className="text-4xl font-black">Your profile</h1>
                <p className="mt-2 text-muted">
                  Keep your contact details and travel preferences current.
                </p>
              </div>
              <div
                aria-label={`Profile initials ${initials}`}
                className="centered h-16 w-16 rounded-2xl bg-tembea-light text-xl font-black text-tembea-dark"
              >
                {initials}
              </div>
            </div>

            {error && (
              <div
                className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700"
                role="alert"
              >
                {error}
              </div>
            )}
            {success && (
              <div
                className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700"
                role="status"
              >
                <CheckCircle2 size={17} aria-hidden />
                {success}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-extrabold text-tembea-dark">Full name</span>
                <input
                  autoComplete="name"
                  className="field-control"
                  maxLength={100}
                  onChange={(event) => {
                    setSuccess("");
                    setForm((current) => ({ ...current, name: event.target.value }));
                  }}
                  required
                  value={form.name}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-extrabold text-tembea-dark">Email</span>
                <input
                  autoComplete="email"
                  className="field-control bg-gray-50"
                  disabled
                  type="email"
                  value={user?.email ?? ""}
                />
                <span className="block text-xs text-muted">
                  Email changes are not currently supported.
                </span>
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-extrabold text-tembea-dark">Phone number</span>
                <input
                  autoComplete="tel"
                  className="field-control"
                  maxLength={24}
                  onChange={(event) => {
                    setSuccess("");
                    setForm((current) => ({ ...current, phone: event.target.value }));
                  }}
                  placeholder="+250 7XX XXX XXX"
                  type="tel"
                  value={form.phone}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-extrabold text-tembea-dark">
                  Preferred language
                </span>
                <select
                  className="field-control"
                  onChange={(event) => {
                    setSuccess("");
                    setForm((current) => ({ ...current, language: event.target.value }));
                  }}
                  value={form.language}
                >
                  <option value="en">English</option>
                  <option value="rw">Kinyarwanda</option>
                  <option value="fr">French</option>
                </select>
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-extrabold text-tembea-dark">Home region</span>
                <select
                  className="field-control"
                  onChange={(event) => {
                    setSuccess("");
                    setForm((current) => ({ ...current, region: event.target.value }));
                  }}
                  value={form.region}
                >
                  <option value="">Not specified</option>
                  <option value="Kigali City">Kigali City</option>
                  <option value="Northern Province">Northern Province</option>
                  <option value="Southern Province">Southern Province</option>
                  <option value="Eastern Province">Eastern Province</option>
                  <option value="Western Province">Western Province</option>
                  <option value="Outside Rwanda">Outside Rwanda</option>
                </select>
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-extrabold text-tembea-dark">Avatar URL</span>
                <input
                  className="field-control"
                  inputMode="url"
                  onChange={(event) => {
                    setSuccess("");
                    setForm((current) => ({ ...current, avatar: event.target.value }));
                  }}
                  placeholder="https://example.com/photo.jpg"
                  type="url"
                  value={form.avatar}
                />
              </label>
            </div>

            <fieldset>
              <legend className="text-2xl font-black">Travel interests</legend>
              <p className="mt-1 text-sm text-muted">
                These preferences can help Tembea tailor discovery results.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {interestOptions.map((interest) => {
                  const selected = form.interests.includes(interest.id);
                  return (
                    <button
                      aria-pressed={selected}
                      className={`filter-chip ${selected ? "border-tembea-dark bg-tembea-light text-tembea-dark" : ""}`}
                      key={interest.id}
                      onClick={() => toggleInterest(interest.id)}
                      type="button"
                    >
                      <Heart fill={selected ? "currentColor" : "none"} size={15} aria-hidden />
                      {interest.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="between flex-wrap gap-3">
              <button className="btn-base btn-dark" disabled={isSaving} type="submit">
                {isSaving && <Loader2 className="animate-spin" size={17} aria-hidden />}
                {isSaving ? "Saving..." : "Save profile"}
              </button>
              <Link className="btn-base btn-ghost" href={dashboardHref}>
                Back to dashboard
              </Link>
            </div>
          </form>

          <aside className="dashboard-card h-fit stack-md p-5">
            <h2 className="text-2xl font-black">Account summary</h2>
            <div className="rounded-tembea bg-tembea-light/60 p-4">
              <UserCircle className="text-tembea-dark" size={21} aria-hidden />
              <p className="mt-3 text-sm font-bold text-muted">Account role</p>
              <p className="font-black">{user?.role.toLowerCase()}</p>
            </div>
            <div className="rounded-tembea bg-tembea-light/60 p-4">
              <Languages className="text-tembea-dark" size={21} aria-hidden />
              <p className="mt-3 text-sm font-bold text-muted">Language preference</p>
              <p className="font-black">{languageLabels[form.language] ?? "English"}</p>
            </div>
            <div className="rounded-tembea bg-tembea-light/60 p-4">
              <MapPinned className="text-tembea-dark" size={21} aria-hidden />
              <p className="mt-3 text-sm font-bold text-muted">Home region</p>
              <p className="font-black">{form.region || "Not specified"}</p>
            </div>
            <div className="rounded-tembea bg-tembea-light/60 p-4">
              <ShieldCheck className="text-tembea-dark" size={21} aria-hidden />
              <p className="mt-3 text-sm font-bold text-muted">
                {user?.role === "PARTNER" ? "Partner status" : "Account verification"}
              </p>
              <p className="font-black">
                {user?.role === "PARTNER"
                  ? partner?.status ?? "PENDING"
                  : user?.verified
                    ? "Verified"
                    : "Not verified"}
              </p>
            </div>
          </aside>
        </div>
      </main>
    </RoleGuard>
  );
}
