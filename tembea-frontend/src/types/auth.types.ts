export type UserRole = "client" | "partner" | "admin";

export type PartnerCategory =
  | "accommodation"
  | "parks"
  | "events"
  | "marketplace"
  | "restaurants"
  | "tours"
  | "transport";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  partnerCategory?: PartnerCategory;
};
