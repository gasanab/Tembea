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
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { UpdateRoomAvailabilityDto } from './dto/update-room-availability.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a room for a listing (partner)' })
  create(@CurrentUser() user, @Body() dto: CreateRoomDto) {
    return this.roomsService.create(dto, getPartnerIdOrThrow(user));
  }

  @Get('mine/listing/:listingId')
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my rooms for a listing, including drafts' })
  findMineByListing(
    @Param('listingId') listingId: string,
    @CurrentUser() user,
  ) {
    return this.roomsService.findMineByListing(
      listingId,
      getPartnerIdOrThrow(user),
    );
  }

  @Get('mine/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get one of my rooms, including draft listing rooms' })
  findMine(@Param('id') id: string, @CurrentUser() user) {
    return this.roomsService.findMine(id, getPartnerIdOrThrow(user));
  }

  @Get('listing/:listingId')
  @ApiOperation({ summary: 'Get rooms for a public, verified listing' })
  findByListing(@Param('listingId') listingId: string) {
    return this.roomsService.findByListing(listingId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a room from a public, verified listing' })
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a room (owner only)' })
  update(
    @Param('id') id: string,
    @CurrentUser() user,
    @Body() dto: UpdateRoomDto,
  ) {
    return this.roomsService.update(id, dto, getPartnerIdOrThrow(user));
  }

  @Patch(':id/availability')
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle room availability (owner only)' })
  updateAvailability(
    @Param('id') id: string,
    @CurrentUser() user,
    @Body() dto: UpdateRoomAvailabilityDto,
  ) {
    return this.roomsService.updateAvailability(
      id,
      dto,
      getPartnerIdOrThrow(user),
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a room (owner only)' })
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.roomsService.remove(id, getPartnerIdOrThrow(user));
  }
}
