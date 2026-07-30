# Tembea Backend - Missing DTOs and Modules Analysis

## Executive Summary
After analyzing the backend structure, I found that **most modules already exist** but are missing critical DTOs for complete CRUD operations. This document provides a comprehensive audit and the missing DTO definitions.

## Existing Modules ✅
- listings (with Create, Update, Filter, Image, Availability DTOs)
- rooms (with Create, Update, Availability DTOs)
- event-tickets
- products
- orders
- vehicles
- guides
- experiences
- bookings
- payments
- reviews
- messages
- notifications
- wishlist
- earnings
- reports
- analytics
- search
- ai
- verification
- settings
- uploads
- users

## Missing DTOs by Module

### 1. LISTINGS MODULE
**Existing:** CreateListingDto, UpdateListingDto, ListingFilterDto, ListingImageDto, ListingAvailabilityDto

**Missing:**
- `DeleteListingDto` - For soft/hard delete with reason
- `BulkUpdateListingDto` - For batch operations
- `ListingSearchDto` - Advanced search with filters

### 2. ROOMS MODULE (Hotels/Apartments)
**Existing:** CreateRoomDto, UpdateRoomDto, UpdateRoomAvailabilityDto

**Missing:**
- `RoomPricingDto` - Seasonal/dynamic pricing
  ```typescript
  export class RoomPricingDto {
    @IsNumber() @Min(0) price: number;
    @IsString() season?: string; // "peak", "off-peak", "holiday"
    @IsDateString() startDate: string;
    @IsDateString() endDate: string;
  }
  ```
- `BulkRoomUpdateDto` - Update multiple rooms
- `RoomAvailabilityCalendarDto` - Calendar-based availability

### 3. EVENT TICKETS MODULE
**Existing:** Basic structure

**Missing:**
- `CreateEventDto` - Extended event details
  ```typescript
  export class CreateEventDto {
    @IsString() venue: string;
    @IsDateString() date: string;
    @IsString() time: string;
    @IsString() category: string;
    @IsString() bannerImage: string;
    @IsInt() ticketsAvailable: number;
    @IsNumber() ticketPrice: number;
  }
  ```
- `UpdateEventDto` - Modify event details
- `CreateTicketCategoryDto` - VIP, Premium, Standard, Student
  ```typescript
  export class CreateTicketCategoryDto {
    @IsString() name: string;
    @IsString() description?: string;
    @IsNumber() @Min(0) price: number;
    @IsInt() @Min(1) totalSeats: number;
    @IsOptional() @IsString() color?: string;
    @IsOptional() @IsArray() @IsString() perks?: string[];
  }
  ```
- `UpdateTicketCategoryDto`
- `CheckTicketAvailabilityDto`

### 4. PRODUCTS MODULE (Made in Rwanda)
**Existing:** Basic structure

**Missing:**
- `CreateProductDto`
  ```typescript
  export class CreateProductDto {
    @IsString() name: string;
    @IsOptional() @IsString() description?: string;
    @IsNumber() @Min(0) price: number;
    @IsInt() @Min(0) stock: number;
    @IsArray() @IsString() images: string[];
    @IsOptional() @IsString() category?: string;
    @IsOptional() @IsString() sku?: string;
    @IsOptional() @IsNumber() weight?: number;
    @IsOptional() @IsArray() @IsString() tags?: string[];
    @IsOptional() @IsBoolean() featured?: boolean;
  }
  ```
- `UpdateProductDto`
- `UpdateInventoryDto` - Stock management
  ```typescript
  export class UpdateInventoryDto {
    @IsInt() @Min(0) stock: number;
    @IsOptional() @IsString() reason?: string; // "restock", "adjustment", "return"
  }
  ```
- `CreateCategoryDto` - Product categories
  ```typescript
  export class CreateCategoryDto {
    @IsString() name: string;
    @IsOptional() @IsString() description?: string;
    @IsOptional() @IsString() image?: string;
  }
  ```

