import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  BookingStatus,
  ListingAvailability,
  ListingType,
  PartnerStatus,
  PaymentStatus,
  Prisma,
} from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { PaginationDto } from "../../common/dto/pagination.dto";
import {
  asRecord,
  billableDays,
  listingCurrency,
  positiveInteger,
  roundMoney,
} from "../../common/utils/commerce.util";
import { CreateBookingDto } from "./dto/create-booking.dto";

const PARTNER_STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: [BookingStatus.APPROVED, BookingStatus.REJECTED],
  APPROVED: [BookingStatus.REJECTED, BookingStatus.CANCELLED],
  CONFIRMED: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: [],
};

type BookingQuote = {
  listingId: string;
  type: ListingType;
  amount: number;
  currency: string;
  guests: number;
  bookingData: Prisma.InputJsonValue;
  startAt: Date;
  endAt: Date;
  units: number;
  holdExpiresAt: Date;
  roomId?: string;
  ticketCategoryId?: string;
  vehicleId?: string;
  tourPackageId?: string;
  inventory:
    | { kind: "ROOM"; id: string; capacity: number }
    | { kind: "LISTING_ROOMS"; capacity: number }
    | { kind: "TICKET_CATEGORY"; id: string; capacity: number }
    | { kind: "LISTING_TICKETS"; capacity: number }
    | { kind: "VEHICLE"; id: string }
    | { kind: "LISTING_VEHICLE" }
    | { kind: "GUIDE_PACKAGE"; id: string; capacity: number }
    | { kind: "GUIDE"; capacity: number }
    | { kind: "NONE" };
};

const SERIALIZABLE_RETRY_LIMIT = 3;
const DEFAULT_HOLD_MINUTES = 15;
const CAPACITY_HOLDING_STATUSES = [
  BookingStatus.APPROVED,
  BookingStatus.CONFIRMED,
  BookingStatus.COMPLETED,
];

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateBookingDto) {
    for (let attempt = 1; attempt <= SERIALIZABLE_RETRY_LIMIT; attempt += 1) {
      try {
        return await this.prisma.$transaction(
          async (tx) => {
            if (dto.clientReference) {
              const existing = await tx.booking.findUnique({
                where: { clientReference: dto.clientReference },
                include: {
                  listing: { select: { name: true, images: true, location: true } },
                },
              });
              if (existing) {
                if (existing.userId !== userId) {
                  throw new ConflictException("Client reference is already in use");
                }
                return existing;
              }
            }

            const quote = await this.buildQuote(dto, tx);
            await this.assertInventoryAvailable(tx, quote, new Date());

            return tx.booking.create({
              data: {
                clientReference: dto.clientReference,
                userId,
                listingId: quote.listingId,
                type: quote.type,
                amount: quote.amount,
                currency: quote.currency,
                guests: quote.guests,
                bookingData: quote.bookingData,
                startAt: quote.startAt,
                endAt: quote.endAt,
                units: quote.units,
                holdExpiresAt: quote.holdExpiresAt,
                roomId: quote.roomId,
                ticketCategoryId: quote.ticketCategoryId,
                vehicleId: quote.vehicleId,
                tourPackageId: quote.tourPackageId,
              },
              include: {
                listing: { select: { name: true, images: true, location: true } },
              },
            });
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );
      } catch (error) {
        if (this.isSerializationFailure(error)) {
          if (attempt < SERIALIZABLE_RETRY_LIMIT) {
            await this.retryDelay(attempt);
            continue;
          }
          throw new ConflictException(
            "Reservation contention was too high; please retry",
          );
        }
        if (
          dto.clientReference &&
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          const existing = await this.prisma.booking.findUnique({
            where: { clientReference: dto.clientReference },
            include: {
              listing: { select: { name: true, images: true, location: true } },
            },
          });
          if (existing?.userId === userId) return existing;
          if (existing) throw new ConflictException("Client reference is already in use");
        }
        throw error;
      }
    }
    throw new ConflictException("Reservation could not be created");
  }

  async findMyBookings(userId: string, pagination: PaginationDto) {
    const { page = 1, limit = 20 } = pagination;
    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where: { userId },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          listing: { select: { name: true, images: true, location: true, type: true } },
          payment: { select: { status: true, gross: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.booking.count({ where: { userId } }),
    ]);
    return { bookings, total, page, limit };
  }

  async findPartnerBookings(partnerId: string, pagination: PaginationDto) {
    const { page = 1, limit = 20 } = pagination;
    const where: Prisma.BookingWhereInput = { listing: { partnerId } };
    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          listing: { select: { name: true, type: true } },
          user: { select: { name: true, email: true, avatar: true } },
          payment: { select: { status: true, gross: true, net: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.booking.count({ where }),
    ]);
    return { bookings, total, page, limit };
  }

  async findAllBookings(pagination: PaginationDto) {
    const { page = 1, limit = 20 } = pagination;
    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: {
          listing: { select: { name: true, type: true } },
          user: { select: { name: true, email: true } },
          payment: { select: { status: true, gross: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.booking.count(),
    ]);
    return { bookings, total, page, limit };
  }

  async findOne(bookingId: string, userId: string, userRole: string, partnerId?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        listing: {
          select: { name: true, images: true, location: true, type: true, partnerId: true },
        },
        payment: { select: { status: true, gross: true, providerRef: true } },
      },
    });

    if (!booking) throw new NotFoundException("Booking not found");

    const canView =
      booking.userId === userId ||
      userRole === "ADMIN" ||
      (Boolean(partnerId) && booking.listing.partnerId === partnerId);
    if (!canView) throw new ForbiddenException("Not authorised to view this booking");

    return booking;
  }

  async cancelByClient(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: { select: { status: true } } },
    });
    if (!booking) throw new NotFoundException("Booking not found");
    if (booking.userId !== userId) {
      throw new ForbiddenException("This booking does not belong to you");
    }
    if (
      booking.status !== BookingStatus.PENDING &&
      booking.status !== BookingStatus.APPROVED
    ) {
      throw new BadRequestException(`Cannot cancel a booking with status ${booking.status}`);
    }
    if (booking.payment?.status === PaymentStatus.PAID) {
      throw new BadRequestException("Paid bookings require a refund workflow");
    }

    const result = await this.prisma.booking.updateMany({
      where: {
        id: bookingId,
        userId,
        status: { in: [BookingStatus.PENDING, BookingStatus.APPROVED] },
      },
      data: { status: BookingStatus.CANCELLED, holdExpiresAt: null },
    });
    if (result.count !== 1) {
      throw new ConflictException("Booking status changed; refresh and try again");
    }
    return this.prisma.booking.findUnique({ where: { id: bookingId } });
  }

  async updateStatus(
    bookingId: string,
    status: BookingStatus,
    requesterId: string,
    requesterRole: string,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        listing: { select: { partnerId: true } },
        payment: { select: { status: true } },
      },
    });
    if (!booking) throw new NotFoundException("Booking not found");

    const isPartnerOwner =
      requesterRole === "PARTNER" && booking.listing.partnerId === requesterId;
    const isAdmin = requesterRole === "ADMIN";
    if (!isPartnerOwner && !isAdmin) {
      throw new ForbiddenException("Not authorised to update this booking");
    }
    if (booking.status === status) return booking;

    const allowed = PARTNER_STATUS_TRANSITIONS[booking.status];
    if (!allowed.includes(status)) {
      throw new BadRequestException(
        `Cannot transition booking from ${booking.status} to ${status}`,
      );
    }
    if (status === BookingStatus.CANCELLED && booking.payment?.status === PaymentStatus.PAID) {
      throw new BadRequestException("Paid bookings require a refund workflow");
    }

    const now = new Date();
    if (
      booking.status === BookingStatus.PENDING &&
      status === BookingStatus.APPROVED &&
      (!booking.holdExpiresAt || booking.holdExpiresAt <= now)
    ) {
      await this.prisma.booking.updateMany({
        where: { id: bookingId, status: BookingStatus.PENDING },
        data: { status: BookingStatus.CANCELLED, holdExpiresAt: null },
      });
      throw new ConflictException("The reservation hold expired; ask the client to book again");
    }

    const result = await this.prisma.booking.updateMany({
      where: {
        id: bookingId,
        status: booking.status,
        ...(booking.status === BookingStatus.PENDING &&
          status === BookingStatus.APPROVED && { holdExpiresAt: { gt: now } }),
      },
      data: { status, holdExpiresAt: null },
    });
    if (result.count !== 1) {
      throw new ConflictException("Booking status changed; refresh and try again");
    }
    return this.prisma.booking.findUnique({ where: { id: bookingId } });
  }

  async getPartnerStats(partnerId: string) {
    const [bookings, revenue] = await Promise.all([
      this.prisma.booking.groupBy({
        by: ["status"],
        where: { listing: { partnerId } },
        _count: { _all: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          status: PaymentStatus.PAID,
          booking: { listing: { partnerId } },
        },
        _sum: { gross: true, net: true },
      }),
    ]);

    const counts = Object.fromEntries(bookings.map((row) => [row.status, row._count._all]));
    return {
      totalBookings: bookings.reduce((total, row) => total + row._count._all, 0),
      grossRevenue: revenue._sum.gross ?? 0,
      totalRevenue: revenue._sum.net ?? 0,
      pendingCount: counts.PENDING ?? 0,
      approvedCount: counts.APPROVED ?? 0,
      confirmedCount: counts.CONFIRMED ?? 0,
      completedCount: counts.COMPLETED ?? 0,
      cancelledCount: (counts.CANCELLED ?? 0) + (counts.REJECTED ?? 0),
    };
  }

  private async buildQuote(
    dto: CreateBookingDto,
    db: Prisma.TransactionClient,
  ): Promise<BookingQuote> {
    const listing = await db.listing.findUnique({
      where: { id: dto.listingId },
      select: {
        id: true,
        type: true,
        price: true,
        published: true,
        availability: true,
        extraData: true,
        partner: { select: { status: true } },
      },
    });
    if (!listing) throw new NotFoundException("Listing not found");
    if (
      listing.partner.status !== PartnerStatus.VERIFIED ||
      !listing.published ||
      listing.availability === ListingAvailability.CLOSED ||
      listing.availability === ListingAvailability.FULLY_BOOKED
    ) {
      throw new BadRequestException("This listing is not available");
    }
    if (listing.type === ListingType.MARKETPLACE) {
      throw new BadRequestException("Marketplace purchases must use the orders endpoint");
    }

    const bookingData = asRecord(dto.bookingData);
    const listingData = asRecord(listing.extraData);
    const { startAt, endAt } = this.reservationWindow(
      listing.type,
      bookingData,
      listingData,
    );
    let guests = positiveInteger(
      dto.guests ?? bookingData.participants ?? bookingData.guests,
      "guests",
      1,
    );
    let unitPrice = listing.price;
    let billableUnits = 1;
    let priceSource = "listing";
    let roomId: string | undefined;
    let ticketCategoryId: string | undefined;
    let vehicleId: string | undefined;
    let tourPackageId: string | undefined;
    let units = guests;
    let inventory: BookingQuote["inventory"] = { kind: "NONE" };

    if (listing.type === ListingType.ACCOMMODATION) {
      roomId = this.inventoryId(dto.roomId, bookingData.roomId);
      const rooms = positiveInteger(bookingData.quantity ?? bookingData.rooms, "rooms", 1);
      units = rooms;
      if (roomId) {
        const room = await db.room.findUnique({ where: { id: roomId } });
        if (!room || room.listingId !== listing.id) {
          throw new BadRequestException("Selected room does not belong to this listing");
        }
        if (!room.available) {
          throw new BadRequestException("Selected room is not available");
        }
        if (guests > room.capacity * rooms) {
          throw new BadRequestException("Guest count exceeds selected room capacity");
        }
        unitPrice = room.price;
        priceSource = "room";
        inventory = { kind: "ROOM", id: room.id, capacity: room.totalRooms };
      } else {
        const configuredRoomTypes = await db.room.count({ where: { listingId: listing.id } });
        if (configuredRoomTypes > 0) {
          throw new BadRequestException("Select a room type before booking");
        }
        const capacity = this.configuredCapacity(
          listingData.roomsAvailable,
          "Accommodation inventory",
        );
        inventory = { kind: "LISTING_ROOMS", capacity };
      }
      billableUnits =
        billableDays(bookingData.checkIn, bookingData.checkOut, "checkIn", "checkOut") *
        rooms;
    } else if (listing.type === ListingType.EVENTS) {
      ticketCategoryId = this.inventoryId(dto.ticketCategoryId, bookingData.ticketCategoryId);
      const quantity = positiveInteger(bookingData.quantity ?? dto.guests, "quantity", 1);
      guests = quantity;
      units = quantity;
      if (ticketCategoryId) {
        const ticket = await db.eventTicketCategory.findUnique({
          where: { id: ticketCategoryId },
        });
        if (!ticket || ticket.listingId !== listing.id) {
          throw new BadRequestException("Selected ticket does not belong to this listing");
        }
        unitPrice = ticket.price;
        priceSource = "ticket_category";
        inventory = {
          kind: "TICKET_CATEGORY",
          id: ticket.id,
          capacity: Math.max(0, ticket.totalSeats - ticket.soldSeats),
        };
      } else {
        const configuredCategories = await db.eventTicketCategory.count({
          where: { listingId: listing.id },
        });
        if (configuredCategories > 0) {
          throw new BadRequestException("Select a ticket category before booking");
        }
        inventory = {
          kind: "LISTING_TICKETS",
          capacity: this.configuredCapacity(
            listingData.ticketsAvailable,
            "Event ticket inventory",
          ),
        };
      }
      billableUnits = quantity;
    } else if (listing.type === ListingType.TRANSPORT) {
      vehicleId = this.inventoryId(dto.vehicleId, bookingData.vehicleId);
      units = 1;
      if (vehicleId) {
        const vehicle = await db.vehicle.findUnique({ where: { id: vehicleId } });
        if (!vehicle || vehicle.listingId !== listing.id) {
          throw new BadRequestException("Selected vehicle does not belong to this listing");
        }
        if (!vehicle.available) throw new BadRequestException("Selected vehicle is unavailable");
        if (guests > vehicle.capacity) {
          throw new BadRequestException("Guest count exceeds vehicle capacity");
        }
        unitPrice = vehicle.pricePerDay;
        priceSource = "vehicle";
        inventory = { kind: "VEHICLE", id: vehicle.id };
      } else {
        const configuredVehicles = await db.vehicle.count({ where: { listingId: listing.id } });
        if (configuredVehicles > 0) {
          throw new BadRequestException("Select a vehicle before booking");
        }
        inventory = { kind: "LISTING_VEHICLE" };
      }
      billableUnits = billableDays(
        bookingData.pickupDate ?? bookingData.checkIn ?? bookingData.date,
        bookingData.returnDate ?? bookingData.checkOut,
        "pickupDate",
        "returnDate",
      );
    } else if (listing.type === ListingType.GUIDES) {
      tourPackageId = this.inventoryId(dto.tourPackageId, bookingData.tourPackageId);
      units = guests;
      if (tourPackageId) {
        const tourPackage = await db.tourPackage.findUnique({
          where: { id: tourPackageId },
          include: { guide: { select: { listingId: true } } },
        });
        if (!tourPackage || tourPackage.guide.listingId !== listing.id) {
          throw new BadRequestException("Selected package does not belong to this guide");
        }
        if (!tourPackage.available || guests > tourPackage.maxGuests) {
          throw new BadRequestException("Selected guide package is unavailable");
        }
        unitPrice = tourPackage.price;
        priceSource = "tour_package";
        inventory = {
          kind: "GUIDE_PACKAGE",
          id: tourPackage.id,
          capacity: tourPackage.maxGuests,
        };
      } else {
        const capacity = this.optionalCapacity(listingData.maxGuests) ?? guests;
        if (guests > capacity) {
          throw new BadRequestException("Guest count exceeds this guide's capacity");
        }
        inventory = { kind: "GUIDE", capacity };
      }
      billableUnits = guests;
    } else if (
      ([
        ListingType.PARKS,
        ListingType.TOURS,
        ListingType.MUSEUMS,
        ListingType.MEMORIAL_SITES,
      ] as ListingType[]).includes(listing.type)
    ) {
      const detail = await db.experienceDetail.findUnique({
        where: { listingId: listing.id },
      });
      if (detail?.entryFee !== null && detail?.entryFee !== undefined) {
        unitPrice = detail.entryFee;
        priceSource = "experience_entry_fee";
      }
      if (detail?.maxGroupSize && guests > detail.maxGroupSize) {
        throw new BadRequestException("Guest count exceeds the maximum group size");
      }
      billableUnits = guests;
    } else if (listing.type === ListingType.RESTAURANTS) {
      billableUnits = guests;
    }

    const currency = listingCurrency(listing.extraData);
    const amount = roundMoney(unitPrice * billableUnits);
    const serverPricing = {
      unitPrice: roundMoney(unitPrice),
      billableUnits,
      amount,
      currency,
      source: priceSource,
    };

    return {
      listingId: listing.id,
      type: listing.type,
      amount,
      currency,
      guests,
      startAt,
      endAt,
      units,
      holdExpiresAt: this.holdExpiry(),
      bookingData: {
        ...bookingData,
        pricing: serverPricing,
        reservation: {
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
          units,
        },
      } as Prisma.InputJsonValue,
      ...(roomId && { roomId }),
      ...(ticketCategoryId && { ticketCategoryId }),
      ...(vehicleId && { vehicleId }),
      ...(tourPackageId && { tourPackageId }),
      inventory,
    };
  }

  private async assertInventoryAvailable(
    db: Prisma.TransactionClient,
    quote: BookingQuote,
    now: Date,
  ): Promise<void> {
    const activeWhere = this.capacityHoldingWhere(now);
    const overlapWhere = this.overlapWhere(quote.startAt, quote.endAt);

    if (quote.inventory.kind === "TICKET_CATEGORY") {
      const reserved = await db.booking.aggregate({
        where: {
          ticketCategoryId: quote.inventory.id,
          ...activeWhere,
        },
        _sum: { units: true },
      });
      this.assertUnitCapacity(
        reserved._sum.units ?? 0,
        quote.units,
        quote.inventory.capacity,
        "Not enough tickets are available",
      );
      return;
    }

    if (quote.inventory.kind === "LISTING_TICKETS") {
      const reserved = await db.booking.aggregate({
        where: {
          listingId: quote.listingId,
          type: ListingType.EVENTS,
          ticketCategoryId: null,
          ...activeWhere,
        },
        _sum: { units: true },
      });
      this.assertUnitCapacity(
        reserved._sum.units ?? 0,
        quote.units,
        quote.inventory.capacity,
        "Not enough tickets are available",
      );
      return;
    }

    if (quote.inventory.kind === "ROOM" || quote.inventory.kind === "LISTING_ROOMS") {
      const rows = await db.booking.findMany({
        where: {
          ...(quote.inventory.kind === "ROOM"
            ? { roomId: quote.inventory.id }
            : {
                listingId: quote.listingId,
                type: ListingType.ACCOMMODATION,
                roomId: null,
              }),
          AND: [activeWhere, overlapWhere],
        },
        select: {
          startAt: true,
          endAt: true,
          units: true,
          bookingData: true,
        },
      });
      this.assertWindowCapacity(
        rows,
        quote.startAt,
        quote.endAt,
        quote.units,
        quote.inventory.capacity,
        "Not enough rooms are available for these dates",
      );
      return;
    }

    if (quote.inventory.kind === "VEHICLE" || quote.inventory.kind === "LISTING_VEHICLE") {
      const conflict = await db.booking.findFirst({
        where: {
          ...(quote.inventory.kind === "VEHICLE"
            ? { vehicleId: quote.inventory.id }
            : {
                listingId: quote.listingId,
                type: ListingType.TRANSPORT,
                vehicleId: null,
              }),
          AND: [activeWhere, overlapWhere],
        },
        select: { id: true },
      });
      if (conflict) {
        throw new ConflictException("The selected vehicle is already reserved for these dates");
      }
      return;
    }

    if (
      quote.inventory.kind === "GUIDE_PACKAGE" ||
      quote.inventory.kind === "GUIDE"
    ) {
      const rows = await db.booking.findMany({
        where: {
          listingId: quote.listingId,
          type: ListingType.GUIDES,
          AND: [activeWhere, overlapWhere],
        },
        select: {
          startAt: true,
          endAt: true,
          units: true,
          tourPackageId: true,
        },
      });

      const requestedPackageId =
        quote.inventory.kind === "GUIDE_PACKAGE" ? quote.inventory.id : null;
      const sameSession = rows.filter(
        (row) =>
          row.startAt?.getTime() === quote.startAt.getTime() &&
          row.endAt?.getTime() === quote.endAt.getTime() &&
          row.tourPackageId === requestedPackageId,
      );
      if (sameSession.length !== rows.length) {
        throw new ConflictException("This guide is already reserved for an overlapping time");
      }
      this.assertUnitCapacity(
        sameSession.reduce((total, row) => total + row.units, 0),
        quote.units,
        quote.inventory.capacity,
        "The selected guide session has reached its guest capacity",
      );
    }
  }

  private capacityHoldingWhere(now: Date): Prisma.BookingWhereInput {
    return {
      OR: [
        { status: { in: CAPACITY_HOLDING_STATUSES } },
        {
          status: BookingStatus.PENDING,
          holdExpiresAt: { gt: now },
        },
      ],
    };
  }

  private overlapWhere(startAt: Date, endAt: Date): Prisma.BookingWhereInput {
    return {
      OR: [
        {
          startAt: { lt: endAt },
          endAt: { gt: startAt },
        },
        // A pre-migration active booking without a normalized window is treated
        // conservatively so an upgrade cannot silently oversell inventory.
        { startAt: null },
        { endAt: null },
      ],
    };
  }

  private assertWindowCapacity(
    rows: Array<{
      startAt: Date | null;
      endAt: Date | null;
      units: number;
      bookingData: Prisma.JsonValue;
    }>,
    requestedStart: Date,
    requestedEnd: Date,
    requestedUnits: number,
    capacity: number,
    message: string,
  ): void {
    const events: Array<{ at: number; delta: number }> = [];
    for (const row of rows) {
      const window =
        row.startAt && row.endAt
          ? { startAt: row.startAt, endAt: row.endAt }
          : this.legacyReservationWindow(row.bookingData, requestedStart, requestedEnd);
      if (
        window.startAt >= requestedEnd ||
        window.endAt <= requestedStart
      ) {
        continue;
      }
      events.push({
        at: Math.max(window.startAt.getTime(), requestedStart.getTime()),
        delta: Math.max(1, row.units),
      });
      events.push({
        at: Math.min(window.endAt.getTime(), requestedEnd.getTime()),
        delta: -Math.max(1, row.units),
      });
    }

    events.sort((left, right) => left.at - right.at || left.delta - right.delta);
    let reservedUnits = 0;
    let index = 0;
    while (index < events.length) {
      const timestamp = events[index].at;
      let ending = 0;
      let starting = 0;
      while (index < events.length && events[index].at === timestamp) {
        if (events[index].delta < 0) ending += events[index].delta;
        else starting += events[index].delta;
        index += 1;
      }
      reservedUnits += ending;
      reservedUnits += starting;
      if (reservedUnits + requestedUnits > capacity) {
        throw new ConflictException(message);
      }
    }

    if (requestedUnits > capacity) {
      throw new ConflictException(message);
    }
  }

  private legacyReservationWindow(
    bookingData: Prisma.JsonValue,
    fallbackStart: Date,
    fallbackEnd: Date,
  ): { startAt: Date; endAt: Date } {
    const data = asRecord(bookingData);
    const reservation = asRecord(data.reservation);
    const start = this.tryDate(
      reservation.startAt ??
        data.checkIn ??
        data.pickupDate ??
        data.startDate ??
        data.date,
    );
    const end = this.tryDate(
      reservation.endAt ??
        data.checkOut ??
        data.returnDate ??
        data.endDate,
    );
    if (start && end && end > start) return { startAt: start, endAt: end };
    return { startAt: fallbackStart, endAt: fallbackEnd };
  }

  private assertUnitCapacity(
    reservedUnits: number,
    requestedUnits: number,
    capacity: number,
    message: string,
  ): void {
    if (requestedUnits > capacity || reservedUnits + requestedUnits > capacity) {
      throw new ConflictException(message);
    }
  }

  private reservationWindow(
    type: ListingType,
    bookingData: Record<string, unknown>,
    listingData: Record<string, unknown>,
  ): { startAt: Date; endAt: Date } {
    let startValue: unknown;
    let endValue: unknown;
    let startTime: unknown;
    let endTime: unknown;
    let defaultDurationMs = 86_400_000;

    if (type === ListingType.ACCOMMODATION) {
      startValue = bookingData.checkIn;
      endValue = bookingData.checkOut;
    } else if (type === ListingType.TRANSPORT) {
      startValue = bookingData.pickupDate ?? bookingData.checkIn ?? bookingData.date;
      endValue = bookingData.returnDate ?? bookingData.checkOut ?? bookingData.endDate;
    } else if (type === ListingType.EVENTS) {
      startValue = bookingData.date ?? listingData.date;
      endValue = bookingData.endDate ?? listingData.endDate;
      startTime = bookingData.time ?? listingData.time;
      endTime = bookingData.endTime ?? listingData.endTime;
    } else if (type === ListingType.RESTAURANTS) {
      startValue = bookingData.date;
      endValue = bookingData.endDate;
      startTime = bookingData.time;
      endTime = bookingData.endTime;
      defaultDurationMs = 2 * 60 * 60 * 1000;
    } else {
      startValue =
        bookingData.date ?? bookingData.startDate ?? bookingData.checkIn;
      endValue = bookingData.endDate ?? bookingData.checkOut;
    }

    const startAt = this.requiredDate(startValue, startTime, "reservation start");
    const endAt =
      endValue === undefined || endValue === null || endValue === ""
        ? new Date(startAt.getTime() + defaultDurationMs)
        : this.requiredDate(endValue, endTime, "reservation end");

    if (endAt <= startAt) {
      throw new BadRequestException("Reservation end must be after its start");
    }
    return { startAt, endAt };
  }

  private requiredDate(value: unknown, time: unknown, field: string): Date {
    if (typeof value !== "string" || !value.trim()) {
      throw new BadRequestException(`${field} is required`);
    }
    let candidate = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(candidate)) {
      if (time !== undefined && time !== null && time !== "") {
        if (typeof time !== "string" || !/^\d{2}:\d{2}(?::\d{2})?$/.test(time)) {
          throw new BadRequestException(`${field} time is invalid`);
        }
        candidate = `${candidate}T${time.length === 5 ? `${time}:00` : time}+02:00`;
      } else {
        candidate = `${candidate}T00:00:00+02:00`;
      }
    }
    const parsed = new Date(candidate);
    if (!Number.isFinite(parsed.getTime())) {
      throw new BadRequestException(`${field} is invalid`);
    }
    return parsed;
  }

  private tryDate(value: unknown): Date | null {
    if (typeof value !== "string" || !value.trim()) return null;
    const parsed = new Date(value);
    return Number.isFinite(parsed.getTime()) ? parsed : null;
  }

  private configuredCapacity(value: unknown, label: string): number {
    const capacity = this.optionalCapacity(value);
    if (capacity === undefined) {
      throw new BadRequestException(`${label} is not configured`);
    }
    return capacity;
  }

  private optionalCapacity(value: unknown): number | undefined {
    if (value === undefined || value === null || value === "") return undefined;
    const capacity = Number(value);
    if (!Number.isInteger(capacity) || capacity < 1) {
      throw new BadRequestException("Configured inventory capacity must be a positive integer");
    }
    return capacity;
  }

  private holdExpiry(): Date {
    const configured = Number(process.env.BOOKING_HOLD_MINUTES);
    const minutes =
      Number.isInteger(configured) && configured >= 5 && configured <= 120
        ? configured
        : DEFAULT_HOLD_MINUTES;
    return new Date(Date.now() + minutes * 60_000);
  }

  private isSerializationFailure(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2034"
    );
  }

  private retryDelay(attempt: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, attempt * 10));
  }

  private inventoryId(explicit: string | undefined, embedded: unknown): string | undefined {
    if (explicit) return explicit;
    return typeof embedded === "string" && embedded.trim() ? embedded.trim() : undefined;
  }
}
