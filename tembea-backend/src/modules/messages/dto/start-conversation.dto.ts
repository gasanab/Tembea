import { IsString, IsOptional } from 'class-validator';
export class StartConversationDto {
  @IsString() partnerId: string;
  @IsOptional() @IsString() listingId?: string;
  @IsString() firstMessage: string;
}
