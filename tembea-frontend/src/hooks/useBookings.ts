"use client";

import { useState, useEffect, useCallback } from "react";
import { bookingsApi } from "@/lib/api-client";
import type { Booking } from "@/types/api.types";

export function useMyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response: any = await bookingsApi.getMyBookings();
      // Handle different response shapes safely
      const bookingsData = Array.isArray(response) 
        ? response 
        : Array.isArray(response?.bookings) 
          ? response.bookings 
          : [];
      setBookings(bookingsData);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch bookings"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { bookings, isLoading, error, refetch: fetchBookings };
}

export function usePartnerBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState<any>(null);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [bookingsResponse, statsResponse]: [any, any] = await Promise.all([
        bookingsApi.getPartner(),
        bookingsApi.getPartnerStats()
      ]);
      
      const bookingsData = Array.isArray(bookingsResponse) 
        ? bookingsResponse 
        : Array.isArray(bookingsResponse?.bookings) 
          ? bookingsResponse.bookings 
          : [];
          
      setBookings(bookingsData);
      setStats(statsResponse);
    } catch (err) {
      console.error("Error fetching partner bookings:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch partner bookings"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { bookings, stats, isLoading, error, refetch: fetchBookings };
}
