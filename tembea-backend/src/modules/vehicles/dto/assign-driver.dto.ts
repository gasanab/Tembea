import { IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AssignDriverDto {
  @ApiProperty({ example: "Jean Pierre" })
  @IsString()
  driverName: string;

  @ApiProperty({ example: "+250788000000" })
  @IsString()
  driverPhone: string;

  @ApiPropertyOptional({ example: "DL-12345" })
  @IsOptional()
  @IsString()
  driverLicense?: string;
}
