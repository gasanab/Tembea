import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { VehiclesService } from "./vehicles.service";
import { CreateVehicleDto } from "./dto/create-vehicle.dto";
import { UpdateVehicleDto } from "./dto/update-vehicle.dto";
import { VehicleAvailabilityDto } from "./dto/vehicle-availability.dto";
import { AssignDriverDto } from "./dto/assign-driver.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Role } from "@prisma/client";
import { VerifiedPartnerGuard } from "../../common/guards/verified-partner.guard";
import { getPartnerIdOrThrow } from "../../common/utils/partner-context";

@ApiTags("vehicles")
@Controller("vehicles")
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a vehicle for a TRANSPORT listing (partner)" })
  create(@CurrentUser() user, @Body() dto: CreateVehicleDto) {
    return this.vehiclesService.create(dto, getPartnerIdOrThrow(user));
  }

  @Get("mine/listing/:listingId")
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get my vehicles for a listing, including drafts and driver data",
  })
  findMineByListing(
    @Param("listingId") listingId: string,
    @CurrentUser() user,
  ) {
    return this.vehiclesService.findMineByListing(
      listingId,
      getPartnerIdOrThrow(user),
    );
  }

  @Get("mine/:id")
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get one of my vehicles, including draft and driver data",
  })
  findMine(@Param("id") id: string, @CurrentUser() user) {
    return this.vehiclesService.findMine(id, getPartnerIdOrThrow(user));
  }

  @Get("listing/:listingId")
  @ApiOperation({
    summary: "Get vehicles for a public, verified listing",
  })
  findByListing(@Param("listingId") listingId: string) {
    return this.vehiclesService.findByListing(listingId);
  }

  @Get(":id")
  @ApiOperation({
    summary: "Get a vehicle from a public, verified listing",
  })
  findOne(@Param("id") id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a vehicle (owner only)" })
  update(
    @Param("id") id: string,
    @CurrentUser() user,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.vehiclesService.update(id, dto, getPartnerIdOrThrow(user));
  }

  @Patch(":id/availability")
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update vehicle availability (owner only)" })
  updateAvailability(
    @Param("id") id: string,
    @CurrentUser() user,
    @Body() dto: VehicleAvailabilityDto,
  ) {
    return this.vehiclesService.updateAvailability(
      id,
      dto,
      getPartnerIdOrThrow(user),
    );
  }

  @Patch(":id/assign-driver")
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Assign a driver to a vehicle (owner only)" })
  assignDriver(
    @Param("id") id: string,
    @CurrentUser() user,
    @Body() dto: AssignDriverDto,
  ) {
    return this.vehiclesService.assignDriver(
      id,
      dto,
      getPartnerIdOrThrow(user),
    );
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a vehicle (owner only)" })
  remove(@Param("id") id: string, @CurrentUser() user) {
    return this.vehiclesService.remove(id, getPartnerIdOrThrow(user));
  }
}
