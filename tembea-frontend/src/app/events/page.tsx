import type { Metadata } from "next";
import { ListingPageShell } from "@/components/listing/ListingPageShell";

export const metadata: Metadata = {
  title: "Events",
  description: "Discover and book tickets for Rwanda's festivals, concerts, cultural ceremonies, and events.",
};

export default function EventsPage() {
  return (
    <ListingPageShell
      category="events"
      title="Events & Festivals"
      description="Experience Rwanda's vibrant culture. From the Kwita Izina Gorilla Naming Ceremony to the Kigali Jazz Festival, find and book your next event."
    />
  );
}