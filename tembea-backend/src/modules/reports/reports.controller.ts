import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { ReportsService } from "./reports.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "@prisma/client";
import { ReportQueryDto, YearQueryDto } from "./dto/report-query.dto";

@ApiTags("reports")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller("reports")
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get()
  @ApiOperation({ summary: "Generate a report (admin)" })
  getReport(@Query() query: ReportQueryDto) {
    return this.reportsService.getReport(query.type, query.year);
  }

  @Get("financial")
  @ApiOperation({ summary: "Financial report" })
  financial(@Query() query: YearQueryDto) {
    return this.reportsService.generateFinancialReport(query.year);
  }

  @Get("partners")
  @ApiOperation({ summary: "Partners report" })
  partners() {
    return this.reportsService.generatePartnersReport();
  }

  @Get("bookings")
  @ApiOperation({ summary: "Bookings report" })
  bookings(@Query() query: YearQueryDto) {
    return this.reportsService.generateBookingsReport(query.year);
  }

  @Get("users")
  @ApiOperation({ summary: "Users report" })
  users() {
    return this.reportsService.generateUsersReport();
  }

  @Get("marketplace")
  @ApiOperation({ summary: "Marketplace orders report" })
  marketplace(@Query() query: YearQueryDto) {
    return this.reportsService.generateMarketplaceReport(query.year);
  }
}
