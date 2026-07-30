export const listingRouteTypes = [
  "accommodation",
  "parks",
  "events",
  "marketplace",
  "restaurants",
  "tours",
  "transport",
] as const;

export type ListingRouteType = (typeof listingRouteTypes)[number];

const TYPE_TO_ROUTE: Record<string, ListingRouteType> = {
  ACCOMMODATION: "accommodation",
  HOTELS: "accommodation",
  APARTMENTS: "accommodation",
  PARKS: "parks",
  EXPERIENCES: "parks",
  MUSEUMS: "parks",
  MEMORIAL_SITES: "parks",
  EVENTS: "events",
  MARKETPLACE: "marketplace",
  RESTAURANTS: "restaurants",
  TOURS: "tours",
  GUIDES: "tours",
  TOUR_GUIDES: "tours",
  TRANSPORT: "transport",
};

export function isListingRouteType(value: string): value is ListingRouteType {
  return listingRouteTypes.includes(value as ListingRouteType);
}

export function toListingRouteType(value: string): ListingRouteType {
  const key = value.trim().replace(/-/g, "_").toUpperCase();
  return TYPE_TO_ROUTE[key] ?? "tours";
}

export function getListingHref(type: string, id: string): string {
  return `/listings/${toListingRouteType(type)}/${encodeURIComponent(id)}`;
}
