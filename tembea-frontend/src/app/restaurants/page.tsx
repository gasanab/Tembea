import type { Metadata } from "next";
import { ListingPageShell } from "@/components/listing/ListingPageShell";

export const metadata: Metadata = {
  title: "Restaurants",
  description: "Discover and reserve Rwanda's best restaurants, cafes, and dining experiences.",
};

export default function RestaurantsPage() {
  return (
    <ListingPageShell
      category="restaurants"
      title="Restaurants & Dining"
      description="Explore Rwanda's vibrant culinary scene. From rooftop lounges in Kigali to lakeside dining on Lake Kivu, find your next memorable meal."
    />
  );
}