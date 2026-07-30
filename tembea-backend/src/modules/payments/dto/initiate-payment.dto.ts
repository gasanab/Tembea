import { IsIn, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class InitiatePaymentDto {
  @ApiPropertyOptional({ description: "Booking to pay for (exactly one target is required)" })
  @IsOptional()
  @IsString()
  bookingId?: string;

  @ApiPropertyOptional({ description: "Order to pay for (exactly one target is required)" })
  @IsOptional()
  @IsString()
  orderId?: string;

  @ApiPropertyOptional({
    example: 300,
    deprecated: true,
    description: "Ignored. The server uses the booking or order amount.",
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount?: number;

  @ApiPropertyOptional({
    example: "RWF",
    deprecated: true,
    description: "Ignored. The server uses the booking or order currency.",
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ enum: ["flutterwave"] })
  @IsOptional()
  @IsIn(["flutterwave"])
  provider?: "flutterwave";
}
