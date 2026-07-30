import {
  IsString,
  IsDateString,
  IsOptional,
  IsEnum,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ListingType } from "@prisma/client";

export class RevenueReportDto {
  @ApiProperty({ example: "2025-01-01" })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: "2025-12-31" })
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional({ example: "partner_123abc" })
  @IsOptional()
  @IsString()
  partnerId?: string;

  @ApiPropertyOptional({ enum: ListingType, example: ListingType.ACCOMMODATION })
  @IsOptional()
  @IsEnum(ListingType)
  type?: ListingType;

  @ApiPropertyOptional({ example: "Kigali" })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ example: "monthly" })
  @IsOptional()
  @IsString()
  groupBy?: string; // "daily" | "weekly" | "monthly"
}