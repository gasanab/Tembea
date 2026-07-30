/// <reference types="jest" />

import { ListingsService } from "./listings.service";
import { PrismaService } from "../../prisma/prisma.service";

describe("ListingsService write authorization", () => {
  const listing = {
    id: "listing-1",
    partnerId: "partner-1",
    extraData: { existing: true },
  };
  const prisma = {
    listing: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  const service = new ListingsService(prisma as unknown as PrismaService);

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.listing.findUnique.mockResolvedValue(listing);
    prisma.listing.update.mockResolvedValue(listing);
  });

  it("forces moderation-controlled values during creation", async () => {
    prisma.listing.create.mockResolvedValue(listing);

    await service.create(
      "partner-1",
      {
        type: "TOURS",
        name: "Safe listing",
        location: "Kigali",
        region: "Kigali",
        description: "A sufficiently detailed listing description.",
        images: [],
        price: 50,
        featured: true,
        published: true,
        rating: 5,
      } as never,
    );

    expect(prisma.listing.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          partnerId: "partner-1",
          featured: false,
          published: false,
        }),
      }),
    );
    const data = prisma.listing.create.mock.calls[0][0].data;
    expect(data).not.toHaveProperty("rating");
    expect(data.extraData).not.toHaveProperty("featured");
    expect(data.extraData).not.toHaveProperty("published");
    expect(data.extraData).not.toHaveProperty("rating");
  });

  it("does not pass moderation or ownership fields to Prisma during update", async () => {
    await service.update(
      "listing-1",
      "partner-1",
      {
        name: "Updated listing",
        featured: true,
        published: true,
        rating: 5,
        partnerId: "attacker-partner",
        type: "EVENTS",
      } as never,
    );

    const data = prisma.listing.update.mock.calls[0][0].data;
    expect(data).toEqual({ name: "Updated listing" });
    expect(data).not.toHaveProperty("featured");
    expect(data).not.toHaveProperty("published");
    expect(data).not.toHaveProperty("rating");
    expect(data).not.toHaveProperty("partnerId");
    expect(data).not.toHaveProperty("type");
  });
});
