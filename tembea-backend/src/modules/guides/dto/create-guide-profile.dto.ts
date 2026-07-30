import {
  IsString,
  IsArray,
  IsInt,
  IsOptional,
  MinLength,
  Min,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateGuideProfileDto {
  @ApiProperty({ example: "list_123abc" })
  @IsString()
  listingId!: string;

  @ApiPropertyOptional({ example: "Professional tour guide with 10+ years experience in Rwanda" })
  @IsOptional()
  @IsString()
  @MinLength(20)
  bio?: string;

  @ApiProperty({ type: [String], example: ["English", "French", "Kinyarwanda"] })
  @IsArray()
  @IsString({ each: true })
  languages!: string[];

  @ApiProperty({ type: [String], example: ["Rwanda Tourism Board Certified", "First Aid Certified"] })
  @IsArray()
  @IsString({ each: true })
  certifications!: string[];

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  yearsExperience?: number;

  @ApiProperty({ type: [String], example: ["Wildlife", "History", "Culture", "Bird Watching"] })
  @IsArray()
  @IsString({ each: true })
  specialties!: string[];

  @ApiProperty({ type: [String], example: ["Mon", "Tue", "Wed", "Thu", "Fri"] })
  @IsArray()
  @IsString({ each: true })
  availability!: string[];

  @ApiPropertyOptional({ example: "within 24 hours" })
  @IsOptional()
  @IsString()
  responseTime?: string;

  @ApiPropertyOptional({ example: "https://cdn.cloudinary.com/.../guide.jpg" })
  @IsOptional()
  @IsString()
  profilePhoto?: string;
}