import type { Metadata } from "next";
import { ListingPageShell } from "@/components/listing/ListingPageShell";

export const metadata: Metadata = {
  title: "Transport",
  description: "Book airport transfers, city rides, safari vehicles, and intercity transport across Rwanda.",
};

export default function TransportPage() {
  return (
    <ListingPageShell
      category="transport"
      title="Transport Services"
      description="Get around Rwanda with ease. Book airport transfers, city taxis, intercity buses, luxury safari vehicles, and motorcycle taxis — all in one place."
    />
  );
}