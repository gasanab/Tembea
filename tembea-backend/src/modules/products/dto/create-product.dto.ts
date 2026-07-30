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

export class CreateProductDto {
  @ApiProperty({ example: "listing-uuid-here" })
  @IsString()
  listingId!: string;

  @ApiProperty({ example: "Rwandan Coffee Beans - Premium Arabica" })
  @IsString()
  @MinLength(3)
  name!: string;

  @ApiPropertyOptional({ example: "Premium quality Arabica coffee beans from the hills of Rwanda" })
  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @ApiProperty({ example: 25 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price!: number;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(0)
  stock!: number;

  @ApiProperty({ type: [String], example: ["https://cdn.cloudinary.com/.../coffee.jpg"] })
  @IsArray()
  @IsString({ each: true })
  images!: string[];

  @ApiPropertyOptional({ example: "Food & Beverages" })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: "COF-001" })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ example: 1.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  weight?: number;

  @ApiPropertyOptional({ type: [String], example: ["coffee", "organic", "fair-trade"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({ example: "Made in Rwanda" })
  @IsOptional()
  @IsString()
  origin?: string;
}