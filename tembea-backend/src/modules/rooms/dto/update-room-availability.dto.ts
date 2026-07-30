import { IsBoolean } from 'class-validator';

export class UpdateRoomAvailabilityDto {
  @IsBoolean()
  available: boolean;
}
