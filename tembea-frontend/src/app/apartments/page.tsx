import type { Metadata } from "next";
import { ListingPageShell } from "@/components/listing/ListingPageShell";

export const metadata: Metadata = {
  title: "Apartments",
  description: "Browse and book serviced apartments, villas, and private residences across Rwanda.",
};

export default function ApartmentsPage() {
  return (
    <ListingPageShell
      category="apartments"
      title="Apartments & Villas"
      description="Find your home away from home. Browse serviced apartments, luxury villas, and private residences in Kigali and across Rwanda."
    />
  );
}