import { IsBoolean, IsOptional, IsString } from 'class-validator';
export class VerifyListingDto {
  @IsBoolean() published: boolean;
  @IsOptional() @IsString() reason?: string;
}
