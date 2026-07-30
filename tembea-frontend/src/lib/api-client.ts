// ─── API Client with Cookie-based Auth ───────────────────────────────────────

import { getApiBaseUrl } from "./api-url";
import type {
  AuthenticatedUser,
  Booking,
  EventTicketCategory,
  Order,
  Payment,
  Product,
  Room,
  UpdatedUser,
  UpdateUserInput,
  Vehicle,
} from "@/types/api.types";
import type { SearchRequest, SearchResponse } from "@/types/search.types";

const API_BASE_URL = getApiBaseUrl();

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", // Include cookies for auth
    };

    try {
      const response = await fetch(url, config);
      
      // Handle non-JSON responses
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return {} as T;
      }

      const responseData = await response.json();

      if (!response.ok) {
        throw new ApiError(
          responseData.message ||
            responseData.error ||
            `HTTP ${response.status}: ${response.statusText}`,
          response.status,
        );
      }

      // Unwrap backend's global response interceptor format
      if (
        responseData && 
        typeof responseData === "object" && 
        "success" in responseData && 
        responseData.success === true &&
        "data" in responseData
      ) {
        return responseData.data as T;
      }

      return responseData as T;
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === "AbortError" ||
          error.message.includes("Failed to fetch") ||
          error.message.includes("ERR_CONNECTION_REFUSED"))
      ) {
        throw new Error("Cannot connect to the backend. Please make sure the API server is running.");
      }
      
      // Don't log 401/Unauthorized errors — they're expected when user is not authenticated
      if (
        error instanceof Error &&
        (error.message.includes("401") ||
          error.message.toLowerCase().includes("unauthorized"))
      ) {
        throw error;
      }
      
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryString = params 
      ? "?" + new URLSearchParams(
          Object.entries(params).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== null) {
              acc[key] = String(value);
            }
            return acc;
          }, {} as Record<string, string>)
        ).toString()
      : "";
    
    return this.request<T>(`${endpoint}${queryString}`, {
      method: "GET",
    });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Upload failed" }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    const responseData = await response.json();
    
    if (
      responseData &&
      typeof responseData === "object" &&
      "success" in responseData &&
      responseData.success === true &&
      "data" in responseData
    ) {
      return responseData.data as T;
    }

    return responseData as T;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// ─── Type-safe API Methods ────────────────────────────────────────────────────

export const listingsApi = {
  getAll: (params?: { type?: string; region?: string; featured?: boolean; page?: number; limit?: number }) =>
    apiClient.get<any>("/listings", params),
  
  getMine: () =>
    apiClient.get<any>("/listings/mine"),
  
  getOne: (id: string) =>
    apiClient.get<any>(`/listings/${id}`),
  
  create: (data: any) =>
    apiClient.post<any>("/listings", data),
  
  update: (id: string, data: any) =>
    apiClient.patch<any>(`/listings/${id}`, data),
  
  delete: (id: string) =>
    apiClient.delete<any>(`/listings/${id}`),
  
  updateImages: (id: string, images: string[]) =>
    apiClient.patch<any>(`/listings/${id}/images`, { images }),
  
  updateAvailability: (id: string, availability: string) =>
    apiClient.patch<any>(`/listings/${id}/availability`, { availability }),
};

export const searchApi = {
  get: (params: SearchRequest) =>
    apiClient.get<SearchResponse>("/search", params),
};

