import { IsString, IsEnum, IsOptional, IsArray } from 'class-validator';
import { NotificationType } from '@prisma/client';
export class SendNotificationDto {
  @IsArray() @IsString({ each: true }) userIds: string[];
  @IsString() title: string;
  @IsString() message: string;
  @IsOptional() @IsEnum(NotificationType) type?: NotificationType;
}
