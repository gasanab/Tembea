import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { UpdateRoomAvailabilityDto } from './dto/update-room-availability.dto';
import { PUBLIC_LISTING_WHERE } from '../../common/prisma/public-listing.where';

@Injectable()
export class RoomsService {
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
  }

  private async verifyRoomOwnership(
    roomId: string,
    partnerId: string,
  ): Promise<void> {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: { listing: { select: { partnerId: true } } },
    });
    if (!room) throw new NotFoundException('Room not found');
    if (room.listing.partnerId !== partnerId)
      throw new ForbiddenException('You do not own this room');
  }

  async create(dto: CreateRoomDto, partnerId: string) {
    await this.verifyListingOwnership(dto.listingId, partnerId);

    return this.prisma.room.create({
      data: {
        listingId: dto.listingId,
        name: dto.name,
        description: dto.description,
        capacity: dto.capacity,
        price: dto.price,
        images: dto.images ?? [],
        amenities: dto.amenities ?? [],
        totalRooms: dto.totalRooms ?? 1,
      },
    });
  }

  async findByListing(listingId: string) {
    return this.prisma.room.findMany({
      where: {
        listingId,
        listing: { is: PUBLIC_LISTING_WHERE },
      },
      orderBy: { price: 'asc' },
    });
  }

  async findOne(id: string) {
    const room = await this.prisma.room.findFirst({
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
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  async findMineByListing(listingId: string, partnerId: string) {
    await this.verifyListingOwnership(listingId, partnerId);

    return this.prisma.room.findMany({
      where: { listingId },
      orderBy: { price: 'asc' },
    });
  }

  async findMine(id: string, partnerId: string) {
    const room = await this.prisma.room.findFirst({
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
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  async update(id: string, dto: UpdateRoomDto, partnerId: string) {
    await this.verifyRoomOwnership(id, partnerId);

    return this.prisma.room.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.capacity !== undefined && { capacity: dto.capacity }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.images !== undefined && { images: dto.images }),
        ...(dto.amenities !== undefined && { amenities: dto.amenities }),
        ...(dto.totalRooms !== undefined && { totalRooms: dto.totalRooms }),
      },
    });
  }

  async updateAvailability(
    id: string,
    dto: UpdateRoomAvailabilityDto,
    partnerId: string,
  ) {
    await this.verifyRoomOwnership(id, partnerId);

    return this.prisma.room.update({
      where: { id },
      data: { available: dto.available },
    });
  }

  async remove(id: string, partnerId: string) {
    await this.verifyRoomOwnership(id, partnerId);
    await this.prisma.room.delete({ where: { id } });
    return { message: 'Room deleted' };
  }
}
