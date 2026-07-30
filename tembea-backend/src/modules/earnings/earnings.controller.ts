import { Controller, Get, Post, Query, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { EarningsService } from "./earnings.service";
import { PayoutRequestDto } from "./dto/payout-request.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Role } from "@prisma/client";

@ApiTags("earnings")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("earnings")
export class EarningsController {
  constructor(private earningsService: EarningsService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.PARTNER)
  @ApiOperation({ summary: "Get my earnings breakdown (partner)" })
  getMyEarnings(@CurrentUser() user) {
    return this.earningsService.getPartnerEarnings(
      user.partner?.id,
    );
  }

  @Post("payout-request")
  @UseGuards(RolesGuard)
  @Roles(Role.PARTNER)
  @ApiOperation({ summary: "Request a payout (partner)" })
  requestPayout(@CurrentUser() user, @Body() dto: PayoutRequestDto) {
    return this.earningsService.requestPayout(
      user.id,
      user.partner?.id,
      dto,
    );
  }

  @Get("payout-requests")
  @UseGuards(RolesGuard)
  @Roles(Role.PARTNER)
  @ApiOperation({ summary: "Get my payout requests (partner)" })
  getPayoutRequests(@CurrentUser() user) {
    return this.earningsService.getPayoutRequests(user.partner?.id);
  }

  @Get("admin")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Get platform-wide earnings (admin)" })
  @ApiQuery({ name: "year", required: false, type: Number })
  getAllEarnings(@Query("year") year?: string) {
    const yearNumber = year ? parseInt(year, 10) : undefined;
    return this.earningsService.getAllEarnings(yearNumber);
  }
}
