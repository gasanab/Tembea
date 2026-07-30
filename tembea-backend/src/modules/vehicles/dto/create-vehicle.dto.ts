import {
  IsString,
  IsNumber,
  IsInt,
  IsArray,
  IsBoolean,
  IsOptional,
  IsEnum,
  Min,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { VehicleType } from "@prisma/client";
import { Type } from "class-transformer";

export class CreateVehicleDto {
  @ApiProperty({ example: "list_123abc" })
  @IsString()
  listingId!: string;

  @ApiProperty({ example: "Toyota" })
  @IsString()
  make!: string;

  @ApiProperty({ example: "Prado" })
  @IsString()
  model!: string;

  @ApiPropertyOptional({ example: 2023 })
  @IsOptional()
  @IsInt()
  year?: number;

  @ApiProperty({ enum: VehicleType, example: VehicleType.CAR })
  @IsEnum(VehicleType)
  type!: VehicleType;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(1)
  capacity!: number;

  @ApiPropertyOptional({ example: "RAB 123A" })
  @IsOptional()
  @IsString()
  plateNumber?: string;

  @ApiPropertyOptional({ example: "White" })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ example: "automatic" })
  @IsString()
  transmission!: string;

  @ApiProperty({ example: "petrol" })
  @IsString()
  fuelType!: string;

  @ApiProperty({ type: [String], example: ["AC", "GPS", "WiFi", "Bluetooth"] })
  @IsArray()
  @IsString({ each: true })
  features!: string[];

  @ApiProperty({ example: 80 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  pricePerDay!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  driverAvailable?: boolean;

  @ApiPropertyOptional({ example: "John Doe" })
  @IsOptional()
  @IsString()
  driverName?: string;

  @ApiPropertyOptional({ example: "+250788123456" })
  @IsOptional()
  @IsString()
  driverPhone?: string;

  @ApiPropertyOptional({ example: "DL123456" })
  @IsOptional()
  @IsString()
  driverLicense?: string;

  @ApiProperty({ type: [String], example: ["https://cdn.cloudinary.com/.../car1.jpg"] })
  @IsArray()
  @IsString({ each: true })
  images!: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  available?: boolean;
}
