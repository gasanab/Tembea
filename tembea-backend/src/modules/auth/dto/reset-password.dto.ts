import { IsString, Length, Matches, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ResetPasswordDto {
  @ApiProperty({ description: "The 64-character token from the reset email" })
  @IsString()
  @Length(64, 64)
  @Matches(/^[a-f0-9]{64}$/i)
  token!: string;

  @ApiProperty({ minLength: 8, maxLength: 72 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/[A-Z]/, { message: "password must include an uppercase letter" })
  @Matches(/[0-9]/, { message: "password must include a number" })
  password!: string;
}
