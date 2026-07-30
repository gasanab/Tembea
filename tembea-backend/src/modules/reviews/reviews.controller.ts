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
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto, ReplyReviewDto } from "./dto/create-review.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Role } from "@prisma/client";
import { VerifiedPartnerGuard } from "../../common/guards/verified-partner.guard";
import { getPartnerIdOrThrow } from "../../common/utils/partner-context";

@ApiTags("reviews")
@Controller("reviews")
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Get("mine/listing/:listingId")
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get reviews for one of my listings, including drafts",
  })
  findMineByListing(
    @Param("listingId") listingId: string,
    @CurrentUser() user,
    @Query() pagination: PaginationDto,
  ) {
    return this.reviewsService.findMineByListing(
      listingId,
      getPartnerIdOrThrow(user),
      pagination,
    );
  }

  @Get("listing/:listingId")
  @ApiOperation({
    summary: "Get reviews for a public, verified listing",
  })
  findByListing(
    @Param("listingId") listingId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.reviewsService.findByListing(listingId, pagination);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Submit a review" })
  create(@CurrentUser() user, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(user.id, dto);
  }

  @Patch(":id/reply")
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Partner reply to a review" })
  reply(
    @Param("id") id: string,
    @CurrentUser() user,
    @Body() dto: ReplyReviewDto,
  ) {
    return this.reviewsService.reply(id, getPartnerIdOrThrow(user), dto);
  }
}
