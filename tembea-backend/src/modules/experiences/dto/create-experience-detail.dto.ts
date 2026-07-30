import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class CreateExperienceDetailDto {
  @ApiProperty({ example: "clxyz123" })
  @IsString()
  listingId: string;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  entryFee?: number;

  @ApiPropertyOptional({ example: "08:00" })
  @IsOptional()
  @IsString()
  openingTime?: string;

  @ApiPropertyOptional({ example: "18:00" })
  @IsOptional()
  @IsString()
  closingTime?: string;

  @ApiPropertyOptional({ type: [String], example: ["Sunday", "Monday"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  closedDays?: string[];

  @ApiPropertyOptional({ type: [String], example: ["Standard", "VIP", "Group"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  packages?: string[];

  @ApiPropertyOptional({
    type: [String],
    example: ["Big Five", "Boat Safari", "Gorilla Trekking"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  highlights?: string[];

  @ApiPropertyOptional({ example: "All ages" })
  @IsOptional()
  @IsString()
  ageLimit?: string;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  maxGroupSize?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  guidedTours?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  bookingRequired?: boolean;

  @ApiPropertyOptional({
    type: [String],
    example: ["Parking", "Restrooms", "Gift Shop", "Restaurant"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  facilities?: string[];
}
