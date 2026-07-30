/// <reference types="jest" />

import { ConflictException } from "@nestjs/common";
import {
  BookingStatus,
  ListingAvailability,
  ListingType,
  PartnerStatus,
  Prisma,
} from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { BookingsService } from "./bookings.service";
import { CreateBookingDto } from "./dto/create-booking.dto";

type StoredBooking = {
  id: string;
  status: BookingStatus;
  startAt: Date;
  endAt: Date;
  units: number;
  holdExpiresAt: Date | null;
  bookingData: Prisma.JsonValue;
  tourPackageId?: string | null;
};

const checkIn = "2026-08-01";
const checkOut = "2026-08-03";
const normalizedCheckIn = new Date("2026-08-01T00:00:00+02:00");
const normalizedCheckOut = new Date("2026-08-03T00:00:00+02:00");

function active(booking: StoredBooking): boolean {
  return (
    ([
      BookingStatus.APPROVED,
      BookingStatus.CONFIRMED,
      BookingStatus.COMPLETED,
    ] as BookingStatus[]).includes(booking.status) ||
    (booking.status === BookingStatus.PENDING &&
      Boolean(booking.holdExpiresAt && booking.holdExpiresAt > new Date()))
  );
}

function accommodationHarness(seed: StoredBooking[] = []) {
  const stored = [...seed];
  const tx = {
    listing: {
      findUnique: jest.fn().mockResolvedValue({
        id: "listing-1",
        type: ListingType.ACCOMMODATION,
        price: 90,
        published: true,
        availability: ListingAvailability.AVAILABLE,
        extraData: { currency: "USD" },
        partner: { status: PartnerStatus.VERIFIED },
      }),
    },
    room: {
      findUnique: jest.fn().mockResolvedValue({
        id: "room-1",
        listingId: "listing-1",
        available: true,
        totalRooms: 1,
        capacity: 2,
        price: 100,
      }),
      count: jest.fn(),
    },
    booking: {
      findUnique: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockImplementation(async () =>
        stored.filter(active).map((booking) => ({
          startAt: booking.startAt,
          endAt: booking.endAt,
          units: booking.units,
          bookingData: booking.bookingData,
        })),
      ),
      create: jest.fn().mockImplementation(async ({ data }) => {
        const booking = {
          id: `booking-${stored.length + 1}`,
          status: BookingStatus.PENDING,
          ...data,
        };
        stored.push(booking);
        return booking;
      }),
    },
  };

  let transactionTail = Promise.resolve<unknown>(undefined);
  const prisma = {
    booking: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn().mockImplementation((callback) => {
      const result = transactionTail.then(() => callback(tx));
      transactionTail = result.then(
        () => undefined,
        () => undefined,
      );
      return result;
    }),
  };

  return {
    service: new BookingsService(prisma as unknown as PrismaService),
    prisma,
    tx,
    stored,
    dto: {
      listingId: "listing-1",
      roomId: "room-1",
      guests: 2,
      bookingData: {
        checkIn,
        checkOut,
        quantity: 1,
      },
    } as CreateBookingDto,
  };
}

