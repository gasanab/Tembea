import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { ListingsService } from "./listings.service";
import { CreateListingDto } from "./dto/create-listing.dto";
import { UpdateListingDto } from "./dto/update-listing.dto";
import { ListingFilterDto } from "./dto/listing-filter.dto";
import { ListingImageDto } from "./dto/listing-image.dto";
import { ListingAvailabilityDto } from "./dto/listing-availability.dto";
import { ListingFeaturedDto } from "./dto/listing-featured.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Role } from "@prisma/client";
import { VerifiedPartnerGuard } from "../../common/guards/verified-partner.guard";
import { getPartnerIdOrThrow } from "../../common/utils/partner-context";

@ApiTags("listings")
@Controller("listings")
export class ListingsController {
  constructor(private listingsService: ListingsService) {}

  @Get()
  @ApiOperation({ summary: "Get all published listings with filters" })
  findAll(@Query() filter: ListingFilterDto) {
    return this.listingsService.findAll(filter);
  }

  @Get("admin/all")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin: list all listings (including unpublished)" })
  adminFindAll(@Query() filter: ListingFilterDto) {
    return this.listingsService.adminFindAll(filter);
  }

  @Get("mine")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get listings owned by the current partner" })
  findMine(@CurrentUser() user) {
    return this.listingsService.findByPartner(getPartnerIdOrThrow(user));
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single listing by ID" })
  findOne(@Param("id") id: string) {
    return this.listingsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new listing (partner)" })
  create(@CurrentUser() user, @Body() dto: CreateListingDto) {
    return this.listingsService.create(getPartnerIdOrThrow(user), dto);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a listing (owner only)" })
  update(
    @Param("id") id: string,
    @CurrentUser() user,
    @Body() dto: UpdateListingDto,
  ) {
    return this.listingsService.update(id, getPartnerIdOrThrow(user), dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a listing (owner only)" })
  remove(@Param("id") id: string, @CurrentUser() user) {
    return this.listingsService.remove(id, getPartnerIdOrThrow(user));
  }

  @Patch(":id/images")
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update listing images (partner)" })
  updateImages(
    @Param("id") id: string,
    @CurrentUser() user,
    @Body() dto: ListingImageDto,
  ) {
    return this.listingsService.updateImages(id, dto, getPartnerIdOrThrow(user));
  }

  @Patch(":id/availability")
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update listing availability (partner)" })
  updateAvailability(
    @Param("id") id: string,
    @CurrentUser() user,
    @Body() dto: ListingAvailabilityDto,
  ) {
    return this.listingsService.updateAvailability(
      id,
      dto,
      getPartnerIdOrThrow(user),
    );
  }

  @Patch(":id/admin/publish")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin: approve (publish) a listing" })
  adminApprove(@Param("id") id: string) {
    return this.listingsService.adminSetPublished(id, true);
  }

  @Patch(":id/admin/reject")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin: reject (unpublish) a listing" })
  adminReject(@Param("id") id: string) {
    return this.listingsService.adminSetPublished(id, false);
  }

  @Patch(":id/admin/featured")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin: set listing featured status" })
  adminSetFeatured(
    @Param("id") id: string,
    @Body() dto: ListingFeaturedDto,
  ) {
    return this.listingsService.adminSetFeatured(id, dto.featured);
  }

}
