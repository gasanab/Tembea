const fs = require('fs');
const content = fs.readFileSync('src/lib/api-client.ts', 'utf-8');
const idx = content.indexOf('export const listingsApi');
const baseContent = idx !== -1 ? content.substring(0, idx) : content;

const appendedContent = `export const listingsApi = {
  getAll: (params?: { type?: string; region?: string; featured?: boolean; page?: number; limit?: number }) =>
    apiClient.get<any>("/listings", params),
  
  getMine: () =>
    apiClient.get<any>("/listings/mine"),
  
  getOne: (id: string) =>
    apiClient.get<any>(\`/listings/\${id}\`),
  
  create: (data: any) =>
    apiClient.post<any>("/listings", data),
  
  update: (id: string, data: any) =>
    apiClient.patch<any>(\`/listings/\${id}\`, data),
  
  delete: (id: string) =>
    apiClient.delete<any>(\`/listings/\${id}\`),

  togglePublish: (id: string) =>
    apiClient.patch<any>(\`/listings/\${id}/publish\`),
  
  updateImages: (id: string, images: string[]) =>
    apiClient.patch<any>(\`/listings/\${id}/images\`, { images }),
  
  updateAvailability: (id: string, availability: string) =>
    apiClient.patch<any>(\`/listings/\${id}/availability\`, { availability }),
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

export const bookingsApi = {
  getAll: () =>
    apiClient.get<any>("/bookings"),

  getPartner: () =>
    apiClient.get<any>("/bookings/partner"),
  
  getPartnerStats: () =>
    apiClient.get<any>("/bookings/partner/stats"),
  
  getOne: (id: string) =>
    apiClient.get<any>(\`/bookings/\${id}\`),
  
  create: (data: any) =>
    apiClient.post<any>("/bookings", data),
  
  updateStatus: (id: string, status: string) =>
    apiClient.patch<any>(\`/bookings/\${id}/status\`, { status }),
  
  cancel: (id: string) =>
    apiClient.patch<any>(\`/bookings/\${id}/cancel\`),
};

export const paymentsApi = {
  initiate: (data: { bookingId?: string; orderId?: string; amount: number; provider: string }) =>
    apiClient.post<any>("/payments/initiate", data),
  
  findByBooking: (bookingId: string) =>
    apiClient.get<any>(\`/payments/booking/\${bookingId}\`),
  
  webhook: (data: any) =>
    apiClient.post<any>("/payments/webhook", data),
};

export const reviewsApi = {
  getByListing: (listingId: string) =>
    apiClient.get<any>(\`/reviews/listing/\${listingId}\`),
  
  create: (data: { listingId: string; rating: number; comment: string }) =>
    apiClient.post<any>("/reviews", data),
  
  update: (id: string, data: { rating?: number; comment?: string }) =>
    apiClient.patch<any>(\`/reviews/\${id}\`, data),
  
  delete: (id: string) =>
    apiClient.delete<any>(\`/reviews/\${id}\`),
};

export const wishlistApi = {
  getAll: () =>
    apiClient.get<any>("/wishlist"),
  
  add: (listingId: string) =>
    apiClient.post<any>(\`/wishlist/\${listingId}\`),
  
  remove: (listingId: string) =>
    apiClient.delete<any>(\`/wishlist/\${listingId}\`),
  
  check: (listingId: string) =>
    apiClient.get<any>(\`/wishlist/\${listingId}/check\`),
};

export const messagesApi = {
  getConversations: () =>
    apiClient.get<any>("/messages/conversations"),
  
  getMessages: (conversationId: string) =>
    apiClient.get<any>(\`/messages/conversations/\${conversationId}\`),
  
  sendMessage: (conversationId: string, body: string) =>
    apiClient.post<any>(\`/messages/conversations/\${conversationId}/send\`, { body }),
  
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
};

export const adminApi = {
  getAllListings: (params?: { page?: number; limit?: number; published?: boolean }) =>
    apiClient.get<any>("/listings/admin/all", params),
  
  approveListing: (id: string) =>
    apiClient.patch<any>(\`/listings/\${id}/admin/publish\`),
  
  rejectListing: (id: string) =>
    apiClient.patch<any>(\`/listings/\${id}/admin/reject\`),
  
  getAllUsers: (params?: { page?: number; limit?: number; role?: string }) =>
    apiClient.get<any>("/users", params),
  
  getAllPartners: (params?: { page?: number; limit?: number; status?: string }) =>
    apiClient.get<any>("/verification/all", params),
  
  verifyPartner: (id: string, status = "VERIFIED") =>
    apiClient.patch<any>(\`/verification/\${id}/status\`, { status }),
  
  suspendPartner: (id: string) =>
    apiClient.patch<any>(\`/verification/\${id}/status\`, { status: "SUSPENDED" }),
  
  getEarnings: (params?: { startDate?: string; endDate?: string }) =>
    apiClient.get<any>("/earnings/admin", params),
  
  getReports: (params?: { type?: string; startDate?: string; endDate?: string }) =>
    apiClient.get<any>("/reports", params),
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
    apiClient.post<any>("/event-tickets", data),
  
  update: (id: string, data: any) =>
    apiClient.patch<any>(\`/event-tickets/\${id}\`, data),
  
  delete: (id: string) =>
    apiClient.delete<any>(\`/event-tickets/\${id}\`),
  
  getTicketCategories: (listingId: string) =>
    apiClient.get<any>(\`/event-tickets/listing/\${listingId}\`),
  
  createTicketCategory: (_eventId: string, data: any) =>
    apiClient.post<any>("/event-tickets", data),
  
  updateTicketCategory: (_eventId: string, categoryId: string, data: any) =>
    apiClient.patch<any>(\`/event-tickets/\${categoryId}\`, data),
  
  deleteTicketCategory: (_eventId: string, categoryId: string) =>
    apiClient.delete<any>(\`/event-tickets/\${categoryId}\`),
};

// ─── Products API ────────────────────────────────────────────────────────────

export const productsApi = {
  create: (data: any) =>
    apiClient.post<any>("/products", data),
  
  update: (id: string, data: any) =>
    apiClient.patch<any>(\`/products/\${id}\`, data),
  
  delete: (id: string) =>
    apiClient.delete<any>(\`/products/\${id}\`),
  
  updateInventory: (id: string, stock: number, reason?: string) =>
    apiClient.patch<any>(\`/products/\${id}/inventory\`, { stock, reason }),
  
  getCategories: () =>
    apiClient.get<any>("/products/search", { q: "" }),
  
  createCategory: (data: { name: string; description?: string; image?: string }) =>
    Promise.resolve(data),
};

// ─── Orders API (Extended) ───────────────────────────────────────────────────

export const ordersApiExtended = {
  assignDelivery: (id: string, data: { deliveryAgent: string; agentPhone: string; trackingNumber?: string }) =>
    apiClient.patch<any>(\`/orders/\${id}/assign-delivery\`, data),
  
  cancel: (id: string, reason?: string) =>
    apiClient.patch<any>(\`/orders/\${id}/cancel\`, { reason }),
};

// ─── Vehicles API ────────────────────────────────────────────────────────────

export const vehiclesApi = {
  create: (data: any) =>
    apiClient.post<any>("/vehicles", data),
  
  update: (id: string, data: any) =>
    apiClient.patch<any>(\`/vehicles/\${id}\`, data),
  
  delete: (id: string) =>
    apiClient.delete<any>(\`/vehicles/\${id}\`),
  
  assignDriver: (id: string, data: { driverName: string; driverPhone: string; driverLicense: string }) =>
    apiClient.patch<any>(\`/vehicles/\${id}/assign-driver\`, data),
  
  updateAvailability: (id: string, available: boolean) =>
    apiClient.patch<any>(\`/vehicles/\${id}/availability\`, { available }),
};

// ─── Guides API ──────────────────────────────────────────────────────────────

export const guidesApi = {
  createProfile: (data: any) =>
    apiClient.post<any>("/guides/profile", data),
  
  updateProfile: (id: string, data: any) =>
    apiClient.patch<any>(\`/guides/profile/\${id}\`, data),
  
  getProfile: (id: string) =>
    apiClient.get<any>(\`/guides/profile/\${id}\`),
  
  createTourPackage: (guideId: string, data: any) =>
    apiClient.post<any>("/guides/packages", { ...data, guideId }),
  
  updateTourPackage: (guideId: string, packageId: string, data: any) =>
    apiClient.patch<any>(\`/guides/packages/\${packageId}\`, data),
  
  deleteTourPackage: (guideId: string, packageId: string) =>
    apiClient.delete<any>(\`/guides/packages/\${packageId}\`),
  
  getTourPackages: (guideId: string) =>
    apiClient.get<any>(\`/guides/profile/\${guideId}\`),
};

// ─── Experiences API ─────────────────────────────────────────────────────────

export const experiencesApi = {
  create: (data: any) =>
    apiClient.post<any>("/experiences", data),
  
  update: (id: string, data: any) =>
    apiClient.patch<any>(\`/experiences/\${id}\`, data),
  
  delete: (id: string) =>
    apiClient.delete<any>(\`/experiences/\${id}\`),
  
  updateAvailability: (id: string, data: { date: string; slotsAvailable: number; timeSlot?: string }) =>
    apiClient.patch<any>(\`/experiences/\${id}/availability\`, data),
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
  verifyPartner: (partnerId: string, status: string, notes?: string) =>
    apiClient.patch<any>(\`/verification/\${partnerId}/status\`, { status, notes }),
  
  suspendPartner: (partnerId: string, reason: string, suspendedUntil?: string) =>
    apiClient.patch<any>(\`/verification/\${partnerId}/status\`, { status: "SUSPENDED", reason, suspendedUntil }),
  
  verifyListing: (listingId: string, approved: boolean, notes?: string) =>
    apiClient.patch<any>(\`/verification/listings/\${listingId}\`, { approved, notes }),
  
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

export const aiApi = {
  search: (query: string, filters?: { type?: string; region?: string; maxPrice?: number; limit?: number }) =>
    apiClient.post<any>("/ai/search", { query, ...filters }),
  
  getRecommendations: (userId?: string, type?: string, limit: number = 10) =>
    apiClient.get<any>("/ai/recommendations", { userId, type, limit }),
  
  chat: (message: string, context?: string, history?: string[]) =>
    apiClient.post<any>("/ai/chat", { message, context, history }),
  
  suggestItinerary: (params: { days: number; region?: string; interests?: string[]; budget?: number }) =>
    apiClient.post<any>("/ai/itinerary", params),
};
`;

fs.writeFileSync('src/lib/api-client.ts', baseContent + appendedContent);
