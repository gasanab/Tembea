import { IsBoolean } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ListingFeaturedDto {
  @ApiProperty()
  @IsBoolean()
  featured!: boolean;
}
