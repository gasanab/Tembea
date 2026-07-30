# Mock Data Removal Guide

## Overview
This guide helps you gradually replace mock data in `tembea-frontend/src/data/tourism/listings.ts` with real API calls to the backend.

## Current State
The frontend currently uses mock data in multiple locations:
- `src/data/tourism/listings.ts` - Main mock data file
- Various page components that import and display mock listings
- Home page, explore page, category pages

## Step-by-Step Migration Plan

### Phase 1: Identify Mock Data Usage

Search for all files importing mock data:
```bash
cd tembea-frontend/src
grep -r "from.*data/tourism" --include="*.ts" --include="*.tsx" .
```

Common patterns to look for:
```typescript
import { listings } from "@/data/tourism/listings";
import { mockListings } from "@/data/tourism/listings";
```

### Phase 2: Replace Home Page Mock Data

**File:** `tembea-frontend/src/app/page.tsx`

**Before (Mock Data):**
```typescript
import { featuredListings } from "@/data/tourism/listings";

export default function HomePage() {
  return (
    <div>
      {featuredListings.map(listing => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
```

**After (API Data):**
```typescript
"use client";

import { useFeaturedListings } from "@/hooks/useListings";
import ListingCard from "@/components/cards/ListingCard";

export default function HomePage() {
  const { listings, isLoading, error } = useFeaturedListings(8);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading listings</div>;

  return (
    <div>
      {listings.map(listing => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
```

### Phase 3: Replace Category Page Mock Data

**File:** `tembea-frontend/src/app/hotels/page.tsx` (similar for apartments, restaurants, etc.)

**Before:**
```typescript
import { accommodations } from "@/data/tourism/listings";

export default function HotelsPage() {
  return (
    <div>
      {accommodations.map(listing => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
```

**After:**
```typescript
"use client";

import { useListings } from "@/hooks/useListings";
import ListingCard from "@/components/cards/ListingCard";

export default function HotelsPage() {
  const { listings, isLoading, error } = useListings({ 
    type: "accommodation",
    limit: 20 
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading hotels</div>;

  return (
    <div>
      {listings.map(listing => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
```

### Phase 4: Replace Explore Page Mock Data

**File:** `tembea-frontend/src/app/explore/page.tsx`

**Before:**
```typescript
import { allListings } from "@/data/tourism/listings";

export default function ExplorePage() {
  return (
    <div>
      {allListings.map(listing => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
```

**After:**
```typescript
"use client";

import { useListings } from "@/hooks/useListings";
import ListingCard from "@/components/cards/ListingCard";

export default function ExplorePage() {
  const { listings, isLoading, error } = useListings({ limit: 50 });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading listings</div>;

  return (
    <div>
      {listings.map(listing => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
```

### Phase 5: Update Listing Detail Pages

**File:** `tembea-frontend/src/app/detail/[category]/[id]/page.tsx`

**Before:**
```typescript
import { allListings } from "@/data/tourism/listings";

export default function ListingDetailPage({ params }) {
  const listing = allListings.find(l => l.id === params.id);
  
  if (!listing) return <div>Not found</div>;
  return <ListingPageShell listing={listing} />;
}
```

**After:**
```typescript
"use client";

import { useListing } from "@/hooks/useListings";
import ListingPageShell from "@/components/listing/ListingPageShell";

export default function ListingDetailPage({ params }) {
  const { listing, isLoading, error } = useListing(params.id);

  if (isLoading) return <div>Loading...</div>;
  if (error || !listing) return <div>Listing not found</div>;

  return <ListingPageShell listing={listing} />;
}
```

### Phase 6: Remove Mock Data File

Once all pages are migrated:

1. **Backup the file** (optional, for reference):
   ```bash
   cp src/data/tourism/listings.ts src/data/tourism/listings.ts.backup
   ```

2. **Delete the file**:
   ```bash
   rm src/data/tourism/listings.ts
   ```

3. **Remove the entire data directory** if empty:
   ```bash
   rmdir src/data/tourism
   rmdir src/data
   ```

### Phase 7: Update Type Definitions

Ensure your `Listing` type matches the backend response:

**File:** `tembea-frontend/src/types/api.types.ts`

```typescript
export interface Listing {
  id: string;
  type: string;
  name: string;
  location: string;
  region: string;
  city?: string;
  description: string;
  images: string[];
  price: number;
  priceLabel?: string;
  featured?: boolean;
  published: boolean;
  rating?: number;
  reviewCount?: number;
  partnerId: string;
  partner?: {
    id: string;
    businessName: string;
    user?: {
      name: string;
      avatar?: string;
    };
  };
  extraData?: Record<string, unknown>;
  coordinates?: { lat: number; lng: number };
  availability?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
```

## Common Patterns

### Pattern 1: Server Components (No "use client")
For server components, you can still fetch data but need to use a different approach:

```typescript
// app/page.tsx (server component)
import { listingsApi } from "@/lib/api-client";

async function getFeaturedListings() {
  const response = await listingsApi.getAll({ featured: true, limit: 8 });
  return response.listings;
}

export default async function HomePage() {
  const listings = await getFeaturedListings();
  
  return (
    <div>
      {listings.map(listing => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
```

### Pattern 2: Loading States
Always show loading states for better UX:

```typescript
"use client";

import { useListings } from "@/hooks/useListings";

export default function MyComponent() {
  const { listings, isLoading, error } = useListings();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-700">Failed to load listings</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return <div>{/* render listings */}</div>;
}
```

### Pattern 3: Error Handling
Add proper error handling and retry logic:

```typescript
"use client";

import { useListings } from "@/hooks/useListings";
import { Button } from "@/components/ui/Button";

export default function MyComponent() {
  const { listings, isLoading, error, refetch } = useListings();

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error.message}</p>
        <Button onClick={refetch}>Try Again</Button>
      </div>
    );
  }

  return <div>{/* render listings */}</div>;
}
```

## Testing After Migration

1. **Start the backend:**
   ```bash
   cd tembea-backend
   npm run start:dev
   ```

2. **Start the frontend:**
   ```bash
   cd tembea-frontend
   npm run dev
   ```

3. **Test each page:**
   - Home page (`/`) - Should show featured listings
   - Hotels page (`/hotels`) - Should show accommodations
   - Explore page (`/explore`) - Should show all listings
   - Listing detail (`/detail/[id]`) - Should show single listing

4. **Check browser console** for any errors

5. **Verify data matches** - Ensure API data displays correctly

## Benefits of Removing Mock Data

✅ **Real-time data** - Always shows current listings from database
✅ **No stale data** - Updates automatically when listings change
✅ **Better UX** - Loading states and error handling
✅ **Consistent experience** - Same data across all pages
✅ **Easier maintenance** - Single source of truth (backend)
✅ **Scalability** - Can handle thousands of listings

## Rollback Plan

If issues arise during migration:

1. Restore from backup:
   ```bash
   cp src/data/tourism/listings.ts.backup src/data/tourism/listings.ts
   ```

2. Revert to mock data temporarily

3. Fix issues in API integration

4. Try migration again

## Timeline Estimate

- **Phase 1-2:** 1-2 hours (Home page)
- **Phase 3:** 2-3 hours (Category pages - 8 pages)
- **Phase 4:** 1 hour (Explore page)
- **Phase 5:** 1-2 hours (Detail pages)
- **Phase 6:** 30 minutes (Remove mock data)
- **Phase 7:** 1 hour (Testing and fixes)

**Total:** 6-10 hours for complete migration

## Notes

- Migrate one page at a time to minimize risk
- Test thoroughly after each page migration
- Keep mock data backup until fully migrated
- Use feature flags if needed for gradual rollout
- Monitor API performance and add caching if needed