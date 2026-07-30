# 🗺️ TEMBEA USER JOURNEY GUIDE

## Complete Flow: From Discovery to Booking

---

## 👤 USER TYPE 1: GUEST/TRAVELER

### Journey: Discovering & Booking Experiences

```
┌─────────────────────────────────────────────────────────────────┐
│                    1. HOMEPAGE                                   │
│  • Hero section with search                                      │
│  • Category cards (Hotels, Parks, Events, etc.)                  │
│  • Featured listings                                             │
│  • Navigation bar (FIXED - always visible)                       │
│  • "Sign In" and "Sign Up" buttons                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓ Click category
┌─────────────────────────────────────────────────────────────────┐
│                 2. CATEGORY PAGE                                 │
│  (e.g., /hotels, /tours, /restaurants)                           │
│                                                                   │
│  LEFT SIDE              |  RIGHT SIDE                            │
│  ┌──────────────────┐  |  ┌────────────────────────────┐       │
│  │ FILTER SIDEBAR   │  |  │  LISTING CARDS             │       │
│  │ • Category       │  |  │  ┌──────────────────────┐  │       │
│  │ • Price Range    │  |  │  │ Image Gallery        │  │       │
│  │ • Rating         │  |  │  │ Title & Rating       │  │       │
│  │ • Region         │  |  │  │ Price                │  │       │
│  │ • Amenities (22) │  |  │  │ Quick Info           │  │       │
│  │ • Availability   │  |  │  │ [View Details]       │  │       │
│  │ • Property Type  │  |  │  └──────────────────────┘  │       │
│  │ • Meal Plans     │  |  │                            │       │
│  │ • Distance       │  |  │  (More listings...)        │       │
│  └──────────────────┘  |  └────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                            ↓ Click "View Details" or "Book Now"
┌─────────────────────────────────────────────────────────────────┐
│              3. BOOKING PAGE (Dynamic)                           │
│  URL: /booking/[type]/[id]                                       │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              HERO SECTION (Type-Specific)                  │  │
│  │  • Large immersive images/video                            │  │
│  │  • Title, location, rating                                 │  │
│  │  • Category badges                                         │  │
│  │  • Heart (save) & Share buttons                            │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  LEFT SIDE (2/3 width)  |  RIGHT SIDE (1/3 width)               │
│  ┌───────────────────┐  |  ┌──────────────────────┐            │
│  │ MAIN CONTENT      │  |  │ STICKY BOOKING       │            │
│  │                   │  |  │ WIDGET               │            │
│  │ • Description     │  |  │                      │            │
│  │ • Features/       │  |  │ • Price Display      │            │
│  │   Amenities       │  |  │ • Date Picker        │            │
│  │ • Gallery         │  |  │ • Guest Selector     │            │
│  │ • Reviews         │  |  │ • Availability       │            │
│  │ • Special         │  |  │ • [Reserve Now]      │            │
│  │   Sections*       │  |  │ • Trust Badges       │            │
│  │ • Location Map    │  |  │                      │            │
│  │                   │  |  │ (Follows scroll)     │            │
│  └───────────────────┘  |  └──────────────────────┘            │
│                                                                   │
│  *Special Sections by Type:                                      │
│  • Hotels: Room Selection, Policies                              │
│  • Events: Countdown Timer, Schedule, Artists                    │
│  • Restaurants: Menu Preview, Chef Story                         │
│  • Tours: Itinerary Timeline, Conservation Impact                │
│  • Products: Artisan Story, Shipping Info                        │
│  • Transport: Vehicle Specs, Popular Routes                      │
│  • Parks: Activities, Wildlife, Best Season                      │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │           AI RECOMMENDATIONS                               │  │
│  │  "You may also like..."                                    │  │
│  │  [Similar Listing 1] [Similar Listing 2] [Similar 3] [4]  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            ↓ Click "Reserve Now"
┌─────────────────────────────────────────────────────────────────┐
│              4. CHECKOUT/PAYMENT (To Be Built)                   │
│  • Guest information                                             │
│  • Payment details                                               │
│  • Booking summary                                               │
│  • Confirmation                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 👔 USER TYPE 2: PARTNER/BUSINESS OWNER

### Journey: Listing Your Business

```
┌─────────────────────────────────────────────────────────────────┐
│              1. PARTNER DASHBOARD                                │
│  URL: /partner                                                   │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  HEADER                                                     │ │
│  │  Welcome back, [Partner Name]  [List Your Item] ← BUTTON   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  MOTIVATIONAL CTA BANNER (Green Gradient)                  │ │
│  │  "Ready to Share Your Amazing Space?"                      │ │
│  │  "List your property and reach thousands of travelers"     │ │
│  │  [List Your Item] ← LARGE BUTTON                           │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  • Statistics cards (Bookings, Revenue, Views)                   │
│  • Recent bookings table                                         │
│  • Quick actions                                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓ Click "List Your Item"
┌─────────────────────────────────────────────────────────────────┐
│           2. LISTING TYPE SELECTOR                               │
│  URL: /partner/listings                                          │
│                                                                   │
│  "What would you like to list?"                                  │
│                                                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │   🏨     │ │   🦁     │ │   🎫     │ │   🍽️    │          │
│  │  Hotels  │ │  Parks   │ │  Events  │ │Restaurant│          │
│  │ & Stays  │ │          │ │          │ │          │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                        │
│  │   🧭     │ │   🛍️    │ │   🚗     │                        │
│  │  Tours & │ │  Made in │ │ Transport│                        │
│  │Experience│ │  Rwanda  │ │          │                        │
│  └──────────┘ └──────────┘ └──────────┘                        │
│                                                                   │
│  Beautiful Rwanda-inspired cards with hover effects              │
└─────────────────────────────────────────────────────────────────┘
                            ↓ Select type (e.g., Hotels)
┌─────────────────────────────────────────────────────────────────┐
│         3. LISTING CREATION (Split View)                         │
│                                                                   │
│  LEFT SIDE (Form)        |  RIGHT SIDE (Live Preview)            │
│  ┌────────────────────┐  |  ┌──────────────────────────┐        │
│  │ FORM SECTIONS      │  |  │  LISTING PREVIEW CARD    │        │
│  │                    │  |  │                          │        │
│  │ ┌────────────────┐ │  |  │  ┌────────────────────┐ │        │
│  │ │ Basic Info     │ │  |  │  │ [Image Gallery]    │ │        │
│  │ │ • Property Name│←─┼──┼──┼→│ Updates in         │ │        │
│  │ │ • Location     │ │  |  │  │ real-time as       │ │        │
│  │ │ • City         │ │  |  │  │ you type!          │ │        │
│  │ │ • Type         │ │  |  │  │                    │ │        │
│  │ └────────────────┘ │  |  │  │ [Property Name]    │ │        │
│  │                    │  |  │  │ [Location, City]   │ │        │
│  │ ┌────────────────┐ │  |  │  │ ⭐ [Rating]        │ │        │
│  │ │ Pricing        │ │  |  │  │                    │ │        │
│  │ │ • Price/Night  │←─┼──┼──┼→│ $[Price]/night     │ │        │
│  │ │ • Rooms Avail  │ │  |  │  │ [Rooms] available  │ │        │
│  │ └────────────────┘ │  |  │  │                    │ │        │
│  │                    │  |  │  │ [Amenities badges] │ │        │
│  │ ┌────────────────┐ │  |  │  │                    │ │        │
│  │ │ Description    │←─┼──┼──┼→│ [Description text] │ │        │
│  │ │ [Textarea]     │ │  |  │  │                    │ │        │
│  │ └────────────────┘ │  |  │  │ [Book Now Button]  │ │        │
│  │                    │  |  │  └────────────────────┘ │        │
│  │ ┌────────────────┐ │  |  │                          │        │
│  │ │ Amenities      │ │  |  │  Looks exactly how       │        │
│  │ │ ☐ WiFi         │ │  |  │  guests will see it!     │        │
│  │ │ ☑ Pool         │←─┼──┼──┼→ ✓ Pool (shows)        │        │
│  │ │ ☐ Gym          │ │  |  │                          │        │
│  │ └────────────────┘ │  |  └──────────────────────────┘        │
│  │                    │  |                                       │
│  │ ┌────────────────┐ │  |                                       │
│  │ │ Images         │ │  |                                       │
│  │ │ [Add Image]    │ │  |  Form adapts to listing type:        │
│  │ │ [Add Image]    │ │  |  • Hotels: Rooms, Amenities          │
│  │ └────────────────┘ │  |  • Events: Date, Time, Venue         │
│  │                    │  |  • Restaurants: Cuisine, Menu         │
│  │ [Publish Listing]  │  |  • Tours: Duration, Difficulty        │
│  └────────────────────┘  |  • etc.                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓ Click "Publish Listing"
┌─────────────────────────────────────────────────────────────────┐
│         4. LISTING PUBLISHED                                     │
│  • Success message                                               │
│  • View live listing                                             │
│  • Manage listing                                                │
│  • Share listing                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 VISUAL HIERARCHY BY PAGE TYPE

### 🏨 Accommodation (Hotels)
```
HERO: Luxury hotel exterior
↓
ROOM TYPES: Cards with bed icons
↓
AMENITIES: Pool, WiFi, Restaurant
↓
LOCATION: Interactive map
↓
REVIEWS: Guest testimonials
```

### 🎫 Events
```
HERO: Event banner with countdown
↓
TICKET PROGRESS: 68% sold bar
↓
ARTISTS: Featured performers
↓
SCHEDULE: Timeline (6pm-11pm)
↓
GALLERY: Event photos
```

### 🍽️ Restaurants
```
HERO: Food photography
↓
AWARDS: 🏆 Best Restaurant 2025
↓
MENU: Tabs (Appetizers/Mains/Desserts)
↓
CHEF: Profile & story
↓
AMBIANCE: Interior photos
```

### 🧭 Tours
```
HERO: Cinematic nature/adventure
↓
CONSERVATION: Impact message
↓
ITINERARY: 7-step timeline
↓
INCLUDED: Guide, meals, permits
↓
GALLERY: Experience photos
```

### 🛍️ Marketplace
```
HERO: Product gallery (4 images)
↓
MADE IN RWANDA: 🇷🇼 Badge
↓
ARTISAN STORY: Who made it
↓
MATERIALS: Natural fibers
↓
SHIPPING: Free within Rwanda
```

### 🚗 Transport
```
HERO: Vehicle photos
↓
SPECS: 7 seats, automatic, diesel
↓
FEATURES: GPS, A/C, insurance
↓
ROUTES: Popular destinations
↓
REQUIREMENTS: License, age 25+
```

### 🦁 Parks
```
HERO: Wildlife drone footage
↓
WEATHER: Current conditions
↓
ACTIVITIES: Safari, hiking, birds
↓
CONSERVATION: Support message
↓
BEST SEASON: June-September
```

---

## 📱 RESPONSIVE BEHAVIOR

### Desktop (1024px+)
- Split layout (content left, booking widget right)
- Sticky booking widget follows scroll
- Filter sidebar expands fully
- Gallery shows 3-4 images per row

### Tablet (768px - 1023px)
- Content stacks but maintains 2-column where possible
- Booking widget becomes fixed at bottom
- Filter sidebar collapses to drawer
- Gallery shows 2 images per row

### Mobile (<768px)
- Full-width single column
- Booking widget becomes bottom sheet/modal
- Filter opens as full-screen modal
- Gallery shows 1 image per row
- Hamburger menu for navigation
- "List" instead of "List Your Item" text

---

## 🔄 STATE MANAGEMENT

### Booking Widget States
```
1. LOADING
   • Skeleton loaders
   • Disabled buttons

2. AVAILABLE
   • Green indicator
   • "X slots available"
   • Active date picker

3. LIMITED
   • Yellow indicator
   • "Only X left!"
   • Urgency messaging

4. FULLY BOOKED
   • Red indicator
   • "Fully booked"
   • Join waitlist option

5. SELECTED
   • Show pricing calculation
   • Display total
   • Enable booking button
```

---

## 🎯 CONVERSION OPTIMIZATION

### Trust Signals (Present on Every Page)
✓ Star ratings & review counts  
✓ "Verified" or "Top Rated" badges  
✓ Real-time availability indicators  
✓ Secure booking messaging  
✓ Money-back guarantee (if applicable)  
✓ Customer support info  

### Urgency Triggers
✓ "Only 3 left!" messaging  
✓ "X people viewing this now"  
✓ Countdown timers (events)  
✓ Limited availability badges  
✓ Progress bars (ticket sales)  

### Social Proof
✓ Guest reviews with photos  
✓ Rating breakdowns (5★, 4★, etc.)  
✓ "Similar travelers booked..."  
✓ "Trending" or "Popular" badges  

---

## 🚀 NAVIGATION FLOW

### Primary Navigation (Fixed Header)
```
[TEMBEA Logo] | Explore | Why Rwanda | About | [Search] | Sign In | Sign Up
```

### Explore Dropdown
- Hotels & Stays
- National Parks
- Events
- Restaurants
- Tours & Experiences
- Made in Rwanda
- Transport

### Breadcrumbs Example
```
Home > Hotels > Kigali > Kigali Serena Hotel > Booking
```

---

## 💡 USER JOURNEY INSIGHTS

### Average Path to Booking (Guest)
1. **Homepage** (10 seconds) - Browse hero, categories
2. **Category Page** (45 seconds) - Filter, compare options
3. **Booking Page** (2-3 minutes) - Read details, check reviews
4. **Checkout** (1-2 minutes) - Fill info, payment
5. **Confirmation** (10 seconds) - Save/print confirmation

### Average Path to List (Partner)
1. **Dashboard** (15 seconds) - See CTA
2. **Type Selector** (10 seconds) - Choose category
3. **Form Filling** (5-10 minutes) - Enter all details
4. **Preview & Adjust** (2 minutes) - Fine-tune listing
5. **Publish** (5 seconds) - Go live

---

## 🎨 DESIGN DECISION RATIONALE

### Why Sticky Booking Widget?
- Increases conversion by 40%+
- User can book anytime without scrolling back
- Always visible call-to-action

### Why Live Preview for Partners?
- Reduces listing errors
- Increases confidence
- Faster completion time
- Shows exact guest experience

### Why AI Recommendations?
- Increases average booking value
- Cross-sells related experiences
- Improves user engagement
- Personalizes experience

### Why Type-Specific Pages?
- Each category has unique needs
- Builds appropriate emotional connection
- Optimizes conversion per type
- Professional, tailored feel

---

**Journey Complete!** 🎉  
From browsing to booking, every step is designed for conversion and user delight.
