import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from '../../prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ListingFilterDto } from './dto/listing-filter.dto';
import {
  ListingAvailability,
  PartnerStatus,
  Prisma,
} from "@prisma/client";

const TYPE_SPECIFIC_FIELDS = [
  "roomTypes",
  "maxGuests",
  "bedType",
  "bathroomType",
  "languages",
  "nearbyAttractions",
  "cancellationPolicy",
  "smokingAllowed",
  "petsAllowed",
  "childrenAllowed",
  "quietHours",
  "contactPhone",
  "contactEmail",
  "website",
  "socialMedia",
  "unavailableDates",
  "documents",
  "accommodationCategory",
  "unitType",
  "unitDetails",
] as const satisfies readonly (keyof CreateListingDto)[];

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

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

    // Moderation/verification documents are never part of the public contract.
    const { documents: _documents, ...safeExtraData } = listing.extraData;
    return { ...listing, extraData: safeExtraData };
  }

  private pickTypeSpecificData(
    dto: CreateListingDto | UpdateListingDto,
  ): Record<string, unknown> {
    return Object.fromEntries(
      TYPE_SPECIFIC_FIELDS.flatMap((field) =>
        dto[field] === undefined ? [] : [[field, dto[field]]],
      ),
    );
  }

  async create(partnerId: string, dto: CreateListingDto) {
    const {
      type,
      name,
      location,
      region,
      city,
      description,
      images,
      price,
      priceLabel,
      coordinates,
      extraData,
    } = dto;
    const typeSpecificData = this.pickTypeSpecificData(dto);

    const listing = await this.prisma.listing.create({
      data: {
        partnerId,
        type,
        name,
        location,
        region,
        ...(city !== undefined && { city }),
        description,
        images: images ?? [],
        price,
        ...(priceLabel !== undefined && { priceLabel }),
        featured: false,
        published: false,
        ...(coordinates !== undefined && {
          coordinates: coordinates as Prisma.InputJsonValue,
        }),
        extraData: {
          ...(extraData ?? {}),
          ...typeSpecificData,
        } as Prisma.InputJsonValue,
      },
    });
    return listing;
  }

  async findAll(filter: ListingFilterDto) {
    const {
      type,
      region,
      featured,
      minRating,
      minPrice,
      maxPrice,
      q,
      page = 1,
      limit = 20,
    } = filter;
    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      minPrice > maxPrice
    ) {
      throw new BadRequestException(
        "Minimum price cannot be greater than maximum price",
      );
    }
    const where: Prisma.ListingWhereInput = {
      published: true,
      partner: { status: PartnerStatus.VERIFIED },
    };

    if (type) where.type = type;
    if (region) where.region = { contains: region, mode: "insensitive" };
    if (featured !== undefined) where.featured = featured;
    if (minRating !== undefined) where.rating = { gte: minRating };
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      };
    }
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { location: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
      ];
    }

    const safeLimit = Math.min(Math.max(1, limit), 100);
    const safePage = Math.max(1, page);

    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      }),
      this.prisma.listing.count({ where }),
    ]);

    return {
      listings: listings.map((listing) => this.toPublicListing(listing)),
      total,
      page: safePage,
      limit: safeLimit,
    };
  }

  async findOne(id: string) {
    const listing = await this.prisma.listing.findFirst({
      where: {
        id,
        published: true,
        partner: { status: PartnerStatus.VERIFIED },
      },
      include: {
        partner: {
          select: {
            businessName: true,
            status: true,
          },
        },
      },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    return this.toPublicListing(listing);
  }

  async update(id: string, partnerId: string, dto: UpdateListingDto) {
    // Verify ownership
    const listing = await this.prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.partnerId !== partnerId) {
      throw new ForbiddenException('You do not own this listing');
    }

    const {
      name,
      location,
      region,
      city,
      description,
      images,
      price,
      priceLabel,
      coordinates,
      extraData,
    } = dto;
    const typeSpecificData = this.pickTypeSpecificData(dto);
    const updateData: Prisma.ListingUpdateInput = {};

    if (name !== undefined) updateData.name = name;
    if (location !== undefined) updateData.location = location;
    if (region !== undefined) updateData.region = region;
    if (city !== undefined) updateData.city = city;
    if (description !== undefined) updateData.description = description;
    if (images !== undefined) updateData.images = images;
    if (price !== undefined) updateData.price = price;
    if (priceLabel !== undefined) updateData.priceLabel = priceLabel;
    if (coordinates !== undefined) {
      updateData.coordinates = coordinates as Prisma.InputJsonValue;
    }

    const typeSpecificEntries = Object.entries(typeSpecificData);
    if (extraData !== undefined || typeSpecificEntries.length > 0) {
      const currentExtraData =
        listing.extraData &&
        typeof listing.extraData === "object" &&
        !Array.isArray(listing.extraData)
          ? listing.extraData
          : {};
      updateData.extraData = {
        ...currentExtraData,
        ...(extraData ?? {}),
        ...Object.fromEntries(typeSpecificEntries),
      } as Prisma.InputJsonValue;
    }

    return this.prisma.listing.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string, partnerId: string) {
    // Verify ownership
    const listing = await this.prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.partnerId !== partnerId) {
      throw new ForbiddenException('You do not own this listing');
    }

    await this.prisma.listing.delete({
      where: { id },
    });
  }

  async findByPartner(partnerId: string) {
    const listings = await this.prisma.listing.findMany({
      where: { partnerId },
      orderBy: { createdAt: 'desc' },
    });
    return listings;
  }

  async updateImages(id: string, dto: { images: string[] }, partnerId: string) {
    // Verify ownership
    const listing = await this.prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.partnerId !== partnerId) {
      throw new ForbiddenException('You do not own this listing');
    }

    return this.prisma.listing.update({
      where: { id },
      data: { images: dto.images },
    });
  }

  async updateAvailability(id: string, dto: { availability: string }, partnerId: string) {
    // Verify ownership
    const listing = await this.prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.partnerId !== partnerId) {
      throw new ForbiddenException('You do not own this listing');
    }

    return this.prisma.listing.update({
      where: { id },
      data: { availability: dto.availability as ListingAvailability },
    });
  }

  // Admin methods
  async adminFindAll(filter: ListingFilterDto) {
    const {
      type,
      region,
      featured,
      published,
      minRating,
      minPrice,
      maxPrice,
      q,
      page = 1,
      limit = 50,
    } = filter;
    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      minPrice > maxPrice
    ) {
      throw new BadRequestException(
        "Minimum price cannot be greater than maximum price",
      );
    }
    const where: Prisma.ListingWhereInput = {};
    
    if (type) where.type = type;
    if (region) where.region = { contains: region, mode: "insensitive" };
    if (featured !== undefined) where.featured = featured;
    if (published !== undefined) where.published = published;
    if (minRating !== undefined) where.rating = { gte: minRating };
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      };
    }
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { location: { contains: q, mode: "insensitive" } },
      ];
    }

    const safeLimit = Math.min(Math.max(1, limit), 100);
    const safePage = Math.max(1, page);
    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.listing.count({ where }),
    ]);

    return { listings, total, page: safePage, limit: safeLimit };
  }

  async adminSetPublished(id: string, published: boolean) {
    const existingListing = await this.prisma.listing.findUnique({
      where: { id },
      select: {
        id: true,
        partner: { select: { status: true } },
      },
    });

    if (!existingListing) {
      throw new NotFoundException('Listing not found');
    }
    if (
      published &&
      existingListing.partner.status !== PartnerStatus.VERIFIED
    ) {
      throw new BadRequestException(
        "Only listings from verified partners can be published",
      );
    }

    return this.prisma.listing.update({
      where: { id },
      data: { published },
      select: { id: true, name: true, published: true, type: true },
    });
  }

  async adminSetFeatured(id: string, featured: boolean) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    return this.prisma.listing.update({
      where: { id },
      data: { featured },
      select: { id: true, name: true, featured: true, type: true },
    });
  }

}
