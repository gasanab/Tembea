import Link from "next/link";
import { AlertCircle, Loader2, Plus } from "lucide-react";
import type { Listing } from "@/types/api.types";

type PartnerListingPickerProps = {
  label: string;
  listings: Listing[];
  selectedListingId: string;
  onChange: (listingId: string) => void;
  isLoading: boolean;
  error: string;
  onRetry: () => void;
};

export function PartnerListingPicker({
  label,
  listings,
  selectedListingId,
  onChange,
  isLoading,
  error,
  onRetry,
}: PartnerListingPickerProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-[#f8faf9] p-4 text-sm font-bold text-[#6B7280]" role="status">
        <Loader2 className="animate-spin" size={17} aria-hidden />
        Loading eligible listings...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700" role="alert">
        <span className="flex items-center gap-2">
          <AlertCircle size={17} aria-hidden />
          {error}
        </span>
        <button className="underline" onClick={onRetry} type="button">
          Try again
        </button>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="rounded-xl border border-[#D5F5E3] bg-[#f8faf9] p-5">
        <p className="font-black text-[#111827]">Create a compatible listing first</p>
        <p className="mt-1 text-sm text-[#6B7280]">
          This manager attaches real records to one of your Tembea listings.
        </p>
        <Link
          className="mt-4 inline-flex items-center gap-2 font-bold text-[#145A32] hover:underline"
          href="/partner/listings?mode=create"
        >
          <Plus size={16} aria-hidden />
          Create listing
        </Link>
      </div>
    );
  }

  return (
    <label className="block max-w-xl space-y-2">
      <span className="text-sm font-extrabold text-[#145A32]">{label}</span>
      <select
        className="field-control"
        onChange={(event) => onChange(event.target.value)}
        value={selectedListingId}
      >
        {listings.map((listing) => (
          <option key={listing.id} value={listing.id}>
            {listing.name} {listing.published ? "(published)" : "(draft)"}
          </option>
        ))}
      </select>
    </label>
  );
}
