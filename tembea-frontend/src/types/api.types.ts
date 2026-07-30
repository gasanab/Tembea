// ─── API Types matching Backend Prisma Schema ────────────────────────────────

export type UserRole = "CLIENT" | "PARTNER" | "ADMIN";

export type PartnerStatus = "PENDING" | "VERIFIED" | "SUSPENDED";

export type PartnerCategory = 
  | "ACCOMMODATION" 
  | "PARKS" 
  | "EVENTS" 
  | "MARKETPLACE" 
  | "RESTAURANTS" 
  | "TOURS" 
  | "TRANSPORT" 
  | "MUSEUMS" 
  | "MEMORIAL_SITES" 
  | "GUIDES";

export type ListingType = 
  | "ACCOMMODATION" 
  | "PARKS" 
  | "EVENTS" 
  | "MARKETPLACE" 
  | "RESTAURANTS" 
  | "TOURS" 
  | "TRANSPORT" 
  | "MUSEUMS" 
  | "MEMORIAL_SITES" 
  | "GUIDES";

export type ListingAvailability = "AVAILABLE" | "FEW_LEFT" | "FULLY_BOOKED" | "CLOSED";

export type BookingStatus = "PENDING" | "APPROVED" | "CONFIRMED" | "COMPLETED" | "REJECTED" | "CANCELLED";

export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED";

export type NotificationType = "INFO" | "SUCCESS" | "WARNING" | "ERROR";

export type OrderStatus = "PENDING" | "CONFIRMED" | "PREPARING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export type VehicleType = "CAR" | "BUS" | "VAN" | "MOTORBIKE" | "MINIBUS" | "TRUCK";

export type PayoutStatus = "PENDING" | "PROCESSING" | "PAID" | "REJECTED";

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  language?: string;
  region?: string;
  interests: string[];
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Partner ─────────────────────────────────────────────────────────────────

