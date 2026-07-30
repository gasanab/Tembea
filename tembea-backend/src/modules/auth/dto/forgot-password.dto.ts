import { IsEmail, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ForgotPasswordDto {
  @ApiProperty({ example: "aline@example.com" })
  @IsEmail()
  @MaxLength(254)
  email!: string;
}
