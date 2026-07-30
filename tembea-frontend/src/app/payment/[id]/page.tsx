"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import { bookingsApi } from "@/lib/api-client";
import { getListingHref } from "@/lib/listing-routes";
import type { Booking } from "@/types/api.types";
import { CheckoutStepper } from "@/components/checkout/CheckoutStepper";
import { BookingCreatedStep } from "@/components/checkout/BookingCreatedStep";
import { PaymentMethodStep } from "@/components/checkout/PaymentMethodStep";
import { ConfirmationStep } from "@/components/checkout/ConfirmationStep";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);

  const fetchBooking = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await bookingsApi.getOne(bookingId);
      setBooking(data);
      if (data.payment?.status === "PAID") {
        setCurrentStep(3);
      } else if (data.payment) {
        setCurrentStep(2);
      }
    } catch {
      setError("Failed to load booking details");
    } finally {
      setIsLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const handleProceed = () => {
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    if (currentStep === 1 && booking?.listingId) {
      router.push(getListingHref(booking.listing?.type || booking.type, booking.listingId));
    } else {
      setCurrentStep((prev) => Math.max(prev - 1, 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 font-bold">Loading secure checkout...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-3xl shadow-xl">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="text-red-600" size={32} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Booking Not Found</h1>
          <p className="text-gray-600 font-medium mb-6">{error || "Booking details are unavailable."}</p>
          <button onClick={() => router.push("/")} className="py-3 px-6 rounded-xl bg-gray-900 text-white font-bold">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24">
      {/* Top Navbar Simulation or Spacing */}
      <div className="pt-8 pb-4">
        <CheckoutStepper currentStep={currentStep} />
      </div>

      <div className="tembea-container max-w-6xl">
        {currentStep === 1 && (
          <BookingCreatedStep 
            booking={booking} 
            onProceed={handleProceed} 
            onBack={handleBack} 
          />
        )}
        
        {currentStep === 2 && (
          <PaymentMethodStep
            booking={booking}
            onRefresh={fetchBooking}
            onBack={handleBack}
          />
        )}
        
        {currentStep === 3 && (
          <ConfirmationStep 
            booking={booking} 
          />
        )}
      </div>
    </div>
  );
}