export interface Partner {
  id: string;
  userId: string;
  businessName: string;
  category: PartnerCategory;
  status: PartnerStatus;
  documents: string[];
  website?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export type PartnerSummary = Pick<
  Partner,
  "id" | "businessName" | "category" | "status"
>;

export type AuthenticatedUser = User & {
  partner?: PartnerSummary;
};

export type UpdateUserInput = Partial<
  Pick<User, "name" | "avatar" | "phone" | "language" | "region" | "interests">
>;

export type UpdatedUser = Pick<
  User,
  "id" | "name" | "email" | "role" | "avatar" | "phone" | "language" | "region" | "interests"
>;

// ─── Listing ─────────────────────────────────────────────────────────────────

export interface Listing {
  id: string;
  partnerId: string;
  type: ListingType;
  name: string;
  location: string;
  region: string;
  city?: string;
  description: string;
  images: string[];
  price: number;
  priceLabel: string;
  rating: number;
  reviewCount: number;
  availability: ListingAvailability;
  featured: boolean;
  published: boolean;
  coordinates?: { lat: number; lng: number };
  extraData: Record<string, any>;
  amenities?: string[];
  available?: number;
  reviews?: Array<{ id: string; rating: number; comment: string; user?: { name: string } }>;
  createdAt: string;
  updatedAt: string;
}

// ─── Room (for Accommodation) ─────────────────────────────────────────────────

export interface Room {
  id: string;
  listingId: string;
  name: string;
  description?: string;
  capacity: number;
  price: number;
  images: string[];
  amenities: string[];
  available: boolean;
  totalRooms: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Event Ticket Category ────────────────────────────────────────────────────

export interface EventTicketCategory {
  id: string;
  listingId: string;
  name: string;
  description?: string;
  price: number;
  totalSeats: number;
  soldSeats: number;
  color?: string;
  perks: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Product (Marketplace) ────────────────────────────────────────────────────

export interface Product {
  id: string;
  listingId: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  sold: number;
  images: string[];
  category?: string;
  sku?: string;
  weight?: number;
  tags: string[];
  featured: boolean;
  listing?: {
    id?: string;
    name: string;
    location: string;
    rating?: number;
    partnerId?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ─── Vehicle (Transport) ──────────────────────────────────────────────────────

export interface Vehicle {
  id: string;
  listingId: string;
  make: string;
  model: string;
  year?: number;
  type: VehicleType;
  capacity: number;
  plateNumber?: string;
  color?: string;
  transmission: string;
  fuelType: string;
  features: string[];
  pricePerDay: number;
  driverAvailable: boolean;
  driverName?: string;
  driverPhone?: string;
  driverLicense?: string;
  images: string[];
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Guide Profile ────────────────────────────────────────────────────────────

export interface GuideProfile {
  id: string;
  listingId: string;
  bio?: string;
  languages: string[];
  certifications: string[];
  yearsExperience?: number;
  specialties: string[];
  availability: string[];
  responseTime: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Tour Package ─────────────────────────────────────────────────────────────

export interface TourPackage {
  id: string;
  guideId: string;
  name: string;
  description?: string;
  duration: string;
  price: number;
  maxGuests: number;
  includes: string[];
  excludes: string[];
  itinerary?: string;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Experience Detail ────────────────────────────────────────────────────────

export interface ExperienceDetail {
  id: string;
  listingId: string;
  entryFee?: number;
  openingTime?: string;
  closingTime?: string;
  closedDays: string[];
  packages: string[];
  highlights: string[];
  ageLimit?: string;
  maxGroupSize?: number;
  guidedTours: boolean;
  bookingRequired: boolean;
  facilities: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Booking ──────────────────────────────────────────────────────────────────

export interface Booking {
  id: string;
  userId: string;
  listingId: string;
  type: ListingType;
  status: BookingStatus;
  amount: number;
  currency: string;
  guests: number;
  bookingData: Record<string, any>;
  roomId?: string;
  ticketCategoryId?: string;
  vehicleId?: string;
  listing?: Pick<Listing, "id" | "name" | "images" | "location" | "type">;
  payment?: Payment;
  createdAt: string;
  updatedAt: string;
}

// ─── Payment ──────────────────────────────────────────────────────────────────

export interface Payment {
  id: string;
  bookingId?: string;
  orderId?: string;
  gross: number;
  commission: number;
  net: number;
  currency: string;
  status: PaymentStatus;
  provider?: string;
  providerRef?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Order (Marketplace) ──────────────────────────────────────────────────────

export interface Order {
  id: string;
  clientReference?: string;
  userId: string;
  productId: string;
  quantity: number;
  amount: number;
  currency: string;
  status: OrderStatus;
  deliveryAddress?: string;
  deliveryNotes?: string;
  deliveryAgent?: string;
  trackingNumber?: string;
  product: Pick<Product, "name" | "images" | "price" | "category"> & {
    listing: {
      name: string;
      location: string;
      partnerId: string;
    };
  };
  payment?: Pick<Payment, "status" | "gross" | "net">;
  createdAt: string;
  updatedAt: string;
}

// ─── Review ───────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  userId: string;
  listingId: string;
  rating: number;
  comment: string;
  reply?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Notification ─────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export interface Wishlist {
  id: string;
  userId: string;
  listingId: string;
  listing: Listing;
  createdAt: string;
}

// ─── Conversation ─────────────────────────────────────────────────────────────

export interface Conversation {
  id: string;
  clientId: string;
  partnerId: string;
  listingId?: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

// ─── Message ──────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  read: boolean;
  createdAt: string;
}

// ─── Payout Request ───────────────────────────────────────────────────────────

export interface PayoutRequest {
  id: string;
  partnerId: string;
  userId: string;
  amount: number;
  currency: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  mobileNumber?: string;
  method: string;
  status: PayoutStatus;
  notes?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── API Response Wrapper ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: User;
  partner?: Partner;
}
