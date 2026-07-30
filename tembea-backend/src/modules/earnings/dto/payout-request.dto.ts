import { Type } from "class-transformer";
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  Min,
  ValidateIf,
} from "class-validator";

export class PayoutRequestDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  @Min(1)
  amount!: number;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  @Matches(/^[A-Za-z]{3}$/)
  currency?: string;

  @IsOptional()
  @IsIn(["bank", "mobile_money"])
  method?: "bank" | "mobile_money";

  @ValidateIf((dto: PayoutRequestDto) => (dto.method ?? "bank") === "bank")
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  bankName?: string;

  @ValidateIf((dto: PayoutRequestDto) => (dto.method ?? "bank") === "bank")
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  accountName?: string;

  @ValidateIf((dto: PayoutRequestDto) => (dto.method ?? "bank") === "bank")
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  accountNumber?: string;

  @ValidateIf((dto: PayoutRequestDto) => dto.method === "mobile_money")
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  mobileNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
