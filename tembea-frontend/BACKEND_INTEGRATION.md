# Tembea Frontend-Backend Integration

## Overview
This document describes the integration between the Tembea frontend (Next.js) and backend (NestJS) applications.

## Architecture

### Backend (NestJS)
- **Port**: 4000
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Cookie-based JWT (cookie name: `tembea_token`)
- **API Docs**: http://localhost:4000/api/docs
- **Base URL**: `http://localhost:4000/api`

### Frontend (Next.js)
- **Port**: 3000
- **API Client**: Custom fetch wrapper with cookie auth
- **Environment**: `.env.local`
- **Base URL**: Configured via `NEXT_PUBLIC_API_URL`

## Configuration

### Frontend Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_APP_NAME=Tembea
```

### Backend Environment Variables
```env
DATABASE_URL=postgresql://postgres:3457@localhost:5432/TEMBEA
PORT=4000
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
```

## API Integration Layer

### 1. API Client (`src/lib/api-client.ts`)
- Centralized HTTP client with cookie-based authentication
- Automatic JSON serialization/deserialization
- Error handling and logging
- Type-safe API methods for all modules

### 2. Type Definitions (`src/types/api.types.ts`)
Complete TypeScript interfaces matching the backend Prisma schema:
- User, Partner, Listing, Booking, Payment
- Room, EventTicketCategory, Product, Vehicle
- GuideProfile, TourPackage, ExperienceDetail
- Review, Notification, Wishlist, Conversation, Message
- PayoutRequest, Order

### 3. Custom Hooks (`src/hooks/useListings.ts`)
React hooks for data fetching:
- `useListings()` - Fetch listings with filters
- `useListing(id)` - Fetch single listing
- `useFeaturedListings(limit)` - Fetch featured listings
- `useListingsByType(type, limit)` - Fetch by category

### 4. Authentication Context (`src/context/AuthContext.tsx`)
- Cookie-based authentication
- Auto-refresh on mount
- Login/Register/Logout functions
- User and Partner state management

## Data Flow

### Listing Data Flow
```
Backend (Prisma) → API → API Client → Custom Hook → Component
```

### Backend Listing Type → Frontend Category Mapping
```typescript
ACCOMMODATION → hotels
PARKS → parks
EVENTS → events
MARKETPLACE → marketplace
RESTAURANTS → restaurants
TOURS → tours
TRANSPORT → transport
MUSEUMS → museums
MEMORIAL_SITES → memorial-sites
GUIDES → tour-guides
```

## Key Differences: Old vs New

### Old (Mock Data)
```typescript
// Used hardcoded mock data
import { listings } from "@/data/tourism/listings";
const featured = listings.filter(l => l.featured);
```

### New (API Integration)
```typescript
// Uses backend API
import { useFeaturedListings } from "@/hooks/useListings";
const { listings: featured, isLoading } = useFeaturedListings(8);
```

## API Endpoints

### Listings
- `GET /listings` - Get all published listings
- `GET /listings/mine` - Get partner's listings
- `GET /listings/:id` - Get single listing
- `POST /listings` - Create listing (partner)
- `PATCH /listings/:id` - Update listing
- `PATCH /listings/:id/publish` - Toggle publish
- `DELETE /listings/:id` - Delete listing

### Authentication
- `POST /auth/register` - Register user
- `POST /auth/login` - Login (sets cookie)
- `POST /auth/logout` - Logout (clears cookie)
- `GET /auth/me` - Get current user

### Bookings
- `GET /bookings` - Get user's bookings
- `POST /bookings` - Create booking
- `PATCH /bookings/:id/status` - Update status

### Payments
- `POST /payments/initiate` - Start payment
- `GET /payments/verify/:id` - Verify payment

### Reviews
- `GET /reviews/listing/:id` - Get listing reviews
- `POST /reviews` - Create review

### Wishlist
- `GET /wishlist` - Get user's wishlist
- `POST /wishlist` - Add to wishlist
- `DELETE /wishlist/:id` - Remove from wishlist

### Messages
- `GET /messages/conversations` - Get conversations
- `POST /messages/conversations` - Create conversation
- `POST /messages/:id/send` - Send message

### Admin
- `GET /listings/admin/all` - All listings (including unpublished)
- `PATCH /listings/:id/admin/publish` - Approve listing
- `PATCH /listings/:id/admin/reject` - Reject listing

### Partner
- `GET /partner/earnings` - Get earnings
- `POST /partner/payouts` - Request payout
- `GET /partner/payouts` - Get payout history
- `GET /partner/customers` - Get customers

## Running the Application

### 1. Start Backend
```bash
cd tembea-backend
npm install
npm run start:dev
```
Backend runs on http://localhost:4000

### 2. Start Frontend
```bash
cd tembea-frontend
npm install
npm run dev
```
Frontend runs on http://localhost:3000

### 3. Access API Documentation
Open http://localhost:4000/api/docs in your browser

## Authentication Flow

1. User submits login form
2. Frontend calls `POST /auth/login` with credentials
3. Backend validates and sets `tembea_token` cookie
4. Frontend stores user data in AuthContext
5. Subsequent requests automatically include cookie via `credentials: "include"`
6. Backend validates cookie on protected routes

## Error Handling

- API client catches and logs errors
- Components show loading states
- User-friendly error messages
- Graceful fallbacks for missing data

## Next Steps

1. ✅ Fix EIO error and clean cache
2. ✅ Update API URL configuration
3. ✅ Create API types matching backend
4. ✅ Build API client with cookie auth
5. ✅ Create custom hooks for data fetching
6. ✅ Update AuthContext for backend integration
7. ✅ Update ListingCard component
8. ✅ Update homepage to use API
9. ⏳ Update category pages (hotels, restaurants, etc.)
10. ⏳ Update detail pages
11. ⏳ Integrate booking flow
12. ⏳ Add payment integration
13. ⏳ Test complete user flows

## Notes

- Backend uses uppercase enum values (e.g., "ACCOMMODATION")
- Frontend uses lowercase slugs (e.g., "hotels")
- Mapping is handled in components and hooks
- Images use Next.js Image component with optimization
- All dates are ISO strings from backend
- Prices are in USD by default