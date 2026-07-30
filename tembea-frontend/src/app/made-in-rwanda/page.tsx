import type { Metadata } from "next";
import { ListingPageShell } from "@/components/listing/ListingPageShell";

export const metadata: Metadata = {
  title: "Made in Rwanda",
  description: "Shop authentic Rwandan products — crafts, coffee, tea, honey, art, and artisan goods.",
};

export default function MadeInRwandaPage() {
  return (
    <ListingPageShell
      category="marketplace"
      title="Made in Rwanda Marketplace"
      description="Shop authentic Rwandan products directly from local artisans and cooperatives. Handwoven baskets, premium coffee, tea, honey, art, and unique gifts that support Rwandan communities."
    />
  );
}