import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateReviewDto, ReplyReviewDto } from "./dto/create-review.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { BookingStatus, PaymentStatus, Prisma } from "@prisma/client";
import { PUBLIC_LISTING_WHERE } from "../../common/prisma/public-listing.where";

const REVIEW_RESPONSE_SELECT = {
  id: true,
  rating: true,
  comment: true,
  reply: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      name: true,
      avatar: true,
    },
  },
} satisfies Prisma.ReviewSelect;

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async findByListing(listingId: string, pagination: PaginationDto) {
    const { page = 1, limit = 20 } = pagination;
    const where = {
      listingId,
      listing: { is: PUBLIC_LISTING_WHERE },
    } satisfies Prisma.ReviewWhereInput;
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        select: REVIEW_RESPONSE_SELECT,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.review.count({ where }),
    ]);
    return { reviews, total, page, limit };
  }

  async findMineByListing(
    listingId: string,
    partnerId: string,
    pagination: PaginationDto,
  ) {
    const listing = await this.prisma.listing.findFirst({
      where: { id: listingId, partnerId },
      select: { id: true },
    });
    if (!listing) throw new NotFoundException("Listing not found");

    const { page = 1, limit = 20 } = pagination;
    const where = { listingId };
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        select: REVIEW_RESPONSE_SELECT,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.review.count({ where }),
    ]);
    return { reviews, total, page, limit };
  }

  async create(userId: string, dto: CreateReviewDto) {
    const eligibleBooking = await this.prisma.booking.findFirst({
      where: {
        userId,
        listingId: dto.listingId,
        status: {
          in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED],
        },
        payment: {
          is: { status: PaymentStatus.PAID },
        },
      },
      select: { id: true },
    });
    if (!eligibleBooking) {
      throw new ForbiddenException(
        "You can only review a listing after an eligible paid booking",
      );
    }

    const existing = await this.prisma.review.findUnique({
      where: { userId_listingId: { userId, listingId: dto.listingId } },
    });
    if (existing)
      throw new ConflictException("You have already reviewed this listing");

    const review = await this.prisma.review.create({
      data: { userId, listingId: dto.listingId, rating: dto.rating, comment: dto.comment },
      include: { user: { select: { name: true, avatar: true } } },
    });

    // Recalculate listing rating
    await this.recalculateRating(dto.listingId);
    return review;
  }

  async reply(reviewId: string, partnerId: string, dto: ReplyReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: { listing: { select: { partnerId: true } } },
    });
    if (!review) throw new NotFoundException("Review not found");
    if (review.listing.partnerId !== partnerId)
      throw new ForbiddenException("You can only reply to reviews on your own listings");

    return this.prisma.review.update({
      where: { id: reviewId },
      data: { reply: dto.reply },
    });
  }

  private async recalculateRating(listingId: string) {
    const result = await this.prisma.review.aggregate({
      where: { listingId },
      _avg: { rating: true },
      _count: { id: true },
    });
    await this.prisma.listing.update({
      where: { id: listingId },
      data: {
        rating: result._avg.rating ?? 0,
        reviewCount: result._count.id,
      },
    });
  }
}
