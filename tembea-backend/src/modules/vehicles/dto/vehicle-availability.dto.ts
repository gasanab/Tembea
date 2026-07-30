import { IsBoolean } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class VehicleAvailabilityDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  available: boolean;
}
