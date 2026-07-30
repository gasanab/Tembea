import type { PartnerCategory, UserRole } from "@/types/auth.types";

export const clientSegments = [
  "Tourists",
  "Business travellers",
  "Diplomats",
  "Local visitors"
];

export const roleProfiles: {
  role: UserRole;
  title: string;
  description: string;
  href: string;
  capabilities: string[];
}[] = [
  {
    role: "client",
    title: "Client / General user",
    description: "Browse Rwanda services, book stays, buy tickets, reserve tables, purchase products, save favourites, and leave reviews.",
    href: "/client",
    capabilities: ["Browse services", "Book and reserve", "Review and save"]
  },
  {
    role: "partner",
    title: "Partner",
    description: "Operate a service-specific workspace for accommodation, parks, events, products, restaurants, tours, or transport.",
    href: "/partner",
    capabilities: ["Manage inventory", "Set availability", "Track earnings"]
  },
  {
    role: "admin",
    title: "Admin",
    description: "Manage users, partner approvals, bookings, analytics, revenue, capacity, commissions, and platform health.",
    href: "/admin",
    capabilities: ["Approve partners", "Monitor revenue", "Audit activity"]
  }
];

export const partnerCategories: {
  id: PartnerCategory;
  title: string;
  examples: string;
  route: string;
  serviceCategory: string;
  availabilityLabel: string;
  available: string;
  capacity: string;
  revenue: string;
  features: string[];
  actions: string[];
}[] = [
  {
    id: "accommodation",
    title: "Accommodation partner",
    examples: "Hotels, apartments, guest houses",
    route: "/partner?type=accommodation",
    serviceCategory: "hotels",
    availabilityLabel: "Rooms available",
    available: "73",
    capacity: "184 active rooms",
    revenue: "$18.7k",
    features: ["Add hotels and apartments", "Manage rooms", "Set prices", "Receive bookings"],
    actions: ["Add room", "Update pricing", "Review check-ins"]
  },
  {
    id: "parks",
    title: "National parks and reservations",
    examples: "Akagera, Volcanoes, Nyungwe, Ibere rya Bigogwe",
    route: "/partner?type=parks",
    serviceCategory: "parks",
    availabilityLabel: "Reservation slots",
    available: "128",
    capacity: "420 daily visitor limit",
    revenue: "$9.4k",
    features: ["Daily visitor capacity", "Ticket booking", "Tour scheduling", "Visitor check-in"],
    actions: ["Open permit calendar", "Check in visitors", "Adjust capacity"]
  },
  {
    id: "events",
    title: "Event organizer",
    examples: "Concerts, conferences, cultural festivals",
    route: "/partner?type=events",
    serviceCategory: "events",
    availabilityLabel: "Tickets remaining",
    available: "1,240",
    capacity: "No overselling",
    revenue: "$12.2k",
    features: ["Create event pages", "Upload posters", "Generate QR tickets", "Track attendees"],
    actions: ["Create event", "Scan QR tickets", "Monitor ticket sales"]
  },
  {
    id: "marketplace",
    title: "Made in Rwanda marketplace",
    examples: "Crafts, fashion, coffee, tea, art",
    route: "/partner?type=marketplace",
    serviceCategory: "marketplace",
    availabilityLabel: "Products in stock",
    available: "420",
    capacity: "Commission tracked",
    revenue: "$6.8k",
    features: ["Create online store", "Manage inventory", "Receive orders", "View earnings"],
    actions: ["Add product", "Process orders", "View commission"]
  },
  {
    id: "restaurants",
    title: "Restaurant partner",
    examples: "Local cuisine, fine dining, cafes",
    route: "/partner?type=restaurants",
    serviceCategory: "restaurants",
    availabilityLabel: "Tables open",
    available: "56",
    capacity: "138 reservable tables",
    revenue: "$7.1k",
    features: ["Publish menus", "Table reservations", "Food ordering", "Customer reviews"],
    actions: ["Update menu", "Manage tables", "Review orders"]
  },
  {
    id: "tours",
    title: "Tour and experience partner",
    examples: "Kigali tours, coffee tours, workshops",
    route: "/partner?type=tours",
    serviceCategory: "tours",
    availabilityLabel: "Tour slots",
    available: "64",
    capacity: "Participant limits active",
    revenue: "$8.5k",
    features: ["Create packages", "Manage schedules", "Set participant limits", "Track bookings"],
    actions: ["Create package", "Set schedule", "Review bookings"]
  },
  {
    id: "transport",
    title: "Transport partner",
    examples: "Car rental, motorbike transport, airport transfers",
    route: "/partner?type=transport",
    serviceCategory: "transport",
    availabilityLabel: "Vehicles available",
    available: "34",
    capacity: "Live reservations",
    revenue: "$5.3k",
    features: ["Add vehicles", "Manage bookings", "Set availability", "Track reservations"],
    actions: ["Add vehicle", "Assign driver", "Update availability"]
  }
];

export const platformUserGroups = [
  { label: "Clients", count: "18.4k", detail: "Tourists, business travellers, diplomats, local visitors" },
  { label: "Partners", count: "1.2k", detail: "Accommodation, parks, events, marketplace, restaurants, tours, transport" },
  { label: "Admins", count: "12", detail: "Operations, approvals, analytics, revenue, platform safety" }
];