describe("BookingsService reservation integrity", () => {
  it("allows only one concurrent hold for the final room", async () => {
    const { service, stored, dto } = accommodationHarness();

    const results = await Promise.allSettled([
      service.create("user-1", { ...dto, clientReference: "attempt-1" }),
      service.create("user-2", { ...dto, clientReference: "attempt-2" }),
    ]);

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    const rejected = results.find(
      (result): result is PromiseRejectedResult => result.status === "rejected",
    );
    expect(rejected?.reason).toBeInstanceOf(ConflictException);
    expect(stored).toHaveLength(1);
    expect(stored[0]).toEqual(
      expect.objectContaining({
        startAt: normalizedCheckIn,
        endAt: normalizedCheckOut,
        units: 1,
        status: BookingStatus.PENDING,
      }),
    );
    expect(stored[0].holdExpiresAt).toBeInstanceOf(Date);
  });

  it("does not count an expired pending hold", async () => {
    const expired: StoredBooking = {
      id: "expired",
      status: BookingStatus.PENDING,
      startAt: normalizedCheckIn,
      endAt: normalizedCheckOut,
      units: 1,
      holdExpiresAt: new Date(Date.now() - 1_000),
      bookingData: {},
    };
    const { service, stored, dto } = accommodationHarness([expired]);

    await expect(service.create("user-2", dto)).resolves.toBeDefined();
    expect(stored).toHaveLength(2);
  });

  it("rejects bookings for a partner that is not verified", async () => {
    const harness = accommodationHarness();
    harness.tx.listing.findUnique.mockResolvedValue({
      id: "listing-1",
      type: ListingType.ACCOMMODATION,
      price: 90,
      published: true,
      availability: ListingAvailability.AVAILABLE,
      extraData: { currency: "USD" },
      partner: { status: PartnerStatus.PENDING },
    });

    await expect(
      harness.service.create("user-1", harness.dto),
    ).rejects.toThrow("listing is not available");
    expect(harness.tx.booking.create).not.toHaveBeenCalled();
  });

  it.each([
    BookingStatus.APPROVED,
    BookingStatus.CONFIRMED,
    BookingStatus.COMPLETED,
  ])("counts %s reservations against room capacity", async (status) => {
    const existing: StoredBooking = {
      id: "existing",
      status,
      startAt: normalizedCheckIn,
      endAt: normalizedCheckOut,
      units: 1,
      holdExpiresAt: null,
      bookingData: {},
    };
    const { service, dto } = accommodationHarness([existing]);

    await expect(service.create("user-2", dto)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it.each([BookingStatus.CANCELLED, BookingStatus.REJECTED])(
    "does not count %s reservations against room capacity",
    async (status) => {
      const existing: StoredBooking = {
        id: "existing",
        status,
        startAt: normalizedCheckIn,
        endAt: normalizedCheckOut,
        units: 1,
        holdExpiresAt: null,
        bookingData: {},
      };
      const { service, dto } = accommodationHarness([existing]);

      await expect(service.create("user-2", dto)).resolves.toBeDefined();
    },
  );

  it("retries a serialization conflict within a bounded transaction", async () => {
    const harness = accommodationHarness();
    const serializableFailure = new Prisma.PrismaClientKnownRequestError(
      "write conflict",
      { code: "P2034", clientVersion: "5.22.0" },
    );
    const normalTransaction = harness.prisma.$transaction.getMockImplementation();
    harness.prisma.$transaction
      .mockRejectedValueOnce(serializableFailure)
      .mockImplementation(normalTransaction);

    await expect(harness.service.create("user-1", harness.dto)).resolves.toBeDefined();
    expect(harness.prisma.$transaction).toHaveBeenCalledTimes(2);
  });

  it("enforces event ticket category capacity without mutating a sold counter", async () => {
    const tx = {
      listing: {
        findUnique: jest.fn().mockResolvedValue({
          id: "event-1",
          type: ListingType.EVENTS,
          price: 20,
          published: true,
          availability: ListingAvailability.AVAILABLE,
          extraData: { currency: "USD", date: checkIn },
          partner: { status: PartnerStatus.VERIFIED },
        }),
      },
      eventTicketCategory: {
        findUnique: jest.fn().mockResolvedValue({
          id: "ticket-1",
          listingId: "event-1",
          totalSeats: 2,
          soldSeats: 0,
          price: 25,
        }),
        count: jest.fn(),
      },
      booking: {
        findUnique: jest.fn(),
        aggregate: jest.fn().mockResolvedValue({ _sum: { units: 1 } }),
        create: jest.fn(),
      },
    };
    const prisma = {
      $transaction: jest.fn().mockImplementation((callback) => callback(tx)),
      booking: { findUnique: jest.fn() },
    };
    const service = new BookingsService(prisma as unknown as PrismaService);

    await expect(
      service.create("user-1", {
        listingId: "event-1",
        ticketCategoryId: "ticket-1",
        guests: 2,
        bookingData: { date: checkIn, quantity: 2 },
      }),
    ).rejects.toThrow("Not enough tickets");
  });

  it("rejects an overlapping reservation for the same vehicle", async () => {
    const tx = {
      listing: {
        findUnique: jest.fn().mockResolvedValue({
          id: "transport-1",
          type: ListingType.TRANSPORT,
          price: 40,
          published: true,
          availability: ListingAvailability.AVAILABLE,
          extraData: { currency: "USD" },
          partner: { status: PartnerStatus.VERIFIED },
        }),
      },
      vehicle: {
        findUnique: jest.fn().mockResolvedValue({
          id: "vehicle-1",
          listingId: "transport-1",
          available: true,
          capacity: 4,
          pricePerDay: 60,
        }),
        count: jest.fn(),
      },
      booking: {
        findFirst: jest.fn().mockResolvedValue({ id: "existing" }),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };
    const prisma = {
      $transaction: jest.fn().mockImplementation((callback) => callback(tx)),
      booking: { findUnique: jest.fn() },
    };
    const service = new BookingsService(prisma as unknown as PrismaService);

    await expect(
      service.create("user-1", {
        listingId: "transport-1",
        vehicleId: "vehicle-1",
        guests: 4,
        bookingData: { pickupDate: checkIn, returnDate: checkOut },
      }),
    ).rejects.toThrow("already reserved");
  });

  it("enforces shared capacity for the same guide package session", async () => {
    const tx = {
      listing: {
        findUnique: jest.fn().mockResolvedValue({
          id: "guide-listing",
          type: ListingType.GUIDES,
          price: 50,
          published: true,
          availability: ListingAvailability.AVAILABLE,
          extraData: { currency: "USD" },
          partner: { status: PartnerStatus.VERIFIED },
        }),
      },
      tourPackage: {
        findUnique: jest.fn().mockResolvedValue({
          id: "package-1",
          guide: { listingId: "guide-listing" },
          available: true,
          maxGuests: 4,
          price: 25,
        }),
      },
      booking: {
        findUnique: jest.fn(),
        findMany: jest.fn().mockResolvedValue([
          {
            startAt: new Date("2026-08-01T00:00:00+02:00"),
            endAt: new Date("2026-08-02T00:00:00+02:00"),
            units: 3,
            tourPackageId: "package-1",
          },
        ]),
        create: jest.fn(),
      },
    };
    const prisma = {
      $transaction: jest.fn().mockImplementation((callback) => callback(tx)),
      booking: { findUnique: jest.fn() },
    };
    const service = new BookingsService(prisma as unknown as PrismaService);

    await expect(
      service.create("user-1", {
        listingId: "guide-listing",
        tourPackageId: "package-1",
        guests: 2,
        bookingData: { date: checkIn },
      }),
    ).rejects.toThrow("guest capacity");
  });
});

describe("BookingsService hold transitions", () => {
  it("cancels an expired hold instead of approving it", async () => {
    const booking = {
      id: "booking-1",
      status: BookingStatus.PENDING,
      holdExpiresAt: new Date(Date.now() - 1_000),
      listing: { partnerId: "partner-1" },
      payment: null,
    };
    const prisma = {
      booking: {
        findUnique: jest.fn().mockResolvedValue(booking),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const service = new BookingsService(prisma as unknown as PrismaService);

    await expect(
      service.updateStatus(
        booking.id,
        BookingStatus.APPROVED,
        "partner-1",
        "PARTNER",
      ),
    ).rejects.toThrow("hold expired");
    expect(prisma.booking.updateMany).toHaveBeenCalledWith({
      where: { id: booking.id, status: BookingStatus.PENDING },
      data: { status: BookingStatus.CANCELLED, holdExpiresAt: null },
    });
  });

  it("clears the expiry when an active hold is approved", async () => {
    const booking = {
      id: "booking-1",
      status: BookingStatus.PENDING,
      holdExpiresAt: new Date(Date.now() + 60_000),
      listing: { partnerId: "partner-1" },
      payment: null,
    };
    const prisma = {
      booking: {
        findUnique: jest
          .fn()
          .mockResolvedValueOnce(booking)
          .mockResolvedValueOnce({ ...booking, status: BookingStatus.APPROVED }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const service = new BookingsService(prisma as unknown as PrismaService);

    await service.updateStatus(
      booking.id,
      BookingStatus.APPROVED,
      "partner-1",
      "PARTNER",
    );

    expect(prisma.booking.updateMany).toHaveBeenCalledWith({
      where: {
        id: booking.id,
        status: BookingStatus.PENDING,
        holdExpiresAt: { gt: expect.any(Date) },
      },
      data: { status: BookingStatus.APPROVED, holdExpiresAt: null },
    });
  });
});
