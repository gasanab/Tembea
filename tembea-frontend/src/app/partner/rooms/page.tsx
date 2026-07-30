"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  BedDouble,
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { PartnerListingPicker } from "@/components/partner/PartnerListingPicker";
import { usePartnerListings } from "@/hooks/usePartnerListings";
import { roomsApi } from "@/lib/api-client";
import { formatCurrency } from "@/utils/formatters/currency";
import type { Room } from "@/types/api.types";

const emptyForm = {
  name: "",
  description: "",
  capacity: "2",
  price: "",
  totalRooms: "1",
  amenities: "",
};

export default function PartnerRoomsPage() {
  const listingState = usePartnerListings("ACCOMMODATION");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadRooms = useCallback(async () => {
    if (!listingState.selectedListingId) {
      setRooms([]);
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const response = await roomsApi.getByListing(listingState.selectedListingId);
      setRooms(Array.isArray(response) ? response : []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Rooms could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }, [listingState.selectedListingId]);

  useEffect(() => {
    setEditingId(null);
    setForm(emptyForm);
    loadRooms();
  }, [loadRooms]);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!listingState.selectedListingId) return;
    setIsSaving(true);
    setError("");
    setSuccess("");
    const data = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      capacity: Number(form.capacity),
      price: Number(form.price),
      totalRooms: Number(form.totalRooms),
      amenities: form.amenities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };
    try {
      if (editingId) {
        await roomsApi.update(editingId, data);
        setSuccess("Room updated.");
      } else {
        await roomsApi.create({
          ...data,
          listingId: listingState.selectedListingId,
        });
        setSuccess("Room created.");
      }
      resetForm();
      await loadRooms();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Room could not be saved.");
    } finally {
      setIsSaving(false);
    }
  };

  const edit = (room: Room) => {
    setEditingId(room.id);
    setForm({
      name: room.name,
      description: room.description ?? "",
      capacity: String(room.capacity),
      price: String(room.price),
      totalRooms: String(room.totalRooms),
      amenities: room.amenities.join(", "),
    });
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleAvailability = async (room: Room) => {
    setActionId(room.id);
    setError("");
    try {
      await roomsApi.updateAvailability(room.id, !room.available);
      await loadRooms();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Availability could not be updated.");
    } finally {
      setActionId("");
    }
  };

  const remove = async (room: Room) => {
    if (!window.confirm(`Delete ${room.name}? This only removes this room record.`)) return;
    setActionId(room.id);
    setError("");
    try {
      await roomsApi.delete(room.id);
      if (editingId === room.id) resetForm();
      setSuccess("Room deleted.");
      await loadRooms();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Room could not be deleted.");
    } finally {
      setActionId("");
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <section className="rounded-2xl border border-[#D5F5E3] bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-[#2ECC71]">Accommodation inventory</p>
        <h1 className="mt-1 text-3xl font-black text-[#111827]">Room manager</h1>
        <p className="mt-2 text-[#6B7280]">
          Rooms are saved to the selected accommodation listing and used by booking availability.
        </p>
        <div className="mt-5">
          <PartnerListingPicker
            error={listingState.listingError}
            isLoading={listingState.isLoadingListings}
            label="Accommodation listing"
            listings={listingState.listings}
            onChange={listingState.setSelectedListingId}
            onRetry={listingState.reloadListings}
            selectedListingId={listingState.selectedListingId}
          />
        </div>
      </section>

      {error && <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700" role="alert">{error}</p>}
      {success && <p className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700" role="status"><CheckCircle2 size={17} aria-hidden />{success}</p>}

      {listingState.selectedListingId && (
        <section className="grid gap-6 xl:grid-cols-[380px_1fr]">
          <form className="h-fit space-y-4 rounded-2xl border border-[#D5F5E3] bg-white p-5 shadow-sm" onSubmit={submit}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-black">{editingId ? "Edit room" : "Add room"}</h2>
              {editingId && <button className="text-sm font-bold text-[#145A32] underline" onClick={resetForm} type="button">Cancel</button>}
            </div>
            <label className="block space-y-1"><span className="text-sm font-bold">Room name</span><input className="field-control" maxLength={120} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required value={form.name} /></label>
            <label className="block space-y-1"><span className="text-sm font-bold">Description</span><textarea className="field-control min-h-24" maxLength={1000} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} value={form.description} /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1"><span className="text-sm font-bold">Guest capacity</span><input className="field-control" min={1} onChange={(event) => setForm((current) => ({ ...current, capacity: event.target.value }))} required type="number" value={form.capacity} /></label>
              <label className="block space-y-1"><span className="text-sm font-bold">Number of rooms</span><input className="field-control" min={1} onChange={(event) => setForm((current) => ({ ...current, totalRooms: event.target.value }))} required type="number" value={form.totalRooms} /></label>
            </div>
            <label className="block space-y-1"><span className="text-sm font-bold">Price per night (USD)</span><input className="field-control" min={0} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} required step="0.01" type="number" value={form.price} /></label>
            <label className="block space-y-1"><span className="text-sm font-bold">Amenities</span><input className="field-control" onChange={(event) => setForm((current) => ({ ...current, amenities: event.target.value }))} placeholder="Wi-Fi, breakfast, balcony" value={form.amenities} /><span className="text-xs text-[#6B7280]">Separate amenities with commas.</span></label>
            <button className="btn-base btn-dark w-full" disabled={isSaving} type="submit">{isSaving ? <Loader2 className="animate-spin" size={17} aria-hidden /> : <Plus size={17} aria-hidden />}{isSaving ? "Saving..." : editingId ? "Save changes" : "Create room"}</button>
          </form>

          <div className="rounded-2xl border border-[#D5F5E3] bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black">Saved rooms</h2>
            {isLoading && <p className="py-12 text-center text-sm text-[#6B7280]" role="status">Loading rooms...</p>}
            {!isLoading && rooms.length === 0 && <div className="py-12 text-center"><BedDouble className="mx-auto text-[#145A32]" size={31} aria-hidden /><p className="mt-3 font-bold">No rooms on this listing yet</p></div>}
            <div className="mt-4 grid gap-3">
              {rooms.map((room) => (
                <article className="grid gap-3 rounded-xl border border-[#D5F5E3] p-4 sm:grid-cols-[1fr_auto] sm:items-center" key={room.id}>
                  <div><div className="flex flex-wrap items-center gap-2"><h3 className="font-black">{room.name}</h3><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${room.available ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"}`}>{room.available ? "Available" : "Unavailable"}</span></div><p className="mt-1 text-sm text-[#6B7280]">{room.capacity} guests · {room.totalRooms} rooms · {formatCurrency(room.price)}/night</p></div>
                  <div className="flex flex-wrap gap-2">
                    <button className="btn-base btn-ghost btn-sm" disabled={actionId === room.id} onClick={() => toggleAvailability(room)} type="button">{room.available ? "Pause" : "Make available"}</button>
                    <button aria-label={`Edit ${room.name}`} className="rounded-lg border border-[#D5F5E3] p-2 text-[#145A32]" onClick={() => edit(room)} type="button"><Pencil size={16} aria-hidden /></button>
                    <button aria-label={`Delete ${room.name}`} className="rounded-lg border border-red-200 p-2 text-red-600" disabled={actionId === room.id} onClick={() => remove(room)} type="button"><Trash2 size={16} aria-hidden /></button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
