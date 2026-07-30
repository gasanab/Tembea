import {
  IsEnum,
  IsString,
  IsNumber,
  IsObject,
  IsOptional,
  Min,
  MaxLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ListingType } from "@prisma/client";
import { Type } from "class-transformer";

export class CreateBookingDto {
  @ApiProperty({ description: "The listing being booked" })
  @IsString()
  listingId: string;

  @ApiPropertyOptional({
    enum: ListingType,
    deprecated: true,
    description: "Ignored. The server uses the listing type.",
  })
  @IsOptional()
  @IsEnum(ListingType)
  type?: ListingType;

  @ApiPropertyOptional({
    example: 300,
    deprecated: true,
    description: "Ignored. The server calculates the amount from inventory.",
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount?: number;

  @ApiPropertyOptional({
    example: "USD",
    deprecated: true,
    description: "Ignored. The server uses the listing currency.",
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: "Client-generated retry/idempotency key" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  clientReference?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  roomId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ticketCategoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tourPackageId?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  guests?: number;

  @ApiProperty({
    description: "Type-specific booking data",
    examples: {
      accommodation: {
        value: { checkIn: "2026-08-01", checkOut: "2026-08-05", roomType: "Deluxe", specialRequests: "" },
      },
      event: { value: { ticketType: "VIP", quantity: 2 } },
      restaurant: { value: { date: "2026-08-01", time: "19:00", specialRequests: "" } },
      transport: { value: { pickupDate: "2026-08-01", returnDate: "2026-08-03", driverRequested: true, pickupLocation: "Kigali Airport" } },
      tour: { value: { date: "2026-08-01", participants: 4, package: "Full Day" } },
      marketplace: { value: { quantity: 2, deliveryAddress: "KG 11 Ave, Kigali" } },
    },
  })
  @IsObject()
  bookingData: Record<string, unknown>;
}
