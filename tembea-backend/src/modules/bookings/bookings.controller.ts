import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { BookingsService } from "./bookings.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { UpdateBookingStatusDto } from "./dto/update-booking-status.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Role } from "@prisma/client";

@ApiTags("bookings")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("bookings")
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new booking" })
  create(@CurrentUser() user, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: "Get my bookings (client)" })
  findMine(@CurrentUser() user, @Query() pagination: PaginationDto) {
    return this.bookingsService.findMyBookings(user.id, pagination);
  }

  @Get("partner")
  @UseGuards(RolesGuard)
  @Roles(Role.PARTNER, Role.ADMIN)
  @ApiOperation({ summary: "Get bookings for partner listings" })
  findPartnerBookings(@CurrentUser() user, @Query() pagination: PaginationDto) {
    return this.bookingsService.findPartnerBookings(
      user.partner?.id ?? user.id,
      pagination,
    );
  }

  @Get("admin/all")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Get all bookings (admin)" })
  findAll(@Query() pagination: PaginationDto) {
    return this.bookingsService.findAllBookings(pagination);
  }

  @Get("partner/stats")
  @UseGuards(RolesGuard)
  @Roles(Role.PARTNER, Role.ADMIN)
  @ApiOperation({ summary: "Get partner analytics and stats" })
  getPartnerStats(@CurrentUser() user) {
    return this.bookingsService.getPartnerStats(user.partner?.id ?? user.id);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single booking by ID" })
  findOne(@Param("id") id: string, @CurrentUser() user) {
    return this.bookingsService.findOne(id, user.id, user.role, user.partner?.id);
  }

  @Patch(":id/cancel")
  @ApiOperation({ summary: "Cancel a booking (client — only PENDING or APPROVED)" })
  cancelBooking(@Param("id") id: string, @CurrentUser() user) {
    return this.bookingsService.cancelByClient(id, user.id);
  }

  @Patch(":id/status")
  @UseGuards(RolesGuard)
  @Roles(Role.PARTNER, Role.ADMIN)
  @ApiOperation({ summary: "Update booking status (partner/admin)" })
  updateStatus(
    @Param("id") id: string,
    @CurrentUser() user,
    @Body() body: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateStatus(
      id,
      body.status,
      user.partner?.id ?? user.id,
      user.role,
    );
  }
}
