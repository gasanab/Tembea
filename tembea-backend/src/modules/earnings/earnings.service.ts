import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import {
  PartnerStatus,
  PaymentStatus,
  PayoutStatus,
  Prisma,
} from "@prisma/client";
import { normalizeCurrency, roundMoney } from "../../common/utils/commerce.util";
import { PrismaService } from "../../prisma/prisma.service";
import { PayoutRequestDto } from "./dto/payout-request.dto";

type CurrencyTotals = {
  currency: string;
  gross: number;
  commission: number;
  earned: number;
  reserved: number;
  paidOut: number;
  available: number;
  transactionCount: number;
};

@Injectable()
export class EarningsService {
  constructor(private prisma: PrismaService) {}

  async getPartnerEarnings(partnerId?: string) {
    if (!partnerId) throw new ForbiddenException("A partner profile is required");

    const [payments, payouts] = await Promise.all([
      this.prisma.payment.findMany({
        where: this.partnerPaymentWhere(partnerId),
        include: {
          booking: { select: { createdAt: true, type: true } },
          order: {
            select: {
              createdAt: true,
              product: { select: { name: true } },
            },
          },
        },
        orderBy: { paidAt: "desc" },
      }),
      this.prisma.payoutRequest.findMany({
        where: {
          partnerId,
          status: { in: [PayoutStatus.PENDING, PayoutStatus.PROCESSING, PayoutStatus.PAID] },
        },
        select: { amount: true, currency: true, status: true },
      }),
    ]);

    const byCurrency = new Map<string, CurrencyTotals>();
    const ensureCurrency = (rawCurrency: string) => {
      const currency = normalizeCurrency(rawCurrency);
      let totals = byCurrency.get(currency);
      if (!totals) {
        totals = {
          currency,
          gross: 0,
          commission: 0,
          earned: 0,
          reserved: 0,
          paidOut: 0,
          available: 0,
          transactionCount: 0,
        };
        byCurrency.set(currency, totals);
      }
      return totals;
    };

    const monthly = new Map<
      string,
      { month: string; currency: string; gross: number; commission: number; net: number; count: number }
    >();
    for (const payment of payments) {
      const totals = ensureCurrency(payment.currency);
      totals.gross = roundMoney(totals.gross + payment.gross);
      totals.commission = roundMoney(totals.commission + payment.commission);
      totals.earned = roundMoney(totals.earned + payment.net);
      totals.transactionCount += 1;

      const month = (payment.paidAt ?? payment.createdAt).toISOString().slice(0, 7);
      const key = `${totals.currency}:${month}`;
      const row = monthly.get(key) ?? {
        month,
        currency: totals.currency,
        gross: 0,
        commission: 0,
        net: 0,
        count: 0,
      };
      row.gross = roundMoney(row.gross + payment.gross);
      row.commission = roundMoney(row.commission + payment.commission);
      row.net = roundMoney(row.net + payment.net);
      row.count += 1;
      monthly.set(key, row);
    }

    for (const payout of payouts) {
      const totals = ensureCurrency(payout.currency);
      if (payout.status === PayoutStatus.PAID) {
        totals.paidOut = roundMoney(totals.paidOut + payout.amount);
      } else {
        totals.reserved = roundMoney(totals.reserved + payout.amount);
      }
    }
    for (const totals of byCurrency.values()) {
      totals.available = roundMoney(
        Math.max(0, totals.earned - totals.reserved - totals.paidOut),
      );
    }

    return {
      balances: [...byCurrency.values()].sort((a, b) => a.currency.localeCompare(b.currency)),
      breakdown: [...monthly.values()].sort(
        (a, b) => b.month.localeCompare(a.month) || a.currency.localeCompare(b.currency),
      ),
      transactions: payments,
    };
  }

  async requestPayout(
    userId: string,
    partnerId: string | undefined,
    dto: PayoutRequestDto,
  ) {
    if (!partnerId) throw new ForbiddenException("A partner profile is required");
    const currency = normalizeCurrency(dto.currency ?? "USD");
    const amount = roundMoney(dto.amount);

    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const partner = await tx.partner.findFirst({
            where: { id: partnerId, userId, status: PartnerStatus.VERIFIED },
            select: { id: true },
          });
          if (!partner) {
            throw new ForbiddenException("Only the verified partner owner can request payout");
          }

          const [payments, committed] = await Promise.all([
            tx.payment.findMany({
              where: {
                ...this.partnerPaymentWhere(partnerId),
                currency: { equals: currency, mode: "insensitive" },
              },
              select: { net: true },
            }),
            tx.payoutRequest.aggregate({
              where: {
                partnerId,
                currency: { equals: currency, mode: "insensitive" },
                status: {
                  in: [PayoutStatus.PENDING, PayoutStatus.PROCESSING, PayoutStatus.PAID],
                },
              },
              _sum: { amount: true },
            }),
          ]);
          const earned = roundMoney(
            payments.reduce((sum, payment) => sum + payment.net, 0),
          );
          const unavailable = roundMoney(committed._sum.amount ?? 0);
          const available = roundMoney(Math.max(0, earned - unavailable));
          if (amount > available) {
            throw new BadRequestException(
              `Payout exceeds available ${currency} balance of ${available.toFixed(2)}`,
            );
          }

          return tx.payoutRequest.create({
            data: {
              userId,
              partnerId,
              amount,
              currency,
              method: dto.method ?? "bank",
              bankName: dto.bankName,
              accountName: dto.accountName,
              accountNumber: dto.accountNumber,
              mobileNumber: dto.mobileNumber,
              notes: dto.notes,
            },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034"
      ) {
        throw new ConflictException("Balance changed; retry the payout request");
      }
      throw error;
    }
  }

  getPayoutRequests(partnerId?: string) {
    if (!partnerId) throw new ForbiddenException("A partner profile is required");
    return this.prisma.payoutRequest.findMany({
      where: { partnerId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getAllEarnings(year?: number) {
    if (year !== undefined && (!Number.isInteger(year) || year < 2000 || year > 2200)) {
      throw new BadRequestException("Invalid reporting year");
    }
    const startDate = year ? new Date(Date.UTC(year, 0, 1)) : undefined;
    const endDate = year ? new Date(Date.UTC(year + 1, 0, 1)) : undefined;
    const paidAt = startDate ? { gte: startDate, lt: endDate } : undefined;

    const [payments, paidPayouts] = await Promise.all([
      this.prisma.payment.findMany({
        where: { status: PaymentStatus.PAID, ...(paidAt && { paidAt }) },
        include: {
          booking: {
            include: {
              listing: {
                select: {
                  name: true,
                  type: true,
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
                    select: { partner: { select: { businessName: true } } },
                  },
                },
              },
            },
          },
        },
        orderBy: { paidAt: "desc" },
      }),
      this.prisma.payoutRequest.findMany({
        where: {
          status: PayoutStatus.PAID,
          ...(startDate && { processedAt: { gte: startDate, lt: endDate } }),
        },
        select: { amount: true, currency: true },
      }),
    ]);

    const totalsByCurrency: Record<
      string,
      { revenue: number; commission: number; partnerNet: number; paidPayouts: number }
    > = {};
    const row = (rawCurrency: string) => {
      const currency = normalizeCurrency(rawCurrency);
      return (totalsByCurrency[currency] ??= {
        revenue: 0,
        commission: 0,
        partnerNet: 0,
        paidPayouts: 0,
      });
    };
    for (const payment of payments) {
      const totals = row(payment.currency);
      totals.revenue = roundMoney(totals.revenue + payment.gross);
      totals.commission = roundMoney(totals.commission + payment.commission);
      totals.partnerNet = roundMoney(totals.partnerNet + payment.net);
    }
    for (const payout of paidPayouts) {
      const totals = row(payout.currency);
      totals.paidPayouts = roundMoney(totals.paidPayouts + payout.amount);
    }

    return { totalsByCurrency, transactions: payments };
  }

  private partnerPaymentWhere(partnerId: string): Prisma.PaymentWhereInput {
    return {
      status: PaymentStatus.PAID,
      OR: [
        { booking: { listing: { partnerId } } },
        { order: { product: { listing: { partnerId } } } },
      ],
    };
  }
}
