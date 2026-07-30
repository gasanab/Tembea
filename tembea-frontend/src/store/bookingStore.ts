import { create } from "zustand";

type BookingState = {
  selectedListingId: string | null;
  guests: number;
  currency: "USD" | "RWF" | "EUR";
  checkIn: string;
  checkOut: string;
  setListing: (id: string) => void;
  setGuests: (n: number) => void;
  setCurrency: (c: "USD" | "RWF" | "EUR") => void;
  setDates: (checkIn: string, checkOut: string) => void;
  reset: () => void;
};

const defaults = {
  selectedListingId: null,
  guests: 2,
  currency: "USD" as const,
  checkIn: "",
  checkOut: "",
};

export const useBookingStore = create<BookingState>()((set) => ({
  ...defaults,
  setListing: (id) => set({ selectedListingId: id }),
  setGuests: (n) => set({ guests: n }),
  setCurrency: (c) => set({ currency: c }),
  setDates: (checkIn, checkOut) => set({ checkIn, checkOut }),
  reset: () => set(defaults),
}));
