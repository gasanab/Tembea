import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

export type ReportType =
  | "financial"
  | "partners"
  | "bookings"
  | "users"
  | "marketplace";

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  private reportPeriod(year?: number) {
    if (!year) {
      return {
        startDate: new Date("2020-01-01T00:00:00.000Z"),
        endDate: new Date(),
      };
    }
    return {
      startDate: new Date(Date.UTC(year, 0, 1)),
      endDate: new Date(Date.UTC(year + 1, 0, 1)),
    };
  }

  async generateFinancialReport(year?: number) {
    const { startDate, endDate } = this.reportPeriod(year);

    const payments = await this.prisma.payment.findMany({
      where: {
        status: "PAID",
        paidAt: { gte: startDate, lt: endDate },
      },
      include: {
        booking: {
          include: {
            listing: {
              select: {
                type: true,
                name: true,
                partner: { select: { businessName: true } },
              },
            },
          },
        },
        order: {
          include: {
            product: {
              select: {
                name: true,
                listing: {
                  select: {
                    name: true,
                    partner: { select: { businessName: true } },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { paidAt: "desc" },
    });

    const totalGross = payments.reduce((s, p) => s + p.gross, 0);
    const totalCommission = payments.reduce((s, p) => s + p.commission, 0);
    const totalNet = payments.reduce((s, p) => s + p.net, 0);

    return {
      type: "financial",
      period: { from: startDate, to: endDate },
      summary: { totalGross, totalCommission, totalNet, transactions: payments.length },
      data: payments,
    };
  }

  async generatePartnersReport() {
    const partners = await this.prisma.partner.findMany({
      include: {
        user: { select: { name: true, email: true, createdAt: true } },
        _count: { select: { listings: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return { type: "partners", count: partners.length, data: partners };
  }

  async generateBookingsReport(year?: number) {
    const { startDate, endDate } = this.reportPeriod(year);

    const bookings = await this.prisma.booking.findMany({
      where: { createdAt: { gte: startDate, lt: endDate } },
      include: {
        user: { select: { name: true, email: true } },
        listing: { select: { name: true, type: true } },
        payment: { select: { status: true, gross: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const byStatus = bookings.reduce(
      (acc, b) => {
        acc[b.status] = (acc[b.status] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      type: "bookings",
      period: { from: startDate, to: endDate },
      summary: { total: bookings.length, byStatus },
      data: bookings,
    };
  }

  async generateUsersReport() {
    const [total, clients, partners, admins] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: "CLIENT" } }),
      this.prisma.user.count({ where: { role: "PARTNER" } }),
      this.prisma.user.count({ where: { role: "ADMIN" } }),
    ]);
    const recent = await this.prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        verified: true,
        createdAt: true,
      },
    });
    return {
      type: "users",
      summary: { total, clients, partners, admins },
      data: recent,
    };
  }

  async generateMarketplaceReport(year?: number) {
    const { startDate, endDate } = this.reportPeriod(year);
    const orders = await this.prisma.order.findMany({
      where: { createdAt: { gte: startDate, lt: endDate } },
      include: {
        user: { select: { name: true, email: true } },
        product: {
          select: {
            name: true,
            sku: true,
            listing: {
              select: {
                name: true,
                partner: { select: { businessName: true } },
              },
            },
          },
        },
        payment: {
          select: {
            status: true,
            gross: true,
            commission: true,
            net: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    const byStatus = orders.reduce<Record<string, number>>((summary, order) => {
      summary[order.status] = (summary[order.status] ?? 0) + 1;
      return summary;
    }, {});
    const paidGross = orders.reduce(
      (sum, order) =>
        sum + (order.payment?.status === "PAID" ? order.payment.gross : 0),
      0,
    );

    return {
      type: "marketplace",
      period: { from: startDate, to: endDate },
      summary: {
        total: orders.length,
        paidGross,
        byStatus,
      },
      data: orders,
    };
  }

  async getReport(type: ReportType, year?: number) {
    switch (type) {
      case "financial":
        return this.generateFinancialReport(year);
      case "partners":
        return this.generatePartnersReport();
      case "bookings":
        return this.generateBookingsReport(year);
      case "users":
        return this.generateUsersReport();
      case "marketplace":
        return this.generateMarketplaceReport(year);
    }
  }
}
