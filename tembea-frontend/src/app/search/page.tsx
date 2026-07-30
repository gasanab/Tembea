import type { Metadata } from "next";
import { SmartSearch } from "@/components/search/SmartSearch";

export const metadata: Metadata = {
  title: "Smart Search",
  description: "Search and filter Rwanda hotels, apartments, restaurants, transport, parks, tours, events, and marketplace products."
};

export default function SearchPage() {
  return (
    <main className="section-pad tourism-surface">
      <div className="tembea-container stack-lg">
        <div className="stack-sm">
          <p className="section-kicker">Listing search</p>
          <h1 className="text-5xl font-black">Find services for your Rwanda trip.</h1>
          <p className="max-w-2xl text-muted">Search published partner listings by service, destination, region, price, and rating.</p>
        </div>
        <SmartSearch showResults />
      </div>
    </main>
  );
}
