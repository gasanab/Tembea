import { Injectable } from "@nestjs/common";
import { PartnerStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getOverview() {
    const [
      totalUsers,
      totalPartners,
      totalListings,
      totalBookings,
      totalRevenue,
      pendingVerifications,
      recentBookings,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.partner.count({ where: { status: "VERIFIED" } }),
      this.prisma.listing.count({
        where: {
          published: true,
          partner: { status: PartnerStatus.VERIFIED },
        },
      }),
      this.prisma.booking.count(),
      this.prisma.payment.aggregate({
        where: { status: "PAID" },
        _sum: { gross: true, commission: true },
      }),
      this.prisma.partner.count({ where: { status: "PENDING" } }),
      this.prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true } },
          listing: { select: { name: true, type: true } },
        },
      }),
    ]);

    return {
      stats: {
        totalUsers,
        totalPartners,
        totalListings,
        totalBookings,
        totalRevenue: totalRevenue._sum.gross ?? 0,
        platformEarnings: totalRevenue._sum.commission ?? 0,
        pendingVerifications,
      },
      recentBookings,
    };
  }

  async getListingStats() {
    const byType = await this.prisma.listing.groupBy({
      by: ["type"],
      _count: { id: true },
      where: {
        published: true,
        partner: { status: PartnerStatus.VERIFIED },
      },
    });
    return byType;
  }

  async getBookingStats() {
    const byStatus = await this.prisma.booking.groupBy({
      by: ["status"],
      _count: { id: true },
    });
    return byStatus;
  }

  async getPartnerAnalytics(partnerId: string) {
    const [totalListings, totalBookings, totalRevenue, recentReviews, bookingsByStatus] =
      await Promise.all([
        this.prisma.listing.count({ where: { partnerId } }),
        this.prisma.booking.count({ where: { listing: { partnerId } } }),
        this.prisma.payment.aggregate({
          where: { status: "PAID", booking: { listing: { partnerId } } },
          _sum: { gross: true, net: true },
        }),
        this.prisma.review.findMany({
          where: { listing: { partnerId } },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            user: { select: { name: true, avatar: true } },
            listing: { select: { name: true } },
          },
        }),
        this.prisma.booking.groupBy({
          by: ["status"],
          where: { listing: { partnerId } },
          _count: { id: true },
        }),
      ]);

    const avgRating = await this.prisma.review.aggregate({
      where: { listing: { partnerId } },
      _avg: { rating: true },
    });

    return {
      stats: {
        totalListings,
        totalBookings,
        totalRevenue: totalRevenue._sum.gross ?? 0,
        totalNet: totalRevenue._sum.net ?? 0,
        avgRating: avgRating._avg.rating ?? 0,
      },
      bookingsByStatus,
      recentReviews,
    };
  }
}
