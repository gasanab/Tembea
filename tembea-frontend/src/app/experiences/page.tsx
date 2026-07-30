import type { Metadata } from "next";
import { ListingPageShell } from "@/components/listing/ListingPageShell";

export const metadata: Metadata = {
  title: "Experiences",
  description: "Discover and book Rwanda tourism experiences — national parks, museums, cultural tours, lakes, and adventures.",
};

export default function ExperiencesPage() {
  return (
    <ListingPageShell
      category="tours"
      title="Tourism Experiences"
      description="Explore the best of Rwanda — gorilla trekking in Volcanoes National Park, canopy walks in Nyungwe, safaris in Akagera, cultural village tours, and more."
    />
  );
}
