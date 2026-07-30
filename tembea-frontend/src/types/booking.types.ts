export type BookingStep = "details" | "guests" | "payment" | "confirmation";

export type BookingSummary = {
  title: string;
  dates: string;
  guests: number;
  subtotal: number;
  serviceFee: number;
};
