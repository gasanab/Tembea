import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { WishlistService } from "./wishlist.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("wishlist")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("wishlist")
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: "Get my wishlist (client)" })
  getWishlist(@CurrentUser() user) {
    return this.wishlistService.getWishlist(user.id);
  }

  @Post(":listingId")
  @ApiOperation({ summary: "Add a listing to wishlist" })
  add(@CurrentUser() user, @Param("listingId") listingId: string) {
    return this.wishlistService.add(user.id, listingId);
  }

  @Delete(":listingId")
  @ApiOperation({ summary: "Remove a listing from wishlist" })
  remove(@CurrentUser() user, @Param("listingId") listingId: string) {
    return this.wishlistService.remove(user.id, listingId);
  }

  @Get(":listingId/check")
  @ApiOperation({ summary: "Check if a listing is in my wishlist" })
  check(@CurrentUser() user, @Param("listingId") listingId: string) {
    return this.wishlistService.isWishlisted(user.id, listingId);
  }
}
