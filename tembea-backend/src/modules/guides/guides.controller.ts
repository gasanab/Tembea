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
import { GuidesService } from "./guides.service";
import { CreateGuideProfileDto } from "./dto/create-guide-profile.dto";
import { UpdateGuideProfileDto } from "./dto/update-guide-profile.dto";
import { CreateTourPackageDto } from "./dto/create-tour-package.dto";
import { UpdateTourPackageDto } from "./dto/update-tour-package.dto";
import { GuideAvailabilityDto } from "./dto/guide-availability.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Role } from "@prisma/client";
import { VerifiedPartnerGuard } from "../../common/guards/verified-partner.guard";
import { getPartnerIdOrThrow } from "../../common/utils/partner-context";

@ApiTags("guides")
@Controller("guides")
export class GuidesController {
  constructor(private guidesService: GuidesService) {}

  @Post("profile")
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a guide profile for a GUIDES listing (partner)" })
  createProfile(@CurrentUser() user, @Body() dto: CreateGuideProfileDto) {
    return this.guidesService.createProfile(dto, getPartnerIdOrThrow(user));
  }

  @Get("mine/listing/:listingId")
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get my guide profile and packages, including draft data",
  })
  findMineByListing(
    @Param("listingId") listingId: string,
    @CurrentUser() user,
  ) {
    return this.guidesService.findMineByListing(
      listingId,
      getPartnerIdOrThrow(user),
    );
  }

  @Get("mine/profile/:id")
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get one of my guide profiles, including draft data",
  })
  findMine(@Param("id") id: string, @CurrentUser() user) {
    return this.guidesService.findMine(id, getPartnerIdOrThrow(user));
  }

  @Get("listing/:listingId")
  @ApiOperation({
    summary: "Get a guide profile for a public, verified listing",
  })
  findByListing(@Param("listingId") listingId: string) {
    return this.guidesService.findByListing(listingId);
  }

  @Get("profile/:id")
  @ApiOperation({
    summary: "Get a guide profile from a public, verified listing",
  })
  findOne(@Param("id") id: string) {
    return this.guidesService.findOne(id);
  }

  @Patch("profile/:id")
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a guide profile (owner only)" })
  updateProfile(
    @Param("id") id: string,
    @CurrentUser() user,
    @Body() dto: UpdateGuideProfileDto,
  ) {
    return this.guidesService.updateProfile(
      id,
      dto,
      getPartnerIdOrThrow(user),
    );
  }

  @Patch("profile/:id/availability")
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update guide availability days (owner only)" })
  updateAvailability(
    @Param("id") id: string,
    @CurrentUser() user,
    @Body() dto: GuideAvailabilityDto,
  ) {
    return this.guidesService.updateAvailability(
      id,
      dto,
      getPartnerIdOrThrow(user),
    );
  }

  @Post("packages")
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a tour package for a guide profile (partner)" })
  createPackage(@CurrentUser() user, @Body() dto: CreateTourPackageDto) {
    return this.guidesService.createPackage(dto, getPartnerIdOrThrow(user));
  }

  @Patch("packages/:packageId")
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a tour package (owner only)" })
  updatePackage(
    @Param("packageId") packageId: string,
    @CurrentUser() user,
    @Body() dto: UpdateTourPackageDto,
  ) {
    return this.guidesService.updatePackage(
      packageId,
      dto,
      getPartnerIdOrThrow(user),
    );
  }

  @Delete("packages/:packageId")
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a tour package (owner only)" })
  removePackage(
    @Param("packageId") packageId: string,
    @CurrentUser() user,
  ) {
    return this.guidesService.removePackage(
      packageId,
      getPartnerIdOrThrow(user),
    );
  }
}
