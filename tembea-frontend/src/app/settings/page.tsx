"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Globe,
  KeyRound,
  Loader2,
  Moon,
  Sun,
  UserCircle,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/context/AuthContext";
import { useThemeContext } from "@/context/ThemeContext";
import { usersApi } from "@/lib/api-client";

const themes = [
  {
    id: "light" as const,
    label: "Light",
    icon: Sun,
    note: "Use the light interface on this device.",
  },
  {
    id: "dark" as const,
    label: "Dark",
    icon: Moon,
    note: "Use the dark interface on this device.",
  },
];

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useThemeContext();
  const [language, setLanguage] = useState("en");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user?.language) setLanguage(user.language);
  }, [user?.language]);

  const saveLanguage = async () => {
    setIsSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await usersApi.updateMe({ language });
      updateUser(updated);
      setSuccess("Language preference saved.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "We could not save your preference. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <RoleGuard>
      <main className="section-pad tourism-surface">
        <div className="tembea-container stack-lg">
          <section className="dashboard-card stack-lg p-6">
            <div>
              <p className="section-kicker">Settings</p>
              <h1 className="text-4xl font-black">Account preferences</h1>
              <p className="mt-2 max-w-2xl text-muted">
                Manage the preferences that Tembea currently supports.
              </p>
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
          </section>

          <section className="grid gap-5 lg:grid-cols-2">
            <div className="dashboard-card stack-md p-5">
              <div>
                <p className="section-kicker">Appearance</p>
                <h2 className="text-2xl font-black">Theme</h2>
                <p className="mt-1 text-sm text-muted">
                  Theme selection is stored locally on this device.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {themes.map((option) => {
                  const Icon = option.icon;
                  const selected = theme === option.id;
                  return (
                    <button
                      aria-pressed={selected}
                      className={`rounded-2xl border p-4 text-left transition ${
                        selected
                          ? "border-[#145A32] bg-[#D5F5E3]"
                          : "border-[#D5F5E3] bg-white hover:border-[#145A32]"
                      }`}
                      key={option.id}
                      onClick={() => setTheme(option.id)}
                      type="button"
                    >
                      <Icon className="text-tembea-dark" size={23} aria-hidden />
                      <span className="mt-4 block font-black">{option.label}</span>
                      <span className="mt-1 block text-sm font-semibold text-muted">
                        {option.note}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="dashboard-card stack-md p-5">
              <Globe className="text-tembea-dark" size={24} aria-hidden />
              <div>
                <h2 className="text-2xl font-black">Preferred language</h2>
                <p className="mt-1 text-sm text-muted">
                  This saves your account preference. Some parts of the current
                  interface are still available in English only.
                </p>
              </div>
              <label className="block space-y-2">
                <span className="text-sm font-extrabold text-tembea-dark">
                  Language
                </span>
                <select
                  className="field-control"
                  onChange={(event) => {
                    setSuccess("");
                    setLanguage(event.target.value);
                  }}
                  value={language}
                >
                  <option value="en">English</option>
                  <option value="rw">Kinyarwanda</option>
                  <option value="fr">French</option>
                </select>
              </label>
              <button
                className="btn-base btn-dark w-fit"
                disabled={isSaving || language === (user?.language ?? "en")}
                onClick={saveLanguage}
                type="button"
              >
                {isSaving && <Loader2 className="animate-spin" size={17} aria-hidden />}
                {isSaving ? "Saving..." : "Save language"}
              </button>
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-3">
            <div className="dashboard-card stack-md p-5">
              <UserCircle className="text-tembea-dark" size={24} aria-hidden />
              <h2 className="text-xl font-black">Profile details</h2>
              <p className="text-sm text-muted">
                Update your name, phone, avatar, region and interests.
              </p>
              <Link className="btn-base btn-ghost w-fit" href="/profile">
                Edit profile
              </Link>
            </div>
            <div className="dashboard-card stack-md p-5">
              <KeyRound className="text-tembea-dark" size={24} aria-hidden />
              <h2 className="text-xl font-black">Password</h2>
              <p className="text-sm text-muted">
                Request a secure password-reset link for {user?.email}.
              </p>
              <Link className="btn-base btn-ghost w-fit" href="/forgot-password">
                Reset password
              </Link>
            </div>
            <div className="dashboard-card stack-md p-5">
              <Bell className="text-tembea-dark" size={24} aria-hidden />
              <h2 className="text-xl font-black">Notifications</h2>
              <p className="text-sm text-muted">
                View account and booking notifications. Delivery-channel controls
                are not available yet.
              </p>
              <Link className="btn-base btn-ghost w-fit" href="/notifications">
                Open notifications
              </Link>
            </div>
          </section>
        </div>
      </main>
    </RoleGuard>
  );
}