### 5. ORDERS MODULE
**Existing:** Basic structure

**Missing:**
- `CreateOrderDto`
  ```typescript
  export class CreateOrderDto {
    @IsString() productId: string;
    @IsInt() @Min(1) quantity: number;
    @IsOptional() @IsString() deliveryAddress?: string;
    @IsOptional() @IsString() deliveryNotes?: string;
  }
  ```
- `UpdateOrderStatusDto`
  ```typescript
  export class UpdateOrderStatusDto {
    @IsEnum(OrderStatus) status: OrderStatus;
    @IsOptional() @IsString() trackingNumber?: string;
    @IsOptional() @IsString() deliveryAgent?: string;
  }
  ```
- `AssignDeliveryDto`
  ```typescript
  export class AssignDeliveryDto {
    @IsString() deliveryAgent: string;
    @IsString() agentPhone: string;
    @IsOptional() @IsString() trackingNumber?: string;
  }
  ```
- `BulkUpdateOrderStatusDto`

### 6. VEHICLES MODULE (Transport)
**Existing:** Basic structure

**Missing:**
- `CreateVehicleDto`
  ```typescript
  export class CreateVehicleDto {
    @IsString() listingId: string;
    @IsString() make: string;
    @IsString() model: string;
    @IsOptional() @IsInt() year?: number;
    @IsEnum(VehicleType) type: VehicleType;
    @IsInt() @Min(1) capacity: number;
    @IsOptional() @IsString() plateNumber?: string;
    @IsOptional() @IsString() color?: string;
    @IsString() transmission: string;
    @IsString() fuelType: string;
    @IsArray() @IsString() features: string[];
    @IsNumber() @Min(0) pricePerDay: number;
    @IsOptional() @IsBoolean() driverAvailable?: boolean;
    @IsOptional() @IsString() driverName?: string;
    @IsOptional() @IsString() driverPhone?: string;
    @IsOptional() @IsString() driverLicense?: string;
    @IsArray() @IsString() images: string[];
  }
  ```
- `UpdateVehicleDto`
- `AssignDriverDto`
  ```typescript
  export class AssignDriverDto {
    @IsString() driverName: string;
    @IsString() driverPhone: string;
    @IsString() driverLicense: string;
  }
  ```
- `VehicleAvailabilityDto`

### 7. GUIDES MODULE
**Existing:** Basic structure

**Missing:**
- `CreateGuideProfileDto`
  ```typescript
  export class CreateGuideProfileDto {
    @IsString() listingId: string;
    @IsOptional() @IsString() bio?: string;
    @IsArray() @IsString() languages: string[];
    @IsArray() @IsString() certifications: string[];
    @IsOptional() @IsInt() yearsExperience?: number;
    @IsArray() @IsString() specialties: string[];
    @IsArray() @IsString() availability: string[];
    @IsOptional() @IsString() responseTime?: string;
  }
  ```
- `UpdateGuideProfileDto`
- `CreateTourPackageDto`
  ```typescript
  export class CreateTourPackageDto {
    @IsString() guideId: string;
    @IsString() name: string;
    @IsOptional() @IsString() description?: string;
    @IsString() duration: string;
    @IsNumber() @Min(0) price: number;
    @IsInt() @Min(1) maxGuests: number;
    @IsArray() @IsString() includes: string[];
    @IsArray() @IsString() excludes: string[];
    @IsOptional() @IsString() itinerary?: string;
  }
  ```
- `UpdateTourPackageDto`
- `GuideAvailabilityDto`

### 8. EXPERIENCES MODULE
**Existing:** Basic structure