export const authApi = {
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    apiClient.post<any>("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<any>("/auth/login", data),
  
  logout: () =>
    apiClient.post<any>("/auth/logout"),
  
  getMe: () =>
    apiClient.get<any>("/auth/me"),
  
  forgotPassword: (email: string) =>
    apiClient.post<any>("/auth/forgot-password", { email }),
  
  resetPassword: (token: string, password: string) =>
    apiClient.post<any>("/auth/reset-password", { token, password }),
};

export const usersApi = {
  getMe: () => apiClient.get<AuthenticatedUser>("/users/me"),

  updateMe: (data: UpdateUserInput) =>
    apiClient.patch<UpdatedUser>("/users/me", data),
};

export const bookingsApi = {
  getAll: () =>
    apiClient.get<any>("/bookings"),
  
  getMyBookings: () =>
    apiClient.get<any>("/bookings"),

  getPartner: () =>
    apiClient.get<any>("/bookings/partner"),
  
  getPartnerStats: () =>
    apiClient.get<any>("/bookings/partner/stats"),
  
  getOne: (id: string) =>
    apiClient.get<Booking>(`/bookings/${id}`),
  
  create: (data: any) =>
    apiClient.post<any>("/bookings", data),
  
  updateStatus: (id: string, status: string) =>
    apiClient.patch<any>(`/bookings/${id}/status`, { status }),
  
  cancel: (id: string) =>
    apiClient.patch<any>(`/bookings/${id}/cancel`),
};

export const paymentsApi = {
  initiate: (data: {
    bookingId?: string;
    orderId?: string;
    provider?: "flutterwave";
  }) =>
    apiClient.post<{ payment: Payment; paymentLink?: string }>("/payments/initiate", data),
  
  findByBooking: (bookingId: string) =>
    apiClient.get<Payment | null>(`/payments/booking/${bookingId}`),

  findByOrder: (orderId: string) =>
    apiClient.get<Payment | null>(`/payments/order/${orderId}`),

  findOne: (paymentId: string) =>
    apiClient.get<Payment>(`/payments/${paymentId}`),
};

export type CreateOrderInput = {
  clientReference: string;
  productId: string;
  quantity: number;
  deliveryAddress: string;
  deliveryNotes?: string;
};

export const ordersApi = {
  create: (data: CreateOrderInput) =>
    apiClient.post<Order>("/orders", data),

  getMy: () =>
    apiClient.get<Order[]>("/orders/my"),

  getOne: (id: string) =>
    apiClient.get<Order>(`/orders/${id}`),

  cancel: (id: string) =>
    apiClient.patch<Order>(`/orders/${id}/cancel`),
};

export const reviewsApi = {
  getByListing: (listingId: string) =>
    apiClient.get<any>(`/reviews/listing/${listingId}`),
  
  create: (data: { listingId: string; rating: number; comment: string }) =>
    apiClient.post<any>("/reviews", data),
  
  update: (id: string, data: { rating?: number; comment?: string }) =>
    apiClient.patch<any>(`/reviews/${id}`, data),
  
  delete: (id: string) =>
    apiClient.delete<any>(`/reviews/${id}`),
};

export const wishlistApi = {
  getAll: () =>
    apiClient.get<any>("/wishlist"),
  
  add: (listingId: string) =>
    apiClient.post<any>(`/wishlist/${listingId}`),
  
  remove: (listingId: string) =>
    apiClient.delete<any>(`/wishlist/${listingId}`),
  
  check: (listingId: string) =>
    apiClient.get<any>(`/wishlist/${listingId}/check`),
};

export const messagesApi = {
  getConversations: () =>
    apiClient.get<any>("/messages/conversations"),
  
  getMessages: (conversationId: string) =>
    apiClient.get<any>(`/messages/conversations/${conversationId}`),
  
  sendMessage: (conversationId: string, body: string) =>
    apiClient.post<any>(`/messages/conversations/${conversationId}/send`, { body }),
  
  createConversation: (partnerId: string, listingId?: string, firstMessage = "Hello, I would like to learn more.") =>
    apiClient.post<any>("/messages/conversations", { partnerId, listingId, firstMessage }),
};

export const uploadsApi = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.upload<any>("/uploads/image", formData);
  },
  
  uploadMultiple: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return apiClient.upload<any>("/uploads/images", formData);
  },

  uploadVerificationDocument: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.upload<{ documentId: string }>(
      "/uploads/verification-document",
      formData,
    );
  },

  uploadDocument: async (file: File) => {
    const result = await uploadsApi.uploadVerificationDocument(file);
    return { url: result.documentId };
  },
};

