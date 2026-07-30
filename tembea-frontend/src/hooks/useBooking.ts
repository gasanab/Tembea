"use client";

import { useState } from "react";
import type { BookingStep } from "@/types/booking.types";

export function useBooking() {
  const [step, setStep] = useState<BookingStep>("details");
  return { step, setStep };
}