**Missing:**
- `CreateExperienceDto`
  ```typescript
  export class CreateExperienceDto {
    @IsString() listingId: string;
    @IsOptional() @IsNumber() entryFee?: number;
    @IsOptional() @IsString() openingTime?: string;
    @IsOptional() @IsString() closingTime?: string;
    @IsArray() @IsString() closedDays: string[];
    @IsArray() @IsString() packages: string[];
    @IsArray() @IsString() highlights: string[];
    @IsOptional() @IsString() ageLimit?: string;
    @IsOptional() @IsInt() maxGroupSize?: number;
    @IsBoolean() guidedTours: boolean;
    @IsBoolean() bookingRequired: boolean;
    @IsArray() @IsString() facilities: string[];
  }
  ```
- `UpdateExperienceDto`
- `ExperienceAvailabilityDto`
  ```typescript
  export class ExperienceAvailabilityDto {
    @IsDateString() date: string;
    @IsInt() @Min(0) slotsAvailable: number;
    @IsOptional() @IsString() timeSlot?: string;
  }
  ```

### 9. RESERVATIONS MODULE (New)
**Missing entirely - needs new module:**
- `CreateReservationDto`
  ```typescript
  export class CreateReservationDto {
    @IsString() listingId: string;
    @IsEnum(ListingType) type: ListingType;
    @IsDateString() date: string;
    @IsOptional() @IsString() time?: string;
    @IsInt() @Min(1) guests: number;
    @IsOptional() @IsString() specialRequests?: string;
    @IsOptional() @IsString() tableNumber?: string; // for restaurants
    @IsOptional() @IsString() roomId?: string; // for hotels
  }
  ```
- `UpdateReservationStatusDto`
  ```typescript
  export class UpdateReservationStatusDto {
    @IsEnum(BookingStatus) status: BookingStatus;
    @IsOptional() @IsString() notes?: string;
  }
  ```

### 10. NOTIFICATIONS MODULE
**Existing:** Basic structure

**Missing:**
- `CreateNotificationDto`
  ```typescript
  export class CreateNotificationDto {
    @IsString() userId: string;
    @IsString() title: string;
    @IsString() message: string;
    @IsEnum(NotificationType) type: NotificationType;
  }
  ```
- `SendBulkNotificationDto`
  ```typescript
  export class SendBulkNotificationDto {
    @IsArray() @IsString() userIds: string[];
    @IsString() title: string;
    @IsString() message: string;
    @IsEnum(NotificationType) type: NotificationType;
  }
  ```
- `NotificationFilterDto`

### 11. WISHLIST MODULE
**Existing:** Basic structure

**Missing:**
- `AddToWishlistDto`
  ```typescript
  export class AddToWishlistDto {
    @IsString() listingId: string;
  }
  ```
- `RemoveFromWishlistDto`
  ```typescript
  export class RemoveFromWishlistDto {
    @IsString() listingId: string;
  }
  ```
- `ShareWishlistDto`

### 12. EARNINGS/PAYOUTS MODULE
**Existing:** Basic structure

**Missing:**
- `PayoutRequestDto`
  ```typescript
  export class PayoutRequestDto {
    @IsNumber() @Min(10) amount: number;
    @IsString() method: string; // "bank" | "mobile_money"
    @IsOptional() @IsString() bankName?: string;
    @IsOptional() @IsString() accountName?: string;
    @IsOptional() @IsString() accountNumber?: string;
    @IsOptional() @IsString() mobileNumber?: string;
    @IsOptional() @IsString() notes?: string;
  }
  ```
- `ProcessPayoutDto`
  ```typescript
  export class ProcessPayoutDto {
    @IsEnum(PayoutStatus) status: PayoutStatus;
    @IsOptional() @IsString() notes?: string;
  }
  ```
- `CommissionDto`
  ```typescript
  export class CommissionDto {
    @IsNumber() @Min(0) @Max(100) percentage: number;
    @IsOptional() @IsString() description?: string;
  }
  ```

### 13. ANALYTICS MODULE
**Existing:** Basic structure

