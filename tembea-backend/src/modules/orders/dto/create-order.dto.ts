import {
  IsString,
  IsInt,
  IsOptional,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateOrderDto {
  @ApiPropertyOptional({
    description: "Caller-generated idempotency key for safe retries",
    example: "checkout_01J2ABCDEF",
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  clientReference?: string;

  @ApiProperty({ example: "prod_123abc" })
  @IsString()
  productId!: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiPropertyOptional({ example: "KN 3 Ave, Kigali, Rwanda" })
  @IsOptional()
  @IsString()
  @MinLength(10)
  deliveryAddress?: string;

  @ApiPropertyOptional({ example: "Please deliver before 5pm" })
  @IsOptional()
  @IsString()
  deliveryNotes?: string;

  @ApiPropertyOptional({ example: "Cash on delivery" })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
