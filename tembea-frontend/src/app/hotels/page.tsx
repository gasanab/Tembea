import type { Metadata } from "next";
import { ListingPageShell } from "@/components/listing/ListingPageShell";

export const metadata: Metadata = {
  title: "Hotels",
  description: "Browse and book Rwanda's finest hotels, eco-lodges, and luxury accommodations.",
};

export default function HotelsPage() {
  return (
    <ListingPageShell
      category="hotels"
      title="Hotels & Lodges"
      description="Discover Rwanda's finest accommodations — from luxury eco-lodges in Volcanoes National Park to boutique hotels in Kigali. Find your perfect stay."
    />
  );
}