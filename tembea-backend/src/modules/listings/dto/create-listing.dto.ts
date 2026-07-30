import {
  IsEnum,
  IsString,
  IsNumber,
  IsArray,
  IsBoolean,
  IsOptional,
  Min,
  MinLength,
  IsObject,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ListingType } from "@prisma/client";
import { Transform, Type } from "class-transformer";

const normalizeListingType = (value: unknown) => {
  if (typeof value !== "string") return value;

  const normalized = value.trim().replace(/-/g, "_").toUpperCase();
  const aliases: Record<string, ListingType> = {
    ACCOMODATION: ListingType.ACCOMMODATION,
    ACCOMMODATION: ListingType.ACCOMMODATION,
    MEMORIAL_SITES: ListingType.MEMORIAL_SITES,
  };

  return aliases[normalized] ?? normalized;
};

export class CreateListingDto {
  @ApiProperty({ enum: ListingType })
  @Transform(({ value }) => normalizeListingType(value))
  @IsEnum(ListingType)
  type!: ListingType;

  @ApiProperty({ example: "Kigali Serena Hotel" })
  @IsString()
  @MinLength(3)
  name!: string;

  @ApiProperty({ example: "KN 3 Ave, Kigali" })
  @IsString()
  location!: string;

  @ApiProperty({ example: "Kigali" })
  @IsString()
  region!: string;

  @ApiPropertyOptional({ example: "Kigali City" })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: "A premium hotel in the heart of Kigali..." })
  @IsString()
  @MinLength(20)
  description!: string;

  @ApiProperty({ type: [String], example: ["https://cdn.cloudinary.com/..."] })
  @IsArray()
  @IsString({ each: true })
  images!: string[];

  @ApiProperty({ example: 150 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price!: number;

  @ApiPropertyOptional({ example: "per night" })
  @IsOptional()
  @IsString()
  priceLabel?: string;

  @ApiPropertyOptional({ description: "Type-specific fields as JSON object" })
  @IsOptional()
  @IsObject()
  extraData?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: "GPS coordinates",
    example: { lat: -1.9441, lng: 30.0619 },
  })
  @IsOptional()
  @IsObject()
  coordinates?: { lat: number; lng: number };

  // Accommodation-specific fields
  @ApiPropertyOptional({ description: "Room types with pricing and availability", type: [Object] })
  @IsOptional()
  @IsArray()
  roomTypes?: Array<{
    name: string;
    price: number;
    remainingRooms: number;
    guests: number;
    beds: string;
    bathrooms: string;
  }>;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  maxGuests?: number;

  @ApiPropertyOptional({ example: "Queen" })
  @IsOptional()
  @IsString()
  bedType?: string;

  @ApiPropertyOptional({ example: "Private" })
  @IsOptional()
  @IsString()
  bathroomType?: string;

  @ApiPropertyOptional({ type: [String], example: ["English", "French", "Kinyarwanda"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiPropertyOptional({ type: [String], example: ["Kigali Convention Centre (2 km)", "Airport (15 km)"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  nearbyAttractions?: string[];

  // Policies
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  cancellationPolicy?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  smokingAllowed?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  petsAllowed?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  childrenAllowed?: boolean;

  @ApiPropertyOptional({ example: "10:00 PM - 6:00 AM" })
  @IsOptional()
  @IsString()
  quietHours?: string;

  // Contact information
  @ApiPropertyOptional({ example: "+250 788 123 456" })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional({ example: "info@hotel.com" })
  @IsOptional()
  @IsString()
  contactEmail?: string;

  @ApiPropertyOptional({ example: "https://www.yourhotel.com" })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({
    description: "Social media handles",
    example: { instagram: "@hotel", facebook: "HotelPage", tiktok: "@hotel" },
  })
  @IsOptional()
  @IsObject()
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  };

  // Availability
  @ApiPropertyOptional({ type: [String], example: ["2025-12-25", "2025-12-31"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  unavailableDates?: string[];

  // Documents
  @ApiPropertyOptional({ type: [String], example: ["business_license.pdf", "hotel_license.pdf"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];

  // Accommodation Category (Hotel, Apartment, Villa, etc.)
  @ApiPropertyOptional({ example: "Hotel" })
  @IsOptional()
  @IsString()
  accommodationCategory?: string;

  // Unit Type (Room Type, Apartment Type, etc.)
  @ApiPropertyOptional({ example: "Deluxe Room" })
  @IsOptional()
  @IsString()
  unitType?: string;

  // Unit Details - varies by category
  @ApiPropertyOptional({ description: "Category-specific unit details" })
  @IsOptional()
  @IsObject()
  unitDetails?: {
    // Hotel fields
    numberOfRooms?: number;
    maxGuests?: number;
    bedType?: string;
    roomSize?: string;
    breakfastIncluded?: boolean;
    roomView?: string;
    // Apartment fields
    bedrooms?: number;
    bathrooms?: number;
    livingRoom?: boolean;
    diningRoom?: boolean;
    kitchen?: boolean;
    balcony?: boolean;
    privateCompound?: boolean;
    garden?: boolean;
    parking?: boolean;
    laundryRoom?: boolean;
    storeRoom?: boolean;
    elevator?: boolean;
    // Villa fields
    swimmingPool?: boolean;
    bbqArea?: boolean;
    privateChef?: boolean;
    security?: boolean;
    // Lodge fields
    natureView?: boolean;
    campFire?: boolean;
    wildlifeExperience?: boolean;
    hikingTrails?: boolean;
    // Guest House fields
    sharedKitchen?: boolean;
    sharedLounge?: boolean;
    // Hostel fields
    bedsAvailable?: number;
    sharedBathroom?: boolean;
    lockers?: boolean;
    // Resort fields
    spa?: boolean;
    kidsClub?: boolean;
    golf?: boolean;
    conferenceHall?: boolean;
    beachAccess?: boolean;
    // Homestay fields
    hostLivesOnProperty?: boolean;
    mealsIncluded?: boolean;
    culturalExperience?: boolean;
    farmActivities?: boolean;
    // Campsite fields
    tentCapacity?: number;
    firePit?: boolean;
    toilets?: boolean;
    shower?: boolean;
    electricity?: boolean;
    waterSupply?: boolean;
  };
}
