import { IsEnum } from 'class-validator';
import { ListingAvailability } from '@prisma/client';
export class ListingAvailabilityDto {
  @IsEnum(ListingAvailability) availability: ListingAvailability;
}
