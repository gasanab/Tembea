"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  FileCheck2,
  Loader2,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react";
import { uploadsApi, verificationApi } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import type { PartnerCategory } from "@/types/api.types";

const CATEGORIES: Array<{ value: PartnerCategory; label: string }> = [
  { value: "ACCOMMODATION", label: "Accommodation" },
  { value: "PARKS", label: "Parks" },
  { value: "EVENTS", label: "Events" },
  { value: "MARKETPLACE", label: "Marketplace" },
  { value: "RESTAURANTS", label: "Restaurants" },
  { value: "TOURS", label: "Tours" },
  { value: "TRANSPORT", label: "Transport" },
  { value: "MUSEUMS", label: "Museums" },
  { value: "MEMORIAL_SITES", label: "Memorial sites" },
  { value: "GUIDES", label: "Tour guides" },
];

const MAX_DOCUMENTS = 5;
const MAX_DOCUMENT_SIZE = 8 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);

export default function PartnerOnboardingPage() {
  const { user, partner, refreshUser, logout } = useAuth();
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState<PartnerCategory>("TOURS");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!businessName && (partner?.businessName || user?.name)) {
      setBusinessName(partner?.businessName || user?.name || "");
    }
    if (partner?.category) setCategory(partner.category);
  }, [businessName, partner, user]);

  const chooseFiles = (selected: FileList | null) => {
    setError("");
    const nextFiles = Array.from(selected ?? []);
    if (nextFiles.length > MAX_DOCUMENTS) {
      setError(`Choose no more than ${MAX_DOCUMENTS} documents.`);
      return;
    }
    const invalid = nextFiles.find(
      (file) => !ACCEPTED_TYPES.has(file.type) || file.size > MAX_DOCUMENT_SIZE,
    );
    if (invalid) {
      setError(
        `${invalid.name} must be a PDF, JPEG, or PNG file no larger than 8 MB.`,
      );
      return;
    }
    setFiles(nextFiles);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (files.length === 0) {
      setError("Add at least one business or professional verification document.");
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadedDocuments: string[] = [];
      for (const file of files) {
        const result = await uploadsApi.uploadVerificationDocument(file);
        uploadedDocuments.push(result.documentId);
      }
      await verificationApi.apply({
        businessName: businessName.trim(),
        category,
        documents: uploadedDocuments,
        ...(phone.trim() && { phone: phone.trim() }),
        ...(website.trim() && { website: website.trim() }),
      });
      await refreshUser();
      setSubmitted(true);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "The application could not be submitted. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center bg-[#f5fbf7] px-4 py-16">
        <section className="mx-auto w-full max-w-xl rounded-3xl border border-[#D5F5E3] bg-white p-8 text-center shadow-xl sm:p-10">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" aria-hidden />
          <p className="mt-5 text-xs font-black uppercase tracking-wider text-[#145A32]">
            Application received
          </p>
          <h1 className="mt-2 text-3xl font-black text-gray-900">
            Your verification review is pending
          </h1>
          <p className="mt-3 text-gray-600">
            Tembea administrators can now review the private documents you
            supplied. Partner tools remain locked until the account is approved.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link className="btn-base btn-dark" href="/">
              Return home
            </Link>
            <button className="btn-base btn-ghost" onClick={() => void logout()} type="button">
              Sign out
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5fbf7] px-4 py-10 sm:py-16">
      <form
        className="mx-auto max-w-3xl space-y-6 rounded-3xl border border-[#D5F5E3] bg-white p-6 shadow-xl sm:p-10"
        onSubmit={submit}
      >
        <header className="border-b border-gray-100 pb-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D5F5E3] text-[#145A32]">
            <ShieldCheck size={25} aria-hidden />
          </span>
          <h1 className="mt-4 text-3xl font-black text-gray-900">
            Complete your partner application
          </h1>
          <p className="mt-2 max-w-2xl text-gray-600">
            Tell us about the business and upload proof of registration,
            licensing, or professional certification. Documents are stored
            privately and exposed to administrators only through expiring links.
          </p>
        </header>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-sm font-bold text-gray-700">Business name</span>
            <input
              className="field-control"
              maxLength={120}
              minLength={2}
              onChange={(event) => setBusinessName(event.target.value)}
              required
              value={businessName}
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-bold text-gray-700">Primary category</span>
            <select
              className="field-control"
              onChange={(event) => setCategory(event.target.value as PartnerCategory)}
              value={category}
            >
              {CATEGORIES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-bold text-gray-700">Business phone</span>
            <input
              className="field-control"
              maxLength={40}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+250 7XX XXX XXX"
              type="tel"
              value={phone}
            />
          </label>
          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-sm font-bold text-gray-700">Website (optional)</span>
            <input
              className="field-control"
              onChange={(event) => setWebsite(event.target.value)}
              placeholder="https://example.com"
              type="url"
              value={website}
            />
          </label>
        </div>

        <section className="space-y-3">
          <div>
            <h2 className="font-black text-gray-900">Verification documents</h2>
            <p className="mt-1 text-sm text-gray-500">
              Select 1–5 PDF, JPEG, or PNG files. Each file may be up to 8 MB.
            </p>
          </div>
          <label className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 px-5 py-8 text-center transition hover:border-emerald-400">
            <UploadCloud className="h-8 w-8 text-[#145A32]" aria-hidden />
            <span className="mt-2 font-bold text-gray-900">Choose private documents</span>
            <span className="mt-1 text-xs text-gray-500">
              Files upload when you submit the application
            </span>
            <input
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              className="sr-only"
              multiple
              onChange={(event) => chooseFiles(event.target.files)}
              type="file"
            />
          </label>

          {files.length > 0 && (
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li
                  className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3"
                  key={`${file.name}-${file.size}`}
                >
                  <FileCheck2 className="shrink-0 text-emerald-600" size={19} aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-700">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                  <button
                    aria-label={`Remove ${file.name}`}
                    className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                    onClick={() =>
                      setFiles((current) =>
                        current.filter((_, fileIndex) => fileIndex !== index),
                      )
                    }
                    type="button"
                  >
                    <X size={16} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
          <Link className="btn-base btn-ghost justify-center" href="/">
            Do this later
          </Link>
          <button
            className="btn-base btn-dark justify-center disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting && <Loader2 className="animate-spin" size={18} aria-hidden />}
            {isSubmitting ? "Uploading securely..." : "Submit for verification"}
          </button>
        </div>
      </form>
    </main>
  );
}
