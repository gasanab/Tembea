# Testing Guide for Tembea Backend

## Overview
This document provides test cases and examples for testing the Tembea backend API. Tests can be run using Jest once dependencies are installed.

## Prerequisites

### Install Test Dependencies
```bash
cd tembea-backend
npm install --save-dev jest @types/jest @nestjs/testing supertest @types/supertest ts-jest
```

### Configure Jest
Create `tembea-backend/jest.config.js`:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.spec.ts', '**/test/**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.entity.ts',
  ],
  coverageDirectory: 'coverage',
};
```

### Update package.json
Add to `tembea-backend/package.json`:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand"
  }
}
```

## Manual Test Cases

### 1. Authentication Tests

#### Test 1.1: Register Client User
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Client",
    "email": "client-test@example.com",
    "password": "TestPass123",
    "role": "CLIENT"
  }'
```

**Expected Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "name": "Test Client",
    "email": "client-test@example.com",
    "role": "CLIENT",
    "avatar": null,
    "partner": null
  },
  "token": "jwt-token"
}
```

#### Test 1.2: Register Partner User (Auto-creates Partner row)
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Partner",
    "email": "partner-test@example.com",
    "password": "TestPass123",
    "role": "PARTNER"
  }'
```

**Expected Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "name": "Test Partner",
    "email": "partner-test@example.com",
    "role": "PARTNER",
    "partner": {
      "id": "uuid",
      "businessName": "Test Partner",
      "category": "TOURS",
      "status": "PENDING"
    }
  },
  "token": "jwt-token"
}
```

#### Test 1.3: Duplicate Email Rejection
```bash
# Run the same register request twice with same email
```

**Expected Response (409):**
```json
{
  "message": "Email already registered",
  "statusCode": 409
}
```

#### Test 1.4: Login Success
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "partner-test@example.com",
    "password": "TestPass123"
  }'
```

**Expected Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "name": "Test Partner",
    "email": "partner-test@example.com",
    "role": "partner",
    "partner": { "id": "uuid", "businessName": "Test Partner", "category": "TOURS", "status": "PENDING" }
  },
  "partner": { "id": "uuid", "businessName": "Test Partner", "category": "TOURS", "status": "PENDING" },
  "token": "jwt-token"
}
```

#### Test 1.5: Login Failure
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "wrong@example.com",
    "password": "WrongPass123"
  }'
```

**Expected Response (401):**
```json
{
  "message": "Invalid credentials",
  "statusCode": 401
}
```

#### Test 1.6: Get Current User (with Partner data)
```bash
# Use token from login
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**
```json
{
  "id": "uuid",
  "name": "Test Partner",
  "email": "partner-test@example.com",
  "role": "PARTNER",
  "partner": {
    "id": "uuid",
    "businessName": "Test Partner",
    "category": "TOURS",
    "status": "PENDING"
  }
}
```

### 2. Listings Tests

#### Test 2.1: Get All Published Listings
```bash
curl http://localhost:4000/api/listings
```

**Expected Response (200):**
```json
{
  "listings": [...],
  "total": 10,
  "page": 1,
  "limit": 20
}
```

#### Test 2.2: Get My Listings (Partner)
```bash
# Use partner token
curl http://localhost:4000/api/listings/mine \
  -H "Authorization: Bearer $PARTNER_TOKEN"
```

**Expected Response (200):**
```json
[...]
```

#### Test 2.3: Create Listing (Partner)
```bash
curl -X POST http://localhost:4000/api/listings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PARTNER_TOKEN" \
  -d '{
    "type": "ACCOMMODATION",
    "name": "Kigali Serena Hotel",
    "location": "KN 3 Ave, Kigali",
    "region": "Kigali",
    "city": "Kigali",
    "description": "A premium hotel in the heart of Kigali with stunning city views and world-class amenities.",
    "images": ["https://example.com/image1.jpg"],
    "price": 150,
    "priceLabel": "per night",
    "featured": true,
    "extraData": {
      "amenities": ["Free WiFi", "Pool", "Gym"],
      "roomsAvailable": 50
    }
  }'
```

**Expected Response (201):**
```json
{
  "id": "uuid",
  "type": "ACCOMMODATION",
  "name": "Kigali Serena Hotel",
  "partnerId": "partner-uuid",
  "published": false,
  ...
}
```

### 3. Wishlist Tests

#### Test 3.1: Add to Wishlist
```bash
# Use client token and listing ID
curl -X POST http://localhost:4000/api/wishlist/LISTING_ID \
  -H "Authorization: Bearer $CLIENT_TOKEN"
```

**Expected Response (200):**
```json
{
  "id": "uuid",
  "userId": "user-uuid",
  "listingId": "listing-uuid"
}
```

#### Test 3.2: Check if in Wishlist
```bash
curl http://localhost:4000/api/wishlist/LISTING_ID/check \
  -H "Authorization: Bearer $CLIENT_TOKEN"
```

**Expected Response (200):**
```json
true
```

### 4. Messages Tests

#### Test 4.1: Get Conversations
```bash
curl http://localhost:4000/api/messages/conversations \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**
```json
[...]
```

#### Test 4.2: Get Messages in Conversation
```bash
curl http://localhost:4000/api/messages/conversations/CONVERSATION_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**
```json
{
  "id": "uuid",
  "messages": [...]
}
```

### 5. Analytics Tests (Admin)

#### Test 5.1: Get Overview Stats
```bash
curl http://localhost:4000/api/analytics/overview \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response (200):**
```json
{
  "totalUsers": 100,
  "totalListings": 50,
  "totalBookings": 200,
  "totalRevenue": 50000
}
```

#### Test 5.2: Get Partner Analytics
```bash
curl "http://localhost:4000/api/analytics/partner?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer $PARTNER_TOKEN"
```

**Expected Response (200):**
```json
{
  "listings": [...],
  "bookings": [...],
  "revenue": {...},
  "reviews": [...]
}
```

### 6. Payments Tests

#### Test 6.1: Get Payment by Booking ID
```bash
curl http://localhost:4000/api/payments/booking/BOOKING_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**
```json
{
  "id": "uuid",
  "bookingId": "booking-uuid",
  "amount": 150,
  "status": "COMPLETED",
  ...
}
```

## Automated Test Examples

### Example: Jest Test for Auth
```typescript
// src/test/auth.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../app.module';

describe('Auth', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should register a partner', async () => {
    const response = await app.getHttpAdapter().get('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Partner',
        email: 'test@example.com',
        password: 'TestPass123',
        role: 'PARTNER',
      }),
    });

    expect(response.status).toBe(201);
    expect(response.body.user.role).toBe('PARTNER');
    expect(response.body.user.partner).toBeDefined();
  });
});
```

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:cov

# Run in watch mode
npm run test:watch

# Run specific test file
npm test -- auth.spec.ts
```

## Test Coverage Goals

- **Auth Module:** 90%+ (register, login, JWT validation, partner creation)
- **Listings Module:** 85%+ (CRUD, partner ownership, publish/unpublish)
- **Bookings Module:** 85%+ (create, update, partner access)
- **Wishlist Module:** 90%+ (add, remove, check)
- **Messages Module:** 80%+ (conversations, send message)
- **Payments Module:** 80%+ (initiate, verify)
- **Earnings Module:** 85%+ (partner earnings, payout requests)

## Notes

1. Tests require a running PostgreSQL database
2. Use test database for automated tests to avoid polluting development data
3. Clean up test data after each test run
4. Mock external services (Cloudinary, Flutterwave, Stripe, Email) in tests
5. Use environment variables for test configuration