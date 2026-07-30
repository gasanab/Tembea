import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AnalyticsService } from "./analytics.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Role } from "@prisma/client";
import { getPartnerIdOrThrow } from "../../common/utils/partner-context";

@ApiTags("analytics")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("analytics")
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get("overview")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Platform overview stats (admin)" })
  getOverview() {
    return this.analyticsService.getOverview();
  }

  @Get("listings")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Listing breakdown by type (admin)" })
  getListingStats() {
    return this.analyticsService.getListingStats();
  }

  @Get("bookings")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Booking breakdown by status (admin)" })
  getBookingStats() {
    return this.analyticsService.getBookingStats();
  }

  @Get("partner")
  @Roles(Role.PARTNER)
  @ApiOperation({ summary: "Partner analytics: listings, bookings, revenue, reviews" })
  getPartnerAnalytics(@CurrentUser() user) {
    return this.analyticsService.getPartnerAnalytics(getPartnerIdOrThrow(user));
  }
}
