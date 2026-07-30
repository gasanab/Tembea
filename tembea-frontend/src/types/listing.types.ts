export type ListingType = 
  | "accommodation" 
  | "parks" 
  | "events" 
  | "marketplace" 
  | "restaurants" 
  | "tours" 
  | "transport"
  | "museums"
  | "memorial-sites"
  | "guides";

export type AccommodationListing = {
  id?: string;
  type: "accommodation";
  name: string;
  location: string;
  city: string;
  description: string;
  images: string[];
  rating: number;
  reviews: number;
  pricePerNight: number;
  roomsAvailable: number;
  amenities: string[];
  propertyType: string;
  featured: boolean;
  availability: "available" | "few-left" | "fully-booked";
};

export type ParkListing = {
  id?: string;
  type: "parks";
  name: string;
  location: string;
  description: string;
  images: string[];
  entryFee: number;
  slotsAvailable: number;
  activities: string[];
  bestSeason: string;
  availability: "open" | "limited" | "closed";
};

export type EventListing = {
  id?: string;
  type: "events";
  name: string;
  venue: string;
  city: string;
  date: string;
  time: string;
  description: string;
  bannerImage: string;
  ticketsAvailable: number;
  ticketPrice: number;
  category: string;
  featured: boolean;
};

export type MarketplaceListing = {
  id?: string;
  type: "marketplace";
  name: string;
  description: string;
  images: string[];
  price: number;
  inStock: number;
  category: string;
  seller: string;
  madeInRwanda: boolean;
  rating: number;
  reviews: number;
};

export type RestaurantListing = {
  id?: string;
  type: "restaurants";
  name: string;
  location: string;
  city: string;
  description: string;
  images: string[];
  cuisineType: string[];
  rating: number;
  reviews: number;
  tablesAvailable: number;
  priceRange: string;
  amenities: string[];
};

export type TourListing = {
  id?: string;
  type: "tours";
  name: string;
  destination: string;
  description: string;
  images: string[];
  duration: string;
  price: number;
  slotsAvailable: number;
  difficulty: string;
  included: string[];
  rating: number;
};

export type TransportListing = {
  id?: string;
  type: "transport";
  vehicleName: string;
  vehicleType: string;
  location: string;
  description: string;
  images: string[];
  pricePerDay: number;
  transmission: string;
  seats: number;
  features: string[];
  availability: "available" | "reserved" | "maintenance";
};

export type MuseumListing = {
  id?: string;
  type: "museums";
  name: string;
  location: string;
  city: string;
  description: string;
  images: string[];
  entryFee: number;
  openingHours: string;
  exhibits: string[];
  guidedToursAvailable: boolean;
  featured: boolean;
};

export type MemorialSiteListing = {
  id?: string;
  type: "memorial-sites";
  name: string;
  location: string;
  city: string;
  description: string;
  images: string[];
  entryFee: number;
  openingHours: string;
  historicalSignificance: string;
  guidedToursAvailable: boolean;
};

export type GuideListing = {
  id?: string;
  type: "guides";
  fullName: string;
  profilePhoto: string;
  images: string[];
  yearsOfExperience: number;
  certificates: string[];
  pricePerDay: number;
  description: string;
  languages: string[];
  specialties: string[];
  location: string;
  availability: "available" | "busy" | "unavailable";
};

export type AnyListing = 
  | AccommodationListing 
  | ParkListing 
  | EventListing 
  | MarketplaceListing 
  | RestaurantListing 
  | TourListing 
  | TransportListing
  | MuseumListing
  | MemorialSiteListing
  | GuideListing;