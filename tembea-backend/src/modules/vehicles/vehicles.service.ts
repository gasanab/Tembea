import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateVehicleDto } from "./dto/create-vehicle.dto";
import { UpdateVehicleDto } from "./dto/update-vehicle.dto";
import { VehicleAvailabilityDto } from "./dto/vehicle-availability.dto";
import { AssignDriverDto } from "./dto/assign-driver.dto";
import { ListingType, Prisma } from "@prisma/client";
import { PUBLIC_LISTING_WHERE } from "../../common/prisma/public-listing.where";

const PUBLIC_VEHICLE_SELECT = {
  id: true,
  listingId: true,
  make: true,
  model: true,
  year: true,
  type: true,
  capacity: true,
  color: true,
  transmission: true,
  fuelType: true,
  features: true,
  pricePerDay: true,
  driverAvailable: true,
  images: true,
  available: true,
  createdAt: true,
  updatedAt: true,
  listing: {
    select: {
      id: true,
      name: true,
      location: true,
      rating: true,
    },
  },
} satisfies Prisma.VehicleSelect;

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateVehicleDto, partnerId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: dto.listingId },
    });

    if (!listing) {
      throw new NotFoundException("Listing not found");
    }
    if (listing.partnerId !== partnerId) {
      throw new ForbiddenException("You do not own this listing");
    }
    if (listing.type !== ListingType.TRANSPORT) {
      throw new BadRequestException(
        "Vehicles can only be added to TRANSPORT listings",
      );
    }

    return this.prisma.vehicle.create({
      data: {
        listingId: dto.listingId,
        make: dto.make,
        model: dto.model,
        year: dto.year,
        type: dto.type,
        capacity: dto.capacity ?? 4,
        plateNumber: dto.plateNumber,
        color: dto.color,
        transmission: dto.transmission,
        fuelType: dto.fuelType,
        features: dto.features ?? [],
        pricePerDay: dto.pricePerDay,
        driverAvailable: dto.driverAvailable ?? false,
        driverName: dto.driverName,
        driverPhone: dto.driverPhone,
        driverLicense: dto.driverLicense,
        images: dto.images ?? [],
      },
    });
  }

  async findByListing(listingId: string) {
    return this.prisma.vehicle.findMany({
      where: {
        listingId,
        listing: { is: PUBLIC_LISTING_WHERE },
      },
      select: PUBLIC_VEHICLE_SELECT,
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: {
        id,
        listing: { is: PUBLIC_LISTING_WHERE },
      },
      select: PUBLIC_VEHICLE_SELECT,
    });

    if (!vehicle) {
      throw new NotFoundException("Vehicle not found");
    }
    return vehicle;
  }

  async findMineByListing(listingId: string, partnerId: string) {
    const listing = await this.prisma.listing.findFirst({
      where: { id: listingId, partnerId },
      select: { id: true },
    });
    if (!listing) throw new NotFoundException("Listing not found");

    return this.prisma.vehicle.findMany({
      where: { listingId },
      include: {
        listing: {
          select: { id: true, name: true, partnerId: true, published: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findMine(id: string, partnerId: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
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
    if (!vehicle) throw new NotFoundException("Vehicle not found");
    return vehicle;
  }

  async update(id: string, dto: UpdateVehicleDto, partnerId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: { listing: true },
    });

    if (!vehicle) {
      throw new NotFoundException("Vehicle not found");
    }
    if (vehicle.listing.partnerId !== partnerId) {
      throw new ForbiddenException("You do not own this vehicle");
    }

    return this.prisma.vehicle.update({
      where: { id },
      data: dto,
    });
  }

  async updateAvailability(
    id: string,
    dto: VehicleAvailabilityDto,
    partnerId: string,
  ) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: { listing: true },
    });

    if (!vehicle) {
      throw new NotFoundException("Vehicle not found");
    }
    if (vehicle.listing.partnerId !== partnerId) {
      throw new ForbiddenException("You do not own this vehicle");
    }

    return this.prisma.vehicle.update({
      where: { id },
      data: { available: dto.available },
    });
  }

  async assignDriver(id: string, dto: AssignDriverDto, partnerId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: { listing: true },
    });

    if (!vehicle) {
      throw new NotFoundException("Vehicle not found");
    }
    if (vehicle.listing.partnerId !== partnerId) {
      throw new ForbiddenException("You do not own this vehicle");
    }

    return this.prisma.vehicle.update({
      where: { id },
      data: {
        driverName: dto.driverName,
        driverPhone: dto.driverPhone,
        driverLicense: dto.driverLicense,
        driverAvailable: true,
      },
    });
  }

  async remove(id: string, partnerId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: { listing: true },
    });

    if (!vehicle) {
      throw new NotFoundException("Vehicle not found");
    }
    if (vehicle.listing.partnerId !== partnerId) {
      throw new ForbiddenException("You do not own this vehicle");
    }

    await this.prisma.vehicle.delete({ where: { id } });
    return { message: "Vehicle deleted" };
  }
}
