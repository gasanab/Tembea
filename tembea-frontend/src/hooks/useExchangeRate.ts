"use client";

import { useState, useEffect } from "react";

const FALLBACK_RATE = 1450;
const CACHE_KEY = "usd_rwf_rate";
const CACHE_TIME_KEY = "usd_rwf_rate_time";
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in ms

export function useExchangeRate() {
  const [rate, setRate] = useState<number>(FALLBACK_RATE);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        // Check cache first
        const cachedRate = sessionStorage.getItem(CACHE_KEY);
        const cachedTime = sessionStorage.getItem(CACHE_TIME_KEY);
        const now = Date.now();

        if (cachedRate && cachedTime && now - parseInt(cachedTime) < CACHE_DURATION) {
          setRate(parseFloat(cachedRate));
          setLoading(false);
          return;
        }

        // Fetch from open.er-api.com (free, no key required)
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        if (!res.ok) throw new Error("Failed to fetch exchange rate");
        
        const data = await res.json();
        const rwfRate = data?.rates?.RWF;

        if (rwfRate) {
          setRate(rwfRate);
          sessionStorage.setItem(CACHE_KEY, rwfRate.toString());
          sessionStorage.setItem(CACHE_TIME_KEY, now.toString());
        } else {
          throw new Error("RWF rate not found");
        }
      } catch (error) {
        console.error("Error fetching exchange rate, using fallback:", error);
        setRate(FALLBACK_RATE); // fallback
      } finally {
        setLoading(false);
      }
    };

    fetchRate();
  }, []);

  const formatRwf = (usdPrice: number | string | undefined | null) => {
    if (usdPrice === undefined || usdPrice === null || usdPrice === "") return "0 RWF";
    const numPrice = typeof usdPrice === "string" ? parseFloat(usdPrice) : usdPrice;
    if (isNaN(numPrice)) return "0 RWF";
    
    return Math.round(numPrice * rate).toLocaleString() + " RWF";
  };

  return { rate, loading, formatRwf };
}
