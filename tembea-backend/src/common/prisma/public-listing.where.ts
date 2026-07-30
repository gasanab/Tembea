import { PartnerStatus, Prisma } from "@prisma/client";

/**
 * The visibility boundary shared by every public child-resource query.
 *
 * Keeping this predicate at the database query boundary prevents draft listings
 * and listings owned by pending or suspended partners from leaking through
 * secondary endpoints.
 */
export const PUBLIC_LISTING_WHERE = {
  published: true,
  partner: {
    is: {
      status: PartnerStatus.VERIFIED,
    },
  },
} satisfies Prisma.ListingWhereInput;
