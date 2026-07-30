import {
  IsString,
  IsEnum,
  IsOptional,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PartnerStatus } from "@prisma/client";

export class VerifyPartnerDto {
  @ApiProperty({ example: "partner_123abc" })
  @IsString()
  partnerId!: string;

  @ApiProperty({ enum: PartnerStatus, example: PartnerStatus.VERIFIED })
  @IsEnum(PartnerStatus)
  status!: PartnerStatus;

  @ApiPropertyOptional({ example: "All documents verified successfully" })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: "https://cdn.cloudinary.com/.../verified-badge.jpg" })
  @IsOptional()
  @IsString()
  verificationBadge?: string;
}