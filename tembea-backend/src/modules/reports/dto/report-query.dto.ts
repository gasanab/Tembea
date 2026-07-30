import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, Max, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import type { ReportType } from "../reports.service";

const CURRENT_YEAR = new Date().getUTCFullYear();

export class YearQueryDto {
  @ApiPropertyOptional({ minimum: 2020, maximum: CURRENT_YEAR })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2020)
  @Max(CURRENT_YEAR)
  year?: number;
}

export class ReportQueryDto extends YearQueryDto {
  @ApiProperty({
    enum: ["financial", "partners", "bookings", "users", "marketplace"],
  })
  @IsIn(["financial", "partners", "bookings", "users", "marketplace"])
  type!: ReportType;
}
