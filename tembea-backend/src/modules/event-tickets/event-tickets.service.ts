import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ListingType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTicketCategoryDto } from './dto/create-ticket-category.dto';
import { UpdateTicketCategoryDto } from './dto/update-ticket-category.dto';
import { PUBLIC_LISTING_WHERE } from '../../common/prisma/public-listing.where';

@Injectable()
export class EventTicketsService {
  constructor(private prisma: PrismaService) {}

  private async verifyListingOwnership(
    listingId: string,
    partnerId: string,
  ): Promise<void> {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
    });
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.partnerId !== partnerId)
      throw new ForbiddenException('You do not own this listing');
    if (listing.type !== ListingType.EVENTS)
      throw new BadRequestException(
        'Ticket categories can only be added to EVENTS listings',
      );
  }

  private async verifyCategoryOwnership(
    categoryId: string,
    partnerId: string,
  ): Promise<void> {
    const category = await this.prisma.eventTicketCategory.findUnique({
      where: { id: categoryId },
      include: { listing: { select: { partnerId: true } } },
    });
    if (!category)
      throw new NotFoundException('Ticket category not found');
    if (category.listing.partnerId !== partnerId)
      throw new ForbiddenException('You do not own this ticket category');
  }

  async create(dto: CreateTicketCategoryDto, partnerId: string) {
    await this.verifyListingOwnership(dto.listingId, partnerId);

    return this.prisma.eventTicketCategory.create({
      data: {
        listingId: dto.listingId,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        totalSeats: dto.totalSeats,
        color: dto.color,
        perks: dto.perks ?? [],
      },
    });
  }

  async findByListing(listingId: string) {
    return this.prisma.eventTicketCategory.findMany({
      where: {
        listingId,
        listing: { is: PUBLIC_LISTING_WHERE },
      },
      orderBy: { price: 'desc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.eventTicketCategory.findFirst({
      where: {
        id,
        listing: { is: PUBLIC_LISTING_WHERE },
      },
      include: {
        listing: {
          select: { id: true, name: true, location: true },
        },
      },
    });
    if (!category) throw new NotFoundException('Ticket category not found');
    return category;
  }

  async findMineByListing(listingId: string, partnerId: string) {
    await this.verifyListingOwnership(listingId, partnerId);

    return this.prisma.eventTicketCategory.findMany({
      where: { listingId },
      orderBy: { price: 'desc' },
    });
  }

  async findMine(id: string, partnerId: string) {
    const category = await this.prisma.eventTicketCategory.findFirst({
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
    if (!category) throw new NotFoundException('Ticket category not found');
    return category;
  }

  async update(id: string, dto: UpdateTicketCategoryDto, partnerId: string) {
    await this.verifyCategoryOwnership(id, partnerId);

    return this.prisma.eventTicketCategory.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.totalSeats !== undefined && { totalSeats: dto.totalSeats }),
        ...(dto.color !== undefined && { color: dto.color }),
        ...(dto.perks !== undefined && { perks: dto.perks }),
      },
    });
  }

  async remove(id: string, partnerId: string) {
    await this.verifyCategoryOwnership(id, partnerId);

    const category = await this.prisma.eventTicketCategory.findUnique({
      where: { id },
      select: { soldSeats: true },
    });

    if (category && category.soldSeats > 0) {
      throw new BadRequestException(
        'Cannot delete a ticket category that has sold tickets',
      );
    }

    await this.prisma.eventTicketCategory.delete({ where: { id } });
    return { message: 'Ticket category deleted' };
  }

  async getAvailability(id: string) {
    const category = await this.prisma.eventTicketCategory.findFirst({
      where: {
        id,
        listing: { is: PUBLIC_LISTING_WHERE },
      },
      select: { totalSeats: true, soldSeats: true },
    });
    if (!category) throw new NotFoundException('Ticket category not found');

    return this.formatAvailability(category);
  }

  async getMineAvailability(id: string, partnerId: string) {
    const category = await this.prisma.eventTicketCategory.findFirst({
      where: {
        id,
        listing: { is: { partnerId } },
      },
      select: { totalSeats: true, soldSeats: true },
    });
    if (!category) throw new NotFoundException('Ticket category not found');

    return this.formatAvailability(category);
  }

  private formatAvailability(category: {
    totalSeats: number;
    soldSeats: number;
  }) {
    const remaining = category.totalSeats - category.soldSeats;
    const percentSold =
      category.totalSeats > 0
        ? Math.round((category.soldSeats / category.totalSeats) * 100)
        : 0;

    return {
      totalSeats: category.totalSeats,
      soldSeats: category.soldSeats,
      remaining,
      percentSold,
    };
  }
}