**Missing:**
- `RevenueReportDto`
  ```typescript
  export class RevenueReportDto {
    @IsDateString() startDate: string;
    @IsDateString() endDate: string;
    @IsOptional() @IsString() partnerId?: string;
    @IsOptional() @IsEnum(ListingType) type?: ListingType;
  }
  ```
- `BookingAnalyticsDto`
  ```typescript
  export class BookingAnalyticsDto {
    @IsDateString() startDate: string;
    @IsDateString() endDate: string;
    @IsOptional() @IsString() region?: string;
    @IsOptional() @IsEnum(ListingType) type?: ListingType;
  }
  ```
- `PartnerAnalyticsDto`
  ```typescript
  export class PartnerAnalyticsDto {
    @IsDateString() startDate: string;
    @IsDateString() endDate: string;
    @IsOptional() @IsString() partnerId?: string;
  }
  ```

### 14. VERIFICATION MODULE
**Existing:** Basic structure

**Missing:**
- `VerifyListingDto`
  ```typescript
  export class VerifyListingDto {
    @IsString() listingId: string;
    @IsBoolean() approved: boolean;
    @IsOptional() @IsString() notes?: string;
  }
  ```
- `VerifyPartnerDto`
  ```typescript
  export class VerifyPartnerDto {
    @IsString() partnerId: string;
    @IsEnum(PartnerStatus) status: PartnerStatus;
    @IsOptional() @IsString() notes?: string;
  }
  ```
- `SuspendPartnerDto`
  ```typescript
  export class SuspendPartnerDto {
    @IsString() partnerId: string;
    @IsString() reason: string;
    @IsOptional() @IsDateString() suspendedUntil?: string;
  }
  ```

### 15. AI MODULE
**Existing:** Basic structure

**Missing:**
- `SearchQueryDto`
  ```typescript
  export class SearchQueryDto {
    @IsString() query: string;
    @IsOptional() @IsEnum(ListingType) type?: ListingType;
    @IsOptional() @IsString() region?: string;
    @IsOptional() @IsNumber() @Min(0) maxPrice?: number;
    @IsOptional() @IsInt() @Min(1) limit?: number;
  }
  ```
- `RecommendationDto`
  ```typescript
  export class RecommendationDto {
    @IsOptional() @IsString() userId?: string;
    @IsOptional() @IsEnum(ListingType) type?: ListingType;
    @IsInt() @Min(1) @Max(20) limit: number;
  }
  ```
- `ChatAssistantDto`
  ```typescript
  export class ChatAssistantDto {
    @IsString() message: string;
    @IsOptional() @IsString() context?: string;
    @IsOptional() @IsArray() @IsString() history?: string[];
  }
  ```

## Priority Implementation Order

### Phase 1: Critical (Week 1)
1. Room Management DTOs (already partially exist)
2. Event Ticket DTOs
3. Product/Order DTOs
4. Vehicle DTOs

### Phase 2: Important (Week 2)
5. Guide Profile DTOs
6. Experience DTOs
7. Reservation DTOs
8. Enhanced Payment/Payout DTOs

### Phase 3: Enhancement (Week 3)
9. Analytics DTOs
10. Notification DTOs
11. Verification DTOs
12. AI Module DTOs

## Implementation Strategy

### For Each Missing DTO:
1. Create DTO file in appropriate module's `/dto` folder
2. Add validation rules using class-validator
3. Add Swagger documentation using @ApiProperty
4. Update controller to use new DTO
5. Update service method signature
6. Add frontend API method
7. Update frontend types if needed
8. Test endpoint

## Next Steps
1. Review this document
2. Prioritize which DTOs to implement first
3. I will create all missing DTOs systematically
4. Update controllers and services
5. Update frontend API client
6. Test each module

## Notes
- All DTOs follow NestJS best practices
- Validation uses class-validator decorators
- Swagger docs use @ApiProperty decorators
- Types match Prisma schema exactly
- Frontend types already created in api.types.ts