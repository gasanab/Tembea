import {
  IsString,
  IsEnum,
  IsOptional,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { OrderStatus } from "@prisma/client";

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus, example: OrderStatus.CONFIRMED })
  @IsEnum(OrderStatus)
  status!: OrderStatus;

  @ApiPropertyOptional({ example: "TRK123456" })
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @ApiPropertyOptional({ example: "John Doe - +250788123456" })
  @IsOptional()
  @IsString()
  deliveryAgent?: string;

  @ApiPropertyOptional({ example: "Order has been shipped via express delivery" })
  @IsOptional()
  @IsString()
  notes?: string;
}