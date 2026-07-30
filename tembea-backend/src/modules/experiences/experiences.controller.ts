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
import { ExperiencesService } from "./experiences.service";
import { CreateExperienceDetailDto } from "./dto/create-experience-detail.dto";
import { UpdateExperienceDetailDto } from "./dto/update-experience-detail.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Role } from "@prisma/client";
import { VerifiedPartnerGuard } from "../../common/guards/verified-partner.guard";
import { getPartnerIdOrThrow } from "../../common/utils/partner-context";

@ApiTags("experiences")
@Controller("experiences")
export class ExperiencesController {
  constructor(private experiencesService: ExperiencesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      "Create experience details for a PARKS/MUSEUMS/MEMORIAL_SITES/TOURS listing (partner)",
  })
  create(@CurrentUser() user, @Body() dto: CreateExperienceDetailDto) {
    return this.experiencesService.create(dto, getPartnerIdOrThrow(user));
  }

  @Get("mine/listing/:listingId")
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get my experience details for a listing, including drafts",
  })
  findMineByListing(
    @Param("listingId") listingId: string,
    @CurrentUser() user,
  ) {
    return this.experiencesService.findMineByListing(
      listingId,
      getPartnerIdOrThrow(user),
    );
  }

  @Get("mine/:id")
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get one of my experience details, including draft data",
  })
  findMine(@Param("id") id: string, @CurrentUser() user) {
    return this.experiencesService.findMine(
      id,
      getPartnerIdOrThrow(user),
    );
  }

  @Get("listing/:listingId")
  @ApiOperation({
    summary: "Get experience details for a public, verified listing",
  })
  findByListing(@Param("listingId") listingId: string) {
    return this.experiencesService.findByListing(listingId);
  }

  @Get(":id")
  @ApiOperation({
    summary: "Get experience details from a public, verified listing",
  })
  findOne(@Param("id") id: string) {
    return this.experiencesService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update experience details (owner only)" })
  update(
    @Param("id") id: string,
    @CurrentUser() user,
    @Body() dto: UpdateExperienceDetailDto,
  ) {
    return this.experiencesService.update(id, dto, getPartnerIdOrThrow(user));
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete experience details (owner only)" })
  remove(@Param("id") id: string, @CurrentUser() user) {
    return this.experiencesService.remove(id, getPartnerIdOrThrow(user));
  }
}
