import { IsArray, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class GuideAvailabilityDto {
  @ApiProperty({
    type: [String],
    example: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    description: "Array of available days",
  })
  @IsArray()
  @IsString({ each: true })
  availability: string[];
}
