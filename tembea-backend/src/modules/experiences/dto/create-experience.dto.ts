import {
  IsString,
  IsNumber,
  IsInt,
  IsArray,
  IsBoolean,
  IsOptional,
  Min,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class CreateExperienceDto {
  @ApiProperty({ example: "list_123abc" })
  @IsString()
  listingId!: string;

  @ApiPropertyOptional({ example: 50 })
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

  @ApiProperty({ type: [String], example: ["Sunday", "Monday"] })
  @IsArray()
  @IsString({ each: true })
  closedDays!: string[];

  @ApiProperty({ type: [String], example: ["Gorilla Trekking", "Golden Monkey Tracking"] })
  @IsArray()
  @IsString({ each: true })
  packages!: string[];

  @ApiProperty({ type: [String], example: ["Big Five", "Boat Safari", "Bird Watching"] })
  @IsArray()
  @IsString({ each: true })
  highlights!: string[];

  @ApiPropertyOptional({ example: "All ages" })
  @IsOptional()
  @IsString()
  ageLimit?: string;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxGroupSize?: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  guidedTours!: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  bookingRequired!: boolean;

  @ApiProperty({ type: [String], example: ["Parking", "Restrooms", "Gift Shop", "Restaurant"] })
  @IsArray()
  @IsString({ each: true })
  facilities!: string[];

  @ApiPropertyOptional({ example: "Best time to visit is during dry season" })
  @IsOptional()
  @IsString()
  bestTimeToVisit?: string;

  @ApiPropertyOptional({ example: "Bring comfortable shoes, sunscreen, and water" })
  @IsOptional()
  @IsString()
  whatToBring?: string;
}
