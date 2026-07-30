/// <reference types="jest" />

import { PartnerStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { EventTicketsService } from "../../modules/event-tickets/event-tickets.service";
import { ExperiencesService } from "../../modules/experiences/experiences.service";
import { GuidesService } from "../../modules/guides/guides.service";
import { ProductsService } from "../../modules/products/products.service";
import { ReviewsService } from "../../modules/reviews/reviews.service";
import { RoomsService } from "../../modules/rooms/rooms.service";
import { VehiclesService } from "../../modules/vehicles/vehicles.service";
import { WishlistService } from "../../modules/wishlist/wishlist.service";
import { PUBLIC_LISTING_WHERE } from "./public-listing.where";

const publicRelation = {
  is: {
    published: true,
    partner: {
      is: {
        status: PartnerStatus.VERIFIED,
      },
    },
  },
};

describe("public child-resource visibility", () => {
  it("keeps the shared visibility predicate strict", () => {
    expect(PUBLIC_LISTING_WHERE).toEqual({
      published: true,
      partner: { is: { status: PartnerStatus.VERIFIED } },
    });
  });

  it("filters public room collections through their listing", async () => {
    const prisma = {
      room: { findMany: jest.fn().mockResolvedValue([]) },
    };
    const service = new RoomsService(prisma as unknown as PrismaService);

    await service.findByListing("listing-1");

    expect(prisma.room.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          listingId: "listing-1",
          listing: publicRelation,
        },
      }),
    );
  });

  it("filters public ticket availability through its listing", async () => {
    const prisma = {
      eventTicketCategory: {
        findFirst: jest.fn().mockResolvedValue({
          totalSeats: 10,
          soldSeats: 4,
        }),
      },
    };
    const service = new EventTicketsService(
      prisma as unknown as PrismaService,
    );

    await expect(service.getAvailability("ticket-1")).resolves.toEqual({
      totalSeats: 10,
      soldSeats: 4,
      remaining: 6,
      percentSold: 40,
    });
    expect(prisma.eventTicketCategory.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "ticket-1", listing: publicRelation },
      }),
    );
  });

  it("filters public product search through its listing", async () => {
    const prisma = {
      product: { findMany: jest.fn().mockResolvedValue([]) },
    };
    const service = new ProductsService(prisma as unknown as PrismaService);

    await service.search("basket");

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          listing: publicRelation,
          name: {
            contains: "basket",
            mode: "insensitive",
          },
        }),
      }),
    );
  });

  it("does not select private driver data in public vehicle reads", async () => {
    const prisma = {
      vehicle: {
        findFirst: jest.fn().mockResolvedValue({ id: "vehicle-1" }),
      },
    };
    const service = new VehiclesService(prisma as unknown as PrismaService);

    await service.findOne("vehicle-1");

    const query = prisma.vehicle.findFirst.mock.calls[0][0];
    expect(query.where).toEqual({
      id: "vehicle-1",
      listing: publicRelation,
    });
    expect(query.select).not.toHaveProperty("driverName");
    expect(query.select).not.toHaveProperty("driverPhone");
    expect(query.select).not.toHaveProperty("driverLicense");
    expect(query.select).not.toHaveProperty("plateNumber");
  });

  it("filters guide profiles and unavailable packages from public reads", async () => {
    const prisma = {
      guideProfile: { findFirst: jest.fn().mockResolvedValue(null) },
    };
    const service = new GuidesService(prisma as unknown as PrismaService);

    await service.findByListing("listing-1");

    expect(prisma.guideProfile.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          listingId: "listing-1",
          listing: publicRelation,
        },
        include: expect.objectContaining({
          packages: expect.objectContaining({
            where: { available: true },
          }),
        }),
      }),
    );
  });

  it("filters public experience detail reads through their listing", async () => {
    const prisma = {
      experienceDetail: {
        findFirst: jest.fn().mockResolvedValue({ id: "experience-1" }),
      },
    };
    const service = new ExperiencesService(
      prisma as unknown as PrismaService,
    );

    await service.findOne("experience-1");

    expect(prisma.experienceDetail.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "experience-1",
          listing: publicRelation,
        },
      }),
    );
  });

  it("filters both public review records and counts through their listing", async () => {
    const prisma = {
      review: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
    };
    const service = new ReviewsService(prisma as unknown as PrismaService);

    await service.findByListing("listing-1", { page: 1, limit: 20 });

    const expectedWhere = {
      listingId: "listing-1",
      listing: publicRelation,
    };
    expect(prisma.review.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expectedWhere }),
    );
    expect(prisma.review.count).toHaveBeenCalledWith({
      where: expectedWhere,
    });
    const select = prisma.review.findMany.mock.calls[0][0].select;
    expect(select).not.toHaveProperty("userId");
    expect(select).not.toHaveProperty("listingId");
  });

  it("omits hidden listings from authenticated wishlist reads", async () => {
    const prisma = {
      wishlist: { findMany: jest.fn().mockResolvedValue([]) },
    };
    const service = new WishlistService(prisma as unknown as PrismaService);

    await service.getWishlist("user-1");

    expect(prisma.wishlist.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: "user-1",
          listing: publicRelation,
        },
      }),
    );
  });
});

describe("partner child-resource reads", () => {
  it("scopes owner reads by partner without requiring publication", async () => {
    const prisma = {
      room: {
        findFirst: jest.fn().mockResolvedValue({ id: "room-1" }),
      },
    };
    const service = new RoomsService(prisma as unknown as PrismaService);

    await service.findMine("room-1", "partner-1");

    expect(prisma.room.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "room-1",
          listing: { is: { partnerId: "partner-1" } },
        },
      }),
    );
  });
});
