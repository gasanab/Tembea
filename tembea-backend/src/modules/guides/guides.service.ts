import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateGuideProfileDto } from "./dto/create-guide-profile.dto";
import { UpdateGuideProfileDto } from "./dto/update-guide-profile.dto";
import { CreateTourPackageDto } from "./dto/create-tour-package.dto";
import { UpdateTourPackageDto } from "./dto/update-tour-package.dto";
import { GuideAvailabilityDto } from "./dto/guide-availability.dto";
import { ListingType } from "@prisma/client";
import { PUBLIC_LISTING_WHERE } from "../../common/prisma/public-listing.where";

@Injectable()
export class GuidesService {
  constructor(private prisma: PrismaService) {}

  async createProfile(dto: CreateGuideProfileDto, partnerId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: dto.listingId },
    });

    if (!listing) {
      throw new NotFoundException("Listing not found");
    }
    if (listing.partnerId !== partnerId) {
      throw new ForbiddenException("You do not own this listing");
    }
    if (listing.type !== ListingType.GUIDES) {
      throw new BadRequestException(
        "Guide profiles can only be added to GUIDES listings",
      );
    }

    const existing = await this.prisma.guideProfile.findUnique({
      where: { listingId: dto.listingId },
    });
    if (existing) {
      throw new BadRequestException(
        "A guide profile already exists for this listing",
      );
    }

    return this.prisma.guideProfile.create({
      data: {
        listingId: dto.listingId,
        bio: dto.bio,
        languages: dto.languages ?? [],
        certifications: dto.certifications ?? [],
        yearsExperience: dto.yearsExperience,
        specialties: dto.specialties ?? [],
        availability: dto.availability ?? [],
        responseTime: dto.responseTime,
      },
    });
  }

  async findByListing(listingId: string) {
    return this.prisma.guideProfile.findFirst({
      where: {
        listingId,
        listing: { is: PUBLIC_LISTING_WHERE },
      },
      include: {
        packages: {
          where: { available: true },
          orderBy: { price: "asc" },
        },
        listing: {
          select: { id: true, name: true, location: true, rating: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const profile = await this.prisma.guideProfile.findFirst({
      where: {
        id,
        listing: { is: PUBLIC_LISTING_WHERE },
      },
      include: {
        packages: {
          where: { available: true },
          orderBy: { price: "asc" },
        },
        listing: {
          select: { id: true, name: true, location: true, rating: true },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException("Guide profile not found");
    }
    return profile;
  }

  async findMineByListing(listingId: string, partnerId: string) {
    const profile = await this.prisma.guideProfile.findFirst({
      where: {
        listingId,
        listing: { is: { partnerId } },
      },
      include: {
        packages: { orderBy: { createdAt: "desc" } },
        listing: {
          select: { id: true, name: true, partnerId: true, published: true },
        },
      },
    });
    if (!profile) throw new NotFoundException("Guide profile not found");
    return profile;
  }

  async findMine(id: string, partnerId: string) {
    const profile = await this.prisma.guideProfile.findFirst({
      where: {
        id,
        listing: { is: { partnerId } },
      },
      include: {
        packages: { orderBy: { createdAt: "desc" } },
        listing: {
          select: { id: true, name: true, partnerId: true, published: true },
        },
      },
    });
    if (!profile) throw new NotFoundException("Guide profile not found");
    return profile;
  }

  async updateProfile(
    id: string,
    dto: UpdateGuideProfileDto,
    partnerId: string,
  ) {
    const profile = await this.prisma.guideProfile.findUnique({
      where: { id },
      include: { listing: true },
    });

    if (!profile) {
      throw new NotFoundException("Guide profile not found");
    }
    if (profile.listing.partnerId !== partnerId) {
      throw new ForbiddenException("You do not own this guide profile");
    }

    return this.prisma.guideProfile.update({
      where: { id },
      data: dto,
    });
  }

  async updateAvailability(
    id: string,
    dto: GuideAvailabilityDto,
    partnerId: string,
  ) {
    const profile = await this.prisma.guideProfile.findUnique({
      where: { id },
      include: { listing: true },
    });

    if (!profile) {
      throw new NotFoundException("Guide profile not found");
    }
    if (profile.listing.partnerId !== partnerId) {
      throw new ForbiddenException("You do not own this guide profile");
    }

    return this.prisma.guideProfile.update({
      where: { id },
      data: { availability: dto.availability },
    });
  }

  async createPackage(dto: CreateTourPackageDto, partnerId: string) {
    const profile = await this.prisma.guideProfile.findUnique({
      where: { id: dto.guideId },
      include: { listing: true },
    });

    if (!profile) {
      throw new NotFoundException("Guide profile not found");
    }
    if (profile.listing.partnerId !== partnerId) {
      throw new ForbiddenException("You do not own this guide profile");
    }

    return this.prisma.tourPackage.create({
      data: {
        guideId: dto.guideId,
        name: dto.name,
        description: dto.description,
        duration: dto.duration,
        price: dto.price,
        maxGuests: dto.maxGuests ?? 10,
        includes: dto.includes ?? [],
        excludes: dto.excludes ?? [],
        itinerary: dto.itinerary,
      },
    });
  }

  async updatePackage(
    packageId: string,
    dto: UpdateTourPackageDto,
    partnerId: string,
  ) {
    const tourPackage = await this.prisma.tourPackage.findUnique({
      where: { id: packageId },
      include: {
        guide: {
          include: { listing: true },
        },
      },
    });

    if (!tourPackage) {
      throw new NotFoundException("Tour package not found");
    }
    if (tourPackage.guide.listing.partnerId !== partnerId) {
      throw new ForbiddenException("You do not own this tour package");
    }

    return this.prisma.tourPackage.update({
      where: { id: packageId },
      data: dto,
    });
  }

  async removePackage(packageId: string, partnerId: string) {
    const tourPackage = await this.prisma.tourPackage.findUnique({
      where: { id: packageId },
      include: {
        guide: {
          include: { listing: true },
        },
      },
    });

    if (!tourPackage) {
      throw new NotFoundException("Tour package not found");
    }
    if (tourPackage.guide.listing.partnerId !== partnerId) {
      throw new ForbiddenException("You do not own this tour package");
    }

    await this.prisma.tourPackage.delete({ where: { id: packageId } });
    return { message: "Tour package deleted" };
  }
}
