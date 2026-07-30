import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { PUBLIC_LISTING_WHERE } from "../../common/prisma/public-listing.where";

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async getWishlist(userId: string) {
    return this.prisma.wishlist.findMany({
      where: {
        userId,
        listing: { is: PUBLIC_LISTING_WHERE },
      },
      include: {
        listing: {
          select: {
            id: true,
            name: true,
            type: true,
            location: true,
            region: true,
            images: true,
            price: true,
            priceLabel: true,
            rating: true,
            reviewCount: true,
            availability: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async add(userId: string, listingId: string) {
    const listing = await this.prisma.listing.findFirst({
      where: {
        id: listingId,
        ...PUBLIC_LISTING_WHERE,
      },
    });
    if (!listing) throw new NotFoundException("Listing not found");

    const existing = await this.prisma.wishlist.findUnique({
      where: { userId_listingId: { userId, listingId } },
    });
    if (existing) throw new ConflictException("Already in wishlist");

    return this.prisma.wishlist.create({
      data: { userId, listingId },
      include: { listing: { select: { id: true, name: true, type: true } } },
    });
  }

  async remove(userId: string, listingId: string) {
    const entry = await this.prisma.wishlist.findUnique({
      where: { userId_listingId: { userId, listingId } },
    });
    if (!entry) throw new NotFoundException("Not in wishlist");

    await this.prisma.wishlist.delete({
      where: { userId_listingId: { userId, listingId } },
    });
    return { message: "Removed from wishlist" };
  }

  async isWishlisted(userId: string, listingId: string) {
    const entry = await this.prisma.wishlist.findFirst({
      where: {
        userId,
        listingId,
        listing: { is: PUBLIC_LISTING_WHERE },
      },
    });
    return { wishlisted: !!entry };
  }
}
