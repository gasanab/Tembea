import { IsArray, IsString, ArrayMaxSize } from 'class-validator';
export class ListingImageDto {
  @IsArray() @IsString({ each: true }) @ArrayMaxSize(20) images: string[];
}
