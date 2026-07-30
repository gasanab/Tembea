import {
  IsString,
  IsEnum,
  IsOptional,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { NotificationType } from "@prisma/client";

export class CreateNotificationDto {
  @ApiProperty({ example: "user_123abc" })
  @IsString()
  userId!: string;

  @ApiProperty({ example: "Booking Confirmed" })
  @IsString()
  title!: string;

  @ApiProperty({ example: "Your booking for Kigali Serena Hotel has been confirmed" })
  @IsString()
  message!: string;

  @ApiProperty({ enum: NotificationType, example: NotificationType.SUCCESS })
  @IsEnum(NotificationType)
  type!: NotificationType;

  @ApiPropertyOptional({ example: "/bookings/booking_123" })
  @IsOptional()
  @IsString()
  link?: string;
}