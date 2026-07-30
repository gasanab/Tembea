import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { BookingStatus, OrderStatus, PaymentStatus, Prisma } from "@prisma/client";
import { createHmac, timingSafeEqual } from "crypto";
import { PrismaService } from "../../prisma/prisma.service";
import { moneyEquals, normalizeCurrency, roundMoney } from "../../common/utils/commerce.util";
import { InitiatePaymentDto } from "./dto/initiate-payment.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";

type PaymentProvider = "flutterwave";

type PaymentTarget = {
  bookingId?: string;
  orderId?: string;
  amount: number;
  currency: string;
  customer: { name: string; email: string };
  description: string;
};

type WebhookInput = {
  provider: string;
  signature?: string;
  rawBody?: Buffer;
  payload: Record<string, unknown>;
};

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async initiate(userId: string, dto: InitiatePaymentDto) {
    this.assertPaymentsEnabled();
    if (Boolean(dto.bookingId) === Boolean(dto.orderId)) {
      throw new BadRequestException("Provide exactly one of bookingId or orderId");
    }

    const provider = this.configuredProvider();
    if (dto.provider && dto.provider !== provider) {
      throw new BadRequestException(`Payment provider must be ${provider}`);
    }

    const target = dto.bookingId
      ? await this.bookingTarget(dto.bookingId, userId)
      : await this.orderTarget(dto.orderId!, userId);
    if (target.amount <= 0) throw new BadRequestException("There is no balance to pay");

    let payment = await this.findTargetPayment(target);
    if (!payment) {
      const gross = roundMoney(target.amount);
      const rate = this.commissionRate();
      const commission = roundMoney(gross * rate);
      const net = roundMoney(gross - commission);

      try {
        payment = await this.prisma.payment.create({
          data: {
            bookingId: target.bookingId,
            orderId: target.orderId,
            gross,
            commission,
            net,
            currency: normalizeCurrency(target.currency),
            provider,
          },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          payment = await this.findTargetPayment(target);
        } else {
          throw error;
        }
      }
    }

    if (!payment) throw new ConflictException("Unable to create payment");
    if (payment.status === PaymentStatus.PAID) {
      return { payment, paymentLink: payment.checkoutUrl, alreadyPaid: true };
    }
    if (payment.status === PaymentStatus.REFUNDED) {
      throw new BadRequestException("This payment has already been refunded");
    }

    if (!payment.checkoutUrl) {
      const checkoutUrl = await this.createFlutterwaveCheckout(payment, target);
      payment = await this.prisma.payment.update({
        where: { id: payment.id },
        data: { checkoutUrl },
      });
    }

    return { payment, paymentLink: payment.checkoutUrl };
  }

  async handleWebhook(input: WebhookInput) {
    const provider = input.provider.toLowerCase();
    this.assertWebhookConfigured(provider);
    this.verifyFlutterwaveSignature(input.rawBody, input.signature);

    const data = this.webhookData(input.payload);
    if (data.status !== "successful") {
      return { received: true, ignored: true, reason: "non_success_status" };
    }
    if (!data.transactionId || !data.reference) {
      throw new BadRequestException("Webhook is missing transaction identity");
    }

    const payment = await this.prisma.payment.findUnique({
      where: { id: data.reference },
    });
    if (!payment || payment.provider !== provider) {
      throw new NotFoundException("Payment reference not found");
    }
    if (payment.status === PaymentStatus.PAID && payment.providerRef === data.transactionId) {
      return { received: true, duplicate: true, paymentId: payment.id };
    }
    if (payment.status !== PaymentStatus.UNPAID) {
      throw new ConflictException(`Payment cannot be processed from ${payment.status}`);
    }

    const verified = await this.verifyFlutterwaveTransaction(data.transactionId);
    if (
      verified.status !== "successful" ||
      verified.reference !== payment.id ||
      !moneyEquals(verified.amount, payment.gross) ||
      normalizeCurrency(verified.currency) !== normalizeCurrency(payment.currency)
    ) {
      throw new BadRequestException("Provider verification did not match the payment quote");
    }

    const processed = await this.prisma.$transaction(async (tx) => {
      const processedAt = new Date();
      const reusedReference = await tx.payment.findFirst({
        where: {
          provider,
          providerRef: data.transactionId,
          id: { not: payment.id },
        },
        select: { id: true },
      });
      if (reusedReference) {
        throw new ConflictException("Provider transaction is already assigned");
      }

      const updated = await tx.payment.updateMany({
        where: { id: payment.id, status: PaymentStatus.UNPAID },
        data: {
          status: PaymentStatus.PAID,
          providerRef: data.transactionId,
          paidAt: processedAt,
          webhookProcessedAt: processedAt,
        },
      });
      if (updated.count !== 1) return false;

      if (payment.bookingId) {
        const confirmed = await tx.booking.updateMany({
          where: {
            id: payment.bookingId,
            OR: [
              { status: BookingStatus.APPROVED },
              {
                status: BookingStatus.PENDING,
                holdExpiresAt: { gt: processedAt },
              },
            ],
          },
          data: { status: BookingStatus.CONFIRMED, holdExpiresAt: null },
        });
        if (confirmed.count !== 1) {
          throw new ConflictException(
            "The reservation is no longer payable; payment requires reconciliation",
          );
        }
      }
      if (payment.orderId) {
        const confirmed = await tx.order.updateMany({
          where: { id: payment.orderId, status: OrderStatus.PENDING },
          data: { status: OrderStatus.CONFIRMED },
        });
        if (confirmed.count !== 1) {
          throw new ConflictException(
            "The order is no longer payable; payment requires reconciliation",
          );
        }
      }
      return true;
    });

    return {
      received: true,
      duplicate: !processed,
      paymentId: payment.id,
    };
  }

  async findByBooking(
    bookingId: string,
    userId: string,
    userRole: string,
    partnerId?: string,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        userId: true,
        listing: { select: { partnerId: true } },
        payment: true,
      },
    });
    if (!booking) throw new NotFoundException("Booking not found");
    if (
      booking.userId !== userId &&
      userRole !== "ADMIN" &&
      (!partnerId || booking.listing.partnerId !== partnerId)
    ) {
      throw new ForbiddenException("Not authorised to view this payment");
    }
    return booking.payment;
  }

  async findByOrder(
    orderId: string,
    userId: string,
    userRole: string,
    partnerId?: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        userId: true,
        product: { select: { listing: { select: { partnerId: true } } } },
        payment: true,
      },
    });
    if (!order) throw new NotFoundException("Order not found");
    if (
      order.userId !== userId &&
      userRole !== "ADMIN" &&
      (!partnerId || order.product.listing.partnerId !== partnerId)
    ) {
      throw new ForbiddenException("Not authorised to view this payment");
    }
    return order.payment;
  }

  async findOne(
    paymentId: string,
    userId: string,
    userRole: string,
    partnerId?: string,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          select: {
            userId: true,
            listing: { select: { partnerId: true } },
          },
        },
        order: {
          select: {
            userId: true,
            product: {
              select: {
                listing: { select: { partnerId: true } },
              },
            },
          },
        },
      },
    });
    if (!payment) throw new NotFoundException("Payment not found");

    const ownerId = payment.booking?.userId ?? payment.order?.userId;
    const ownerPartnerId =
      payment.booking?.listing.partnerId ??
      payment.order?.product.listing.partnerId;
    if (
      ownerId !== userId &&
      userRole !== "ADMIN" &&
      (!partnerId || ownerPartnerId !== partnerId)
    ) {
      throw new ForbiddenException("Not authorised to view this payment");
    }

    const { booking: _booking, order: _order, ...authorisedPayment } = payment;
    return authorisedPayment;
  }

  async findTransactions(pagination: PaginationDto) {
    const page = Math.max(1, pagination.page ?? 1);
    const limit = Math.min(Math.max(1, pagination.limit ?? 20), 100);
    const where: Prisma.PaymentWhereInput = {
      status: { in: [PaymentStatus.PAID, PaymentStatus.REFUNDED] },
    };
    const [transactions, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          bookingId: true,
          orderId: true,
          gross: true,
          commission: true,
          net: true,
          currency: true,
          status: true,
          provider: true,
          providerRef: true,
          paidAt: true,
          createdAt: true,
          booking: {
            select: {
              user: { select: { id: true, name: true, email: true } },
              listing: { select: { id: true, name: true, type: true } },
            },
          },
          order: {
            select: {
              user: { select: { id: true, name: true, email: true } },
              product: {
                select: {
                  id: true,
                  name: true,
                  listing: { select: { id: true, name: true } },
                },
              },
            },
          },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return { transactions, total, page, limit };
  }

  private async bookingTarget(bookingId: string, userId: string): Promise<PaymentTarget> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: { select: { name: true, email: true } },
        listing: { select: { name: true } },
      },
    });
    if (!booking) throw new NotFoundException("Booking not found");
    if (booking.userId !== userId) {
      throw new ForbiddenException("This booking does not belong to you");
    }
    if (
      booking.status !== BookingStatus.PENDING &&
      booking.status !== BookingStatus.APPROVED
    ) {
      throw new BadRequestException(`Booking cannot be paid from ${booking.status}`);
    }
    const now = new Date();
    if (
      booking.status === BookingStatus.PENDING &&
      (!booking.holdExpiresAt || booking.holdExpiresAt <= now)
    ) {
      await this.prisma.booking.updateMany({
        where: {
          id: booking.id,
          status: BookingStatus.PENDING,
          OR: [{ holdExpiresAt: null }, { holdExpiresAt: { lte: now } }],
        },
        data: { status: BookingStatus.CANCELLED, holdExpiresAt: null },
      });
      throw new ConflictException("The reservation hold expired; create a new booking");
    }
    return {
      bookingId,
      amount: booking.amount,
      currency: booking.currency,
      customer: booking.user,
      description: booking.listing.name,
    };
  }

  private async orderTarget(orderId: string, userId: string): Promise<PaymentTarget> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true } },
      },
    });
    if (!order) throw new NotFoundException("Order not found");
    if (order.userId !== userId) {
      throw new ForbiddenException("This order does not belong to you");
    }
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(`Order cannot be paid from ${order.status}`);
    }
    return {
      orderId,
      amount: order.amount,
      currency: order.currency,
      customer: order.user,
      description: order.product.name,
    };
  }

  private findTargetPayment(target: PaymentTarget) {
    return target.bookingId
      ? this.prisma.payment.findUnique({ where: { bookingId: target.bookingId } })
      : this.prisma.payment.findUnique({ where: { orderId: target.orderId! } });
  }

  private async createFlutterwaveCheckout(payment: any, target: PaymentTarget): Promise<string> {
    const secretKey = this.requiredConfig("FLUTTERWAVE_SECRET_KEY");
    const redirectUrl = this.requiredConfig("PAYMENT_REDIRECT_URL");
    const apiBase = this.config.get<string>("FLUTTERWAVE_API_BASE_URL") ??
      "https://api.flutterwave.com/v3";

    const response = await fetch(`${apiBase.replace(/\/$/, "")}/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tx_ref: payment.id,
        amount: payment.gross,
        currency: payment.currency,
        redirect_url: redirectUrl,
        customer: target.customer,
        customizations: {
          title: "Tembea",
          description: target.description,
        },
        meta: {
          paymentId: payment.id,
          bookingId: target.bookingId,
          orderId: target.orderId,
        },
      }),
    });
    const body = (await response.json().catch(() => ({}))) as Record<string, any>;
    const link = body?.data?.link;
    if (!response.ok || body.status !== "success" || typeof link !== "string") {
      throw new ServiceUnavailableException("Payment provider could not create checkout");
    }
    return link;
  }

  private async verifyFlutterwaveTransaction(transactionId: string) {
    const secretKey = this.requiredConfig("FLUTTERWAVE_SECRET_KEY");
    const apiBase = this.config.get<string>("FLUTTERWAVE_API_BASE_URL") ??
      "https://api.flutterwave.com/v3";
    const response = await fetch(
      `${apiBase.replace(/\/$/, "")}/transactions/${encodeURIComponent(transactionId)}/verify`,
      { headers: { Authorization: `Bearer ${secretKey}` } },
    );
    const body = (await response.json().catch(() => ({}))) as Record<string, any>;
    if (!response.ok || body.status !== "success" || !body.data) {
      throw new ServiceUnavailableException("Payment provider verification failed");
    }
    return {
      status: String(body.data.status ?? "").toLowerCase(),
      reference: String(body.data.tx_ref ?? ""),
      amount: Number(body.data.amount),
      currency: String(body.data.currency ?? ""),
    };
  }

  private verifyFlutterwaveSignature(rawBody?: Buffer, signature?: string) {
    if (!rawBody?.length || !signature) {
      throw new UnauthorizedException("Missing webhook signature or raw body");
    }
    const secretHash = this.requiredConfig("FLUTTERWAVE_WEBHOOK_HASH");
    const expected = createHmac("sha256", secretHash).update(rawBody).digest("base64");
    const actualBuffer = Buffer.from(signature.trim());
    const expectedBuffer = Buffer.from(expected);
    if (
      actualBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(actualBuffer, expectedBuffer)
    ) {
      throw new UnauthorizedException("Invalid webhook signature");
    }
  }

  private webhookData(payload: Record<string, unknown>) {
    const data =
      payload.data && typeof payload.data === "object"
        ? (payload.data as Record<string, unknown>)
        : {};
    return {
      status: String(data.status ?? "").toLowerCase(),
      reference: String(data.tx_ref ?? ""),
      transactionId: String(data.id ?? ""),
    };
  }

  private assertPaymentsEnabled() {
    if (!this.flag("PAYMENTS_ENABLED")) {
      throw new ServiceUnavailableException("Payments are disabled");
    }
    this.requiredConfig("FLUTTERWAVE_SECRET_KEY");
    this.requiredConfig("PAYMENT_REDIRECT_URL");
  }

  private assertWebhookConfigured(provider: string) {
    if (!this.flag("PAYMENT_WEBHOOKS_ENABLED")) {
      throw new ServiceUnavailableException("Payment webhooks are disabled");
    }
    if (provider !== this.configuredProvider()) {
      throw new BadRequestException("Unsupported payment provider");
    }
    this.requiredConfig("FLUTTERWAVE_WEBHOOK_HASH");
    this.requiredConfig("FLUTTERWAVE_SECRET_KEY");
  }

  private configuredProvider(): PaymentProvider {
    const provider = (this.config.get<string>("PAYMENT_PROVIDER") ?? "flutterwave").toLowerCase();
    if (provider !== "flutterwave") {
      throw new ServiceUnavailableException("Configured payment provider is unsupported");
    }
    return provider;
  }

  private commissionRate(): number {
    const rate = Number(this.config.get<string | number>("PLATFORM_COMMISSION_RATE") ?? 0.1);
    if (!Number.isFinite(rate) || rate < 0 || rate >= 1) {
      throw new ServiceUnavailableException("Platform commission rate is invalid");
    }
    return rate;
  }

  private flag(key: string): boolean {
    const value = this.config.get<string | boolean>(key);
    return value === true || String(value ?? "").toLowerCase() === "true";
  }

  private requiredConfig(key: string): string {
    const value = this.config.get<string>(key)?.trim();
    if (!value) throw new ServiceUnavailableException(`${key} is not configured`);
    return value;
  }
}
