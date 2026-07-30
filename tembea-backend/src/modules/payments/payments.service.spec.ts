/// <reference types="jest" />

import { ConflictException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { BookingStatus, PaymentStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { PaymentsService } from "./payments.service";

function configStub() {
  const values: Record<string, string> = {
    PAYMENT_WEBHOOKS_ENABLED: "true",
    PAYMENT_PROVIDER: "flutterwave",
    FLUTTERWAVE_WEBHOOK_HASH: "webhook-secret",
    FLUTTERWAVE_SECRET_KEY: "provider-secret",
  };
  return {
    get: jest.fn((key: string) => values[key]),
  };
}

describe("PaymentsService reservation transitions", () => {
  it("cancels an expired pending booking before payment initiation", async () => {
    const now = Date.now();
    const prisma = {
      booking: {
        findUnique: jest.fn().mockResolvedValue({
          id: "booking-1",
          userId: "user-1",
          status: BookingStatus.PENDING,
          holdExpiresAt: new Date(now - 1_000),
          amount: 100,
          currency: "USD",
          user: { name: "Client", email: "client@example.com" },
          listing: { name: "Hotel" },
        }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const service = new PaymentsService(
      prisma as unknown as PrismaService,
      configStub() as unknown as ConfigService,
    );

    await expect(
      (service as unknown as {
        bookingTarget(id: string, userId: string): Promise<unknown>;
      }).bookingTarget("booking-1", "user-1"),
    ).rejects.toThrow("hold expired");
    expect(prisma.booking.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: "booking-1",
          status: BookingStatus.PENDING,
        }),
        data: {
          status: BookingStatus.CANCELLED,
          holdExpiresAt: null,
        },
      }),
    );
  });

  it("does not initiate payment for a cancelled reservation", async () => {
    const prisma = {
      booking: {
        findUnique: jest.fn().mockResolvedValue({
          id: "booking-1",
          userId: "user-1",
          status: BookingStatus.CANCELLED,
          holdExpiresAt: null,
          amount: 100,
          currency: "USD",
          user: { name: "Client", email: "client@example.com" },
          listing: { name: "Hotel" },
        }),
        updateMany: jest.fn(),
      },
    };
    const service = new PaymentsService(
      prisma as unknown as PrismaService,
      configStub() as unknown as ConfigService,
    );

    await expect(
      (service as unknown as {
        bookingTarget(id: string, userId: string): Promise<unknown>;
      }).bookingTarget("booking-1", "user-1"),
    ).rejects.toThrow("cannot be paid from CANCELLED");
    expect(prisma.booking.updateMany).not.toHaveBeenCalled();
  });

  it("confirms payment and clears only an active reservation hold", async () => {
    const payment = {
      id: "payment-1",
      provider: "flutterwave",
      providerRef: null,
      status: PaymentStatus.UNPAID,
      gross: 100,
      currency: "USD",
      bookingId: "booking-1",
      orderId: null,
    };
    const tx = {
      payment: {
        findFirst: jest.fn().mockResolvedValue(null),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      booking: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      order: {
        updateMany: jest.fn(),
      },
    };
    const prisma = {
      payment: {
        findUnique: jest.fn().mockResolvedValue(payment),
      },
      $transaction: jest.fn().mockImplementation((callback) => callback(tx)),
    };
    const service = new PaymentsService(
      prisma as unknown as PrismaService,
      configStub() as unknown as ConfigService,
    );
    const internalService = service as any;
    jest
      .spyOn(internalService, "verifyFlutterwaveSignature")
      .mockImplementation(() => undefined);
    jest
      .spyOn(internalService, "verifyFlutterwaveTransaction")
      .mockResolvedValue({
        status: "successful",
        reference: payment.id,
        amount: payment.gross,
        currency: payment.currency,
      } as never);

    await expect(
      service.handleWebhook({
        provider: "flutterwave",
        signature: "signature",
        rawBody: Buffer.from("{}"),
        payload: {
          data: {
            status: "successful",
            tx_ref: payment.id,
            id: "provider-transaction-1",
          },
        },
      }),
    ).resolves.toEqual({
      received: true,
      duplicate: false,
      paymentId: payment.id,
    });

    expect(tx.booking.updateMany).toHaveBeenCalledWith({
      where: {
        id: "booking-1",
        OR: [
          { status: BookingStatus.APPROVED },
          {
            status: BookingStatus.PENDING,
            holdExpiresAt: { gt: expect.any(Date) },
          },
        ],
      },
      data: {
        status: BookingStatus.CONFIRMED,
        holdExpiresAt: null,
      },
    });
  });

  it("rolls back payment processing when the booking no longer holds inventory", async () => {
    const payment = {
      id: "payment-1",
      provider: "flutterwave",
      providerRef: null,
      status: PaymentStatus.UNPAID,
      gross: 100,
      currency: "USD",
      bookingId: "booking-1",
      orderId: null,
    };
    const tx = {
      payment: {
        findFirst: jest.fn().mockResolvedValue(null),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      booking: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      order: {
        updateMany: jest.fn(),
      },
    };
    const prisma = {
      payment: {
        findUnique: jest.fn().mockResolvedValue(payment),
      },
      $transaction: jest.fn().mockImplementation((callback) => callback(tx)),
    };
    const service = new PaymentsService(
      prisma as unknown as PrismaService,
      configStub() as unknown as ConfigService,
    );
    const internalService = service as any;
    jest
      .spyOn(internalService, "verifyFlutterwaveSignature")
      .mockImplementation(() => undefined);
    jest
      .spyOn(internalService, "verifyFlutterwaveTransaction")
      .mockResolvedValue({
        status: "successful",
        reference: payment.id,
        amount: payment.gross,
        currency: payment.currency,
      } as never);

    await expect(
      service.handleWebhook({
        provider: "flutterwave",
        signature: "signature",
        rawBody: Buffer.from("{}"),
        payload: {
          data: {
            status: "successful",
            tx_ref: payment.id,
            id: "provider-transaction-1",
          },
        },
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
