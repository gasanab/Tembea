"use client";

import { SmartSearch } from "@/components/search/SmartSearch";

export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-[#0d7c66] to-[#145A32] text-white py-16">
        <div className="tembea-container">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Explore All Services</h1>
            <p className="text-lg text-white/90">
              Search published hotels, restaurants, events, tours, transport, tour guides, and Made in Rwanda listings from Tembea partners.
            </p>
          </div>
        </div>
      </section>

      <div className="tembea-container py-8">
        <SmartSearch showResults />
      </div>
    </main>
  );
}
