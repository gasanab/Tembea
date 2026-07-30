import {
  IsString,
  IsNumber,
  IsInt,
  IsArray,
  IsBoolean,
  IsOptional,
  Min,
  MinLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class CreateTourPackageDto {
  @ApiProperty({ example: "guide_123abc" })
  @IsString()
  guideId!: string;

  @ApiProperty({ example: "Kigali City Tour" })
  @IsString()
  @MinLength(3)
  name!: string;

  @ApiPropertyOptional({ example: "Explore Kigali's vibrant culture, history, and modern development" })
  @IsOptional()
  @IsString()
  @MinLength(20)
  description?: string;

  @ApiProperty({ example: "4 hours" })
  @IsString()
  duration!: string;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price!: number;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  maxGuests!: number;

  @ApiProperty({ type: [String], example: ["Transport", "Lunch", "Entry Fees", "Guide"] })
  @IsArray()
  @IsString({ each: true })
  includes!: string[];

  @ApiPropertyOptional({ type: [String], example: ["Personal Expenses", "Tips"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludes?: string[];

  @ApiPropertyOptional({ example: "Day 1: Visit Kigali Genocide Memorial\nDay 2: City tour..." })
  @IsOptional()
  @IsString()
  itinerary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  available?: boolean;

  @ApiPropertyOptional({ example: "https://cdn.cloudinary.com/.../tour.jpg" })
  @IsOptional()
  @IsString()
  image?: string;
}