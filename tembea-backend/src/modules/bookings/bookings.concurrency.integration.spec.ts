/// <reference types="jest" />

import { ConflictException } from "@nestjs/common";
import {
  ListingAvailability,
  ListingType,
  PartnerCategory,
  PartnerStatus,
  Role,
} from "@prisma/client";
import { randomUUID } from "crypto";
import { PrismaService } from "../../prisma/prisma.service";
import { BookingsService } from "./bookings.service";

describe("BookingsService PostgreSQL concurrency", () => {
  const prisma = new PrismaService();
  const service = new BookingsService(prisma);
  const runId = randomUUID();
  const partnerUserId = `test-partner-${runId}`;
  const partnerId = `test-partner-profile-${runId}`;
  const listingId = `test-listing-${runId}`;
  const roomId = `test-room-${runId}`;
  const clientIds = [`test-client-a-${runId}`, `test-client-b-${runId}`];

  beforeAll(async () => {
    await prisma.$connect();
    await prisma.user.create({
      data: {
        id: partnerUserId,
        name: "Concurrency Test Partner",
        email: `partner-${runId}@example.test`,
        passwordHash: "not-used",
        role: Role.PARTNER,
        interests: [],
        partner: {
          create: {
            id: partnerId,
            businessName: "Concurrency Test Hotel",
            category: PartnerCategory.ACCOMMODATION,
            status: PartnerStatus.VERIFIED,
            documents: [],
            listings: {
              create: {
                id: listingId,
                type: ListingType.ACCOMMODATION,
                name: "Concurrency Test Listing",
                location: "Kigali",
                region: "Kigali",
                description: "A temporary listing used by the reservation concurrency test.",
                images: [],
                price: 100,
                priceLabel: "per night",
                availability: ListingAvailability.AVAILABLE,
                published: true,
                extraData: { currency: "USD" },
                rooms: {
                  create: {
                    id: roomId,
                    name: "Only room",
                    capacity: 2,
                    price: 100,
                    images: [],
                    amenities: [],
                    totalRooms: 1,
                  },
                },
              },
            },
          },
        },
      },
    });
    await prisma.user.createMany({
      data: clientIds.map((id, index) => ({
        id,
        name: `Concurrency Test Client ${index + 1}`,
        email: `client-${index + 1}-${runId}@example.test`,
        passwordHash: "not-used",
        role: Role.CLIENT,
        interests: [],
      })),
    });
  });

  afterAll(async () => {
    await prisma.booking.deleteMany({ where: { listingId } });
    await prisma.listing.deleteMany({ where: { id: listingId } });
    await prisma.user.deleteMany({
      where: { id: { in: [partnerUserId, ...clientIds] } },
    });
    await prisma.$disconnect();
  });

  it("commits one of two simultaneous holds for the final room", async () => {
    const create = (userId: string, clientReference: string) =>
      service.create(userId, {
        listingId,
        roomId,
        clientReference,
        guests: 2,
        bookingData: {
          checkIn: "2030-08-01",
          checkOut: "2030-08-03",
          quantity: 1,
        },
      });

    const results = await Promise.allSettled([
      create(clientIds[0], `test-hold-a-${runId}`),
      create(clientIds[1], `test-hold-b-${runId}`),
    ]);

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    const rejected = results.find(
      (result): result is PromiseRejectedResult => result.status === "rejected",
    );
    expect(rejected?.reason).toBeInstanceOf(ConflictException);
    await expect(
      prisma.booking.count({
        where: {
          listingId,
          roomId,
        },
      }),
    ).resolves.toBe(1);
  });
});
