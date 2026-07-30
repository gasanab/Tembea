import { IsString, IsNumber, Min, Max, MinLength, IsOptional } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class CreateReviewDto {
  @ApiProperty()
  @IsString()
  listingId: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  rating: number;

  @ApiProperty({ example: "Amazing experience, highly recommend!" })
  @IsString()
  @MinLength(10)
  comment: string;
}

export class ReplyReviewDto {
  @ApiPropertyOptional({ example: "Thank you for your kind words!" })
  @IsOptional()
  @IsString()
  reply?: string;
}
