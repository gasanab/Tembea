import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateTicketCategoryDto } from './create-ticket-category.dto';

export class UpdateTicketCategoryDto extends PartialType(
  OmitType(CreateTicketCategoryDto, ['listingId'] as const),
) {}
