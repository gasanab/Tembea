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

export class CreateEventDto {
  @ApiProperty({ example: "Kigali Jazz Festival 2025" })
  @IsString()
  @MinLength(3)
  name!: string;

  @ApiProperty({ example: "Kigali Convention Centre" })
  @IsString()
  venue!: string;

  @ApiProperty({ example: "Kigali" })
  @IsString()
  city!: string;

  @ApiProperty({ example: "2025-08-15" })
  @IsString()
  date!: string;

  @ApiProperty({ example: "18:00" })
  @IsString()
  time!: string;

  @ApiProperty({ example: "Annual jazz festival featuring international artists" })
  @IsString()
  @MinLength(20)
  description!: string;

  @ApiProperty({ example: "https://cdn.cloudinary.com/.../banner.jpg" })
  @IsString()
  bannerImage!: string;

  @ApiProperty({ example: 500 })
  @IsInt()
  @Min(0)
  ticketsAvailable!: number;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  ticketPrice!: number;

  @ApiProperty({ example: "Music" })
  @IsString()
  category!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({ type: [String], example: ["Live Music", "Food", "Drinks"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  highlights?: string[];

  @ApiPropertyOptional({ example: "All ages welcome" })
  @IsOptional()
  @IsString()
  ageLimit?: string;

  @ApiPropertyOptional({ example: "Dress code: Smart casual" })
  @IsOptional()
  @IsString()
  specialInstructions?: string;
}