export const adminApi = {
  getAllListings: (params?: { page?: number; limit?: number; published?: boolean }) =>
    apiClient.get<any>("/listings/admin/all", params),
  
  createListing: (data: any) =>
    apiClient.post<any>("/listings", data),
  
  approveListing: (id: string) =>
    apiClient.patch<any>(`/listings/${id}/admin/publish`),
  
  rejectListing: (id: string) =>
    apiClient.patch<any>(`/listings/${id}/admin/reject`),
  
  getAllUsers: (params?: { page?: number; limit?: number; role?: string }) =>
    apiClient.get<any>("/users", params),

  getAllPartners: (params?: { page?: number; limit?: number; status?: string }) =>
    apiClient.get<any>("/verification/all", params),

  verifyPartner: (id: string, status = "VERIFIED") =>
    apiClient.patch<any>(`/verification/${id}/status`, { status }),
  
  suspendPartner: (id: string) =>
    apiClient.patch<any>(`/verification/${id}/status`, { status: "SUSPENDED" }),
  
  getEarnings: (params?: { startDate?: string; endDate?: string }) =>
    apiClient.get<any>("/earnings/admin", params),
  
  getReports: (params?: { type?: string; startDate?: string; endDate?: string }) =>
    apiClient.get<any>("/reports", params),
  
  getBookings: (params?: { page?: number; limit?: number }) =>
    apiClient.get<any>("/bookings", params),
  
  getTransactions: (params?: { page?: number; limit?: number }) =>
    apiClient.get<any>("/payments/transactions", params),
};

export const partnerApi = {
  getEarnings: (params?: { startDate?: string; endDate?: string }) =>
    apiClient.get<any>("/earnings", params),
  
  requestPayout: (data: { amount: number; method: string; bankName?: string; accountName?: string; accountNumber?: string; mobileNumber?: string }) =>
    apiClient.post<any>("/earnings/payout-request", data),
  
  getPayouts: () =>
    apiClient.get<any>("/earnings/payout-requests"),
  
  getCustomers: () =>
    apiClient.get<any>("/messages/conversations"),
};

// ─── Events API ──────────────────────────────────────────────────────────────

export const eventsApi = {
  create: (data: any) =>
    apiClient.post<EventTicketCategory>("/event-tickets", data),
  
  update: (id: string, data: any) =>
    apiClient.patch<EventTicketCategory>(`/event-tickets/${id}`, data),
  
  delete: (id: string) =>
    apiClient.delete<{ message: string }>(`/event-tickets/${id}`),
  
  getTicketCategories: (listingId: string) =>
    apiClient.get<EventTicketCategory[]>(`/event-tickets/listing/${listingId}`),
  
  createTicketCategory: (_eventId: string, data: any) =>
    apiClient.post<any>("/event-tickets", data),
  
  updateTicketCategory: (_eventId: string, categoryId: string, data: any) =>
    apiClient.patch<any>(`/event-tickets/${categoryId}`, data),
  
  deleteTicketCategory: (_eventId: string, categoryId: string) =>
    apiClient.delete<any>(`/event-tickets/${categoryId}`),
};

export const roomsApi = {
  getByListing: (listingId: string) =>
    apiClient.get<Room[]>(`/rooms/listing/${listingId}`),

  create: (
    data: Pick<Room, "listingId" | "name" | "capacity" | "price"> &
      Partial<Pick<Room, "description" | "images" | "amenities" | "totalRooms">>,
  ) => apiClient.post<Room>("/rooms", data),

  update: (
    id: string,
    data: Partial<
      Pick<
        Room,
        "name" | "description" | "capacity" | "price" | "images" | "amenities" | "totalRooms"
      >
    >,
  ) => apiClient.patch<Room>(`/rooms/${id}`, data),

  updateAvailability: (id: string, available: boolean) =>
    apiClient.patch<Room>(`/rooms/${id}/availability`, { available }),

  delete: (id: string) => apiClient.delete<{ message: string }>(`/rooms/${id}`),
};

// ─── Products API ────────────────────────────────────────────────────────────

export const productsApi = {
  getByListing: (listingId: string) =>
    apiClient.get<Product[]>(`/products/listing/${listingId}`),

  create: (data: any) =>
    apiClient.post<Product>("/products", data),
  
  update: (id: string, data: any) =>
    apiClient.patch<Product>(`/products/${id}`, data),
  
  delete: (id: string) =>
    apiClient.delete<{ message: string }>(`/products/${id}`),
  
  updateInventory: (id: string, stock: number, reason?: string) =>
    apiClient.patch<Product>(`/products/${id}/inventory`, { stock, reason }),
};

// ─── Orders API (Extended) ───────────────────────────────────────────────────

export const ordersApiExtended = {
  assignDelivery: (id: string, data: { deliveryAgent: string; agentPhone: string; trackingNumber?: string }) =>
    apiClient.patch<any>(`/orders/${id}/assign-delivery`, data),
  
  cancel: (id: string, reason?: string) =>
    apiClient.patch<any>(`/orders/${id}/cancel`, { reason }),
};

// ─── Vehicles API ────────────────────────────────────────────────────────────

export const vehiclesApi = {
  getByListing: (listingId: string) =>
    apiClient.get<Vehicle[]>(`/vehicles/listing/${listingId}`),

  create: (data: any) =>
    apiClient.post<Vehicle>("/vehicles", data),
  
  update: (id: string, data: any) =>
    apiClient.patch<Vehicle>(`/vehicles/${id}`, data),
  
  delete: (id: string) =>
    apiClient.delete<{ message: string }>(`/vehicles/${id}`),
  
  assignDriver: (id: string, data: { driverName: string; driverPhone: string; driverLicense: string }) =>
    apiClient.patch<any>(`/vehicles/${id}/assign-driver`, data),
  
  updateAvailability: (id: string, available: boolean) =>
    apiClient.patch<any>(`/vehicles/${id}/availability`, { available }),
};

// ─── Guides API ──────────────────────────────────────────────────────────────

export const guidesApi = {
  createProfile: (data: any) =>
    apiClient.post<any>("/guides/profile", data),
  
  updateProfile: (id: string, data: any) =>
    apiClient.patch<any>(`/guides/profile/${id}`, data),
  
  getProfile: (id: string) =>
    apiClient.get<any>(`/guides/profile/${id}`),
  
  createTourPackage: (guideId: string, data: any) =>
    apiClient.post<any>("/guides/packages", { ...data, guideId }),
  
  updateTourPackage: (guideId: string, packageId: string, data: any) =>
    apiClient.patch<any>(`/guides/packages/${packageId}`, data),
  
  deleteTourPackage: (guideId: string, packageId: string) =>
    apiClient.delete<any>(`/guides/packages/${packageId}`),
  
  getTourPackages: (guideId: string) =>
    apiClient.get<any>(`/guides/profile/${guideId}`),
};

// ─── Experiences API ─────────────────────────────────────────────────────────

export const experiencesApi = {
  create: (data: any) =>
    apiClient.post<any>("/experiences", data),
  
  update: (id: string, data: any) =>
    apiClient.patch<any>(`/experiences/${id}`, data),
  
  delete: (id: string) =>
    apiClient.delete<any>(`/experiences/${id}`),
  
  updateAvailability: (id: string, data: { date: string; slotsAvailable: number; timeSlot?: string }) =>
    apiClient.patch<any>(`/experiences/${id}/availability`, data),
};

// ─── Notifications API (Extended) ────────────────────────────────────────────

export const notificationsApiExtended = {
  getUnread: () =>
    apiClient.get<any>("/notifications/unread-count"),
  
  deleteAll: () =>
    apiClient.patch<any>("/notifications/read-all"),
};

// ─── Verification API ────────────────────────────────────────────────────────

export const verificationApi = {
  apply: (data: {
    businessName: string;
    category: string;
    documents: string[];
    phone?: string;
    website?: string;
  }) => apiClient.post<any>("/verification/apply", data),

  verifyPartner: (partnerId: string, status: string, notes?: string) =>
    apiClient.patch<any>(`/verification/${partnerId}/status`, { status, notes }),
  
  suspendPartner: (partnerId: string, reason: string, suspendedUntil?: string) =>
    apiClient.patch<any>(`/verification/${partnerId}/status`, { status: "SUSPENDED", reason, suspendedUntil }),
  
  verifyListing: (listingId: string, approved: boolean, notes?: string) =>
    apiClient.patch<any>(`/verification/listings/${listingId}`, { approved, notes }),
  
  getPendingPartners: () =>
    apiClient.get<any>("/verification"),
  
  getPendingListings: () =>
    apiClient.get<any>("/listings/admin/all", { published: false }),
};

// ─── Analytics API ───────────────────────────────────────────────────────────

export const analyticsApi = {
  getOverview: () =>
    apiClient.get<any>("/analytics/overview"),
  
  getListingStats: () =>
    apiClient.get<any>("/analytics/listings"),
  
  getBookingStats: (params: { startDate?: string; endDate?: string; region?: string; type?: string }) =>
    apiClient.get<any>("/analytics/bookings", params),
  
  getPartnerAnalytics: (params: { startDate?: string; endDate?: string; partnerId?: string }) =>
    apiClient.get<any>("/analytics/partner", params),
};

// ─── AI API ──────────────────────────────────────────────────────────────────
