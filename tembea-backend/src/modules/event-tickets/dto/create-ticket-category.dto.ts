import {
  IsString,
  IsNumber,
  IsInt,
  IsArray,
  IsOptional,
  Min,
  MinLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class CreateTicketCategoryDto {
  @ApiProperty({ description: "The ID of the event listing" })
  @IsString()
  listingId!: string;

  @ApiProperty({ example: "VIP" })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiPropertyOptional({ example: "VIP package with meet & greet" })
  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @ApiProperty({ example: 150 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price!: number;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(1)
  totalSeats!: number;

  @ApiPropertyOptional({ example: "#FFD700" })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ type: [String], example: ["Meet & Greet", "Front Row", "Gift Pack"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  perks?: string[];
}