import type { UserRole } from "@/types/auth.types";

export const dashboardContent: Record<
  UserRole,
  {
    title: string;
    subtitle: string;
    stats: { label: string; value: string; trend: string }[];
    rows: { id: string; guest: string; service: string; status: string; amount: string }[];
    notifications: string[];
  }
> = {
  client: {
    title: "Client trips",
    subtitle: "Track bookings, saved places, and live travel updates.",
    stats: [
      { label: "Upcoming trips", value: "4", trend: "+2 this month" },
      { label: "Saved places", value: "28", trend: "6 new ideas" },
      { label: "Rewards", value: "12,400", trend: "points" }
    ],
    rows: [
      { id: "BK-1028", guest: "Aline M.", service: "Nyungwe Canopy Walk", status: "Confirmed", amount: "$144" },
      { id: "BK-1031", guest: "Aline M.", service: "Kigali Jazz Night", status: "Pending payment", amount: "$48" }
    ],
    notifications: ["Akagera safari has 3 live seats left.", "Your Kigali transfer driver was assigned."]
  },
  partner: {
    title: "Partner command",
    subtitle: "Manage inventory, bookings, earnings, and guest messages.",
    stats: [
      { label: "Monthly revenue", value: "$18.7k", trend: "+14%" },
      { label: "Occupancy", value: "82%", trend: "+7%" },
      { label: "Response rate", value: "96%", trend: "Excellent" }
    ],
    rows: [
      { id: "PT-211", guest: "Nora K.", service: "Volcanoes Eco Lodge", status: "Arriving tomorrow", amount: "$720" },
      { id: "PT-219", guest: "Daniel R.", service: "Lake Kivu Weekend", status: "Awaiting confirmation", amount: "$310" }
    ],
    notifications: ["Update Volcanoes Eco Lodge weekend availability.", "New review received for Lake Kivu Weekend."]
  },
  admin: {
    title: "Admin overview",
    subtitle: "Monitor marketplace health, partners, transactions, and approvals.",
    stats: [
      { label: "GMV", value: "$428k", trend: "+22%" },
      { label: "Active partners", value: "1,248", trend: "+51" },
      { label: "Open tickets", value: "19", trend: "-8 today" }
    ],
    rows: [
      { id: "AD-880", guest: "Kivu Retreats", service: "Partner approval", status: "Review", amount: "$0" },
      { id: "AD-881", guest: "Tembea Pay", service: "Settlement batch", status: "Processing", amount: "$28.5k" }
    ],
    notifications: ["Three partner listings need verification.", "Payment settlement batch is processing."]
  }
};
