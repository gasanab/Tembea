import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { VerifiedPartnerGuard } from '../../common/guards/verified-partner.guard';
import { getPartnerIdOrThrow } from '../../common/utils/partner-context';
import { EventTicketsService } from './event-tickets.service';
import { CreateTicketCategoryDto } from './dto/create-ticket-category.dto';
import { UpdateTicketCategoryDto } from './dto/update-ticket-category.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('event-tickets')
@Controller('event-tickets')
export class EventTicketsController {
  constructor(private eventTicketsService: EventTicketsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a ticket category for an event listing (partner)' })
  create(@CurrentUser() user, @Body() dto: CreateTicketCategoryDto) {
    return this.eventTicketsService.create(dto, getPartnerIdOrThrow(user));
  }

  @Get('mine/listing/:listingId')
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get my ticket categories for a listing, including drafts',
  })
  findMineByListing(
    @Param('listingId') listingId: string,
    @CurrentUser() user,
  ) {
    return this.eventTicketsService.findMineByListing(
      listingId,
      getPartnerIdOrThrow(user),
    );
  }

  @Get('mine/:id/availability')
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get availability for one of my ticket categories' })
  getMineAvailability(@Param('id') id: string, @CurrentUser() user) {
    return this.eventTicketsService.getMineAvailability(
      id,
      getPartnerIdOrThrow(user),
    );
  }

  @Get('mine/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get one of my ticket categories, including draft listing data',
  })
  findMine(@Param('id') id: string, @CurrentUser() user) {
    return this.eventTicketsService.findMine(
      id,
      getPartnerIdOrThrow(user),
    );
  }

  @Get('listing/:listingId')
  @ApiOperation({
    summary: 'Get ticket categories for a public, verified listing',
  })
  findByListing(@Param('listingId') listingId: string) {
    return this.eventTicketsService.findByListing(listingId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a ticket category from a public, verified listing',
  })
  findOne(@Param('id') id: string) {
    return this.eventTicketsService.findOne(id);
  }

  @Get(':id/availability')
  @ApiOperation({
    summary: 'Get seat availability for a public ticket category',
  })
  getAvailability(@Param('id') id: string) {
    return this.eventTicketsService.getAvailability(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a ticket category (owner only)' })
  update(
    @Param('id') id: string,
    @CurrentUser() user,
    @Body() dto: UpdateTicketCategoryDto,
  ) {
    return this.eventTicketsService.update(
      id,
      dto,
      getPartnerIdOrThrow(user),
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a ticket category (owner only, no sold tickets)' })
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.eventTicketsService.remove(id, getPartnerIdOrThrow(user));
  }
}
