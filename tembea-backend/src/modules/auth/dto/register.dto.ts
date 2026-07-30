import {
  IsEmail,
  IsEnum,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";

export enum RegistrationRole {
  CLIENT = "CLIENT",
  PARTNER = "PARTNER",
}

export class RegisterDto {
  @ApiProperty({ example: "Aline Uwase" })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: "aline@example.com" })
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({ example: "SecurePass123", minLength: 8, maxLength: 72 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/[A-Z]/, { message: "password must include an uppercase letter" })
  @Matches(/[0-9]/, { message: "password must include a number" })
  password!: string;

  @ApiPropertyOptional({ enum: RegistrationRole, default: RegistrationRole.CLIENT })
  @IsEnum(RegistrationRole)
  role?: RegistrationRole = RegistrationRole.CLIENT;
}
