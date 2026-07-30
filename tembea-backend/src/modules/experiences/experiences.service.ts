import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateExperienceDetailDto } from "./dto/create-experience-detail.dto";
import { UpdateExperienceDetailDto } from "./dto/update-experience-detail.dto";
import { ListingType } from "@prisma/client";
import { PUBLIC_LISTING_WHERE } from "../../common/prisma/public-listing.where";

const EXPERIENCE_LISTING_TYPES: ListingType[] = [
  ListingType.PARKS,
  ListingType.MUSEUMS,
  ListingType.MEMORIAL_SITES,
  ListingType.TOURS,
];

@Injectable()
export class ExperiencesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateExperienceDetailDto, partnerId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: dto.listingId },
    });

    if (!listing) {
      throw new NotFoundException("Listing not found");
    }
    if (listing.partnerId !== partnerId) {
      throw new ForbiddenException("You do not own this listing");
    }
    if (!EXPERIENCE_LISTING_TYPES.includes(listing.type)) {
      throw new BadRequestException(
        `Experience details can only be added to listings of type: ${EXPERIENCE_LISTING_TYPES.join(", ")}`,
      );
    }

    const existing = await this.prisma.experienceDetail.findUnique({
      where: { listingId: dto.listingId },
    });
    if (existing) {
      throw new BadRequestException(
        "Experience details already exist for this listing",
      );
    }

    return this.prisma.experienceDetail.create({
      data: {
        listingId: dto.listingId,
        entryFee: dto.entryFee,
        openingTime: dto.openingTime,
        closingTime: dto.closingTime,
        closedDays: dto.closedDays ?? [],
        packages: dto.packages ?? [],
        highlights: dto.highlights ?? [],
        ageLimit: dto.ageLimit,
        maxGroupSize: dto.maxGroupSize,
        guidedTours: dto.guidedTours ?? false,
        bookingRequired: dto.bookingRequired ?? true,
        facilities: dto.facilities ?? [],
      },
    });
  }

  async findByListing(listingId: string) {
    return this.prisma.experienceDetail.findFirst({
      where: {
        listingId,
        listing: { is: PUBLIC_LISTING_WHERE },
      },
      include: {
        listing: {
          select: { id: true, name: true, location: true, rating: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const detail = await this.prisma.experienceDetail.findFirst({
      where: {
        id,
        listing: { is: PUBLIC_LISTING_WHERE },
      },
      include: {
        listing: {
          select: { id: true, name: true, location: true, rating: true },
        },
      },
    });

    if (!detail) {
      throw new NotFoundException("Experience detail not found");
    }
    return detail;
  }

  async findMineByListing(listingId: string, partnerId: string) {
    const detail = await this.prisma.experienceDetail.findFirst({
      where: {
        listingId,
        listing: { is: { partnerId } },
      },
      include: {
        listing: {
          select: { id: true, name: true, partnerId: true, published: true },
        },
      },
    });
    if (!detail) throw new NotFoundException("Experience detail not found");
    return detail;
  }

  async findMine(id: string, partnerId: string) {
    const detail = await this.prisma.experienceDetail.findFirst({
      where: {
        id,
        listing: { is: { partnerId } },
      },
      include: {
        listing: {
          select: { id: true, name: true, partnerId: true, published: true },
        },
      },
    });
    if (!detail) throw new NotFoundException("Experience detail not found");
    return detail;
  }

  async update(
    id: string,
    dto: UpdateExperienceDetailDto,
    partnerId: string,
  ) {
    const detail = await this.prisma.experienceDetail.findUnique({
      where: { id },
      include: { listing: true },
    });

    if (!detail) {
      throw new NotFoundException("Experience detail not found");
    }
    if (detail.listing.partnerId !== partnerId) {
      throw new ForbiddenException("You do not own this experience detail");
    }

    return this.prisma.experienceDetail.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, partnerId: string) {
    const detail = await this.prisma.experienceDetail.findUnique({
      where: { id },
      include: { listing: true },
    });

    if (!detail) {
      throw new NotFoundException("Experience detail not found");
    }
    if (detail.listing.partnerId !== partnerId) {
      throw new ForbiddenException("You do not own this experience detail");
    }

    await this.prisma.experienceDetail.delete({ where: { id } });
    return { message: "Experience detail deleted" };
  }
}
