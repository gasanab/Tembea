import type { Metadata } from "next";
import { ListingPageShell } from "@/components/listing/ListingPageShell";

export const metadata: Metadata = {
  title: "Tour Guides",
  description: "Hire professional tour guides for gorilla trekking, city tours, safaris, and cultural experiences across Rwanda.",
};

export default function TourGuidesPage() {
  return (
    <ListingPageShell
      category="tour-guides"
      title="Tour Guides"
      description="Connect with certified Rwandan tour guides who speak your language. From gorilla trekking experts to history specialists and safari guides — find your perfect guide."
    />
  );
}