import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ListingType, PartnerStatus, Prisma } from "@prisma/client";

export interface SearchQuery {
  q?: string;
  type?: ListingType;
  region?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  page?: number;
  limit?: number;
}

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  private toPublicListing<T extends { extraData: Prisma.JsonValue }>(
    listing: T,
  ): T {
    if (
      !listing.extraData ||
      typeof listing.extraData !== "object" ||
      Array.isArray(listing.extraData)
    ) {
      return listing;
    }
    const { documents: _documents, ...safeExtraData } = listing.extraData;
    return { ...listing, extraData: safeExtraData };
  }

  async search(query: SearchQuery) {
    const {
      q,
      type,
      region,
      minPrice,
      maxPrice,
      minRating,
      page = 1,
      limit = 20,
    } = query;
    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      minPrice > maxPrice
    ) {
      throw new BadRequestException(
        "Minimum price cannot be greater than maximum price",
      );
    }
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 100);
    const searchText = q?.trim();
    const regionText = region?.trim();

    const where: Prisma.ListingWhereInput = {
      published: true,
      partner: { status: PartnerStatus.VERIFIED },
      ...(type && { type }),
      ...(regionText && {
        region: { contains: regionText, mode: "insensitive" },
      }),
      ...(minPrice !== undefined && { price: { gte: minPrice } }),
      ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
      ...(minRating !== undefined && { rating: { gte: minRating } }),
      ...(searchText && {
        OR: [
          { name: { contains: searchText, mode: "insensitive" } },
          { description: { contains: searchText, mode: "insensitive" } },
          { location: { contains: searchText, mode: "insensitive" } },
          { city: { contains: searchText, mode: "insensitive" } },
          { region: { contains: searchText, mode: "insensitive" } },
        ],
      }),
    };

    const [results, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
        include: {
          partner: { select: { businessName: true } },
        },
        orderBy: [{ featured: "desc" }, { rating: "desc" }, { reviewCount: "desc" }],
      }),
      this.prisma.listing.count({ where }),
    ]);

    return {
      results: results.map((listing) => this.toPublicListing(listing)),
      total,
      page: safePage,
      limit: safeLimit,
      query: searchText,
    };
  }

  async getSuggestions(q: string) {
    if (!q || q.length < 2) return [];
    const listings = await this.prisma.listing.findMany({
      where: {
        published: true,
        partner: { status: PartnerStatus.VERIFIED },
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { location: { contains: q, mode: "insensitive" } },
          { region: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, type: true, location: true, region: true },
      take: 8,
      orderBy: { rating: "desc" },
    });
    return listings;
  }
}
