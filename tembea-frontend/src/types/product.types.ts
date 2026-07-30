export type ListingCategory =
  | "hotels"
  | "apartments"
  | "restaurants"
  | "transport"
  | "parks"
  | "tours"
  | "events"
  | "marketplace"
  | "experiences"
  | "tour-guides"
  | "museums"
  | "lakes";

export type Listing = {
  id: string;
  title: string;
  category: ListingCategory;
  subcategory?: string;
  location: string;
  region: string;
  description: string;
  shortDescription: string;
  images: string[];
  price: number;
  priceLabel: string;
  rating: number;
  reviews: number;
  tags: string[];
  amenities?: string[];
  availability: "Live" | "Few spots" | "Available" | "Sold out";
  featured?: boolean;
  partner?: string;
  duration?: string;
  capacity?: string;
  languages?: string[];
  coordinates?: { lat: number; lng: number };
};