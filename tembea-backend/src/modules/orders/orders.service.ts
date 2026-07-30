import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  ListingAvailability,
  ListingType,
  OrderStatus,
  PartnerStatus,
  PaymentStatus,
  Prisma,
} from "@prisma/client";
import { listingCurrency, roundMoney } from "../../common/utils/commerce.util";
import { PrismaService } from "../../prisma/prisma.service";
import { AssignDeliveryDto } from "./dto/assign-delivery.dto";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";

const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [OrderStatus.CANCELLED],
  CONFIRMED: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  PREPARING: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  SHIPPED: [OrderStatus.DELIVERED],
  DELIVERED: [],
  CANCELLED: [],
};

const ORDER_INCLUDE = {
  product: {
    select: {
      name: true,
      images: true,
      price: true,
      category: true,
      listing: { select: { name: true, location: true, partnerId: true } },
    },
  },
  payment: { select: { status: true, gross: true, net: true } },
} satisfies Prisma.OrderInclude;

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrderDto) {
    if (dto.clientReference) {
      const existing = await this.prisma.order.findUnique({
        where: { clientReference: dto.clientReference },
        include: ORDER_INCLUDE,
      });
      if (existing) {
        if (existing.userId !== userId) {
          throw new ConflictException("Client reference is already in use");
        }
        return existing;
      }
    }

    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const product = await tx.product.findUnique({
            where: { id: dto.productId },
            include: {
              listing: {
                select: {
                  name: true,
                  location: true,
                  type: true,
                  published: true,
                  availability: true,
                  extraData: true,
                  partner: { select: { status: true } },
                },
              },
            },
          });
          if (!product) throw new NotFoundException("Product not found");
          if (
            product.listing.type !== ListingType.MARKETPLACE ||
            !product.listing.published ||
            product.listing.partner.status !== PartnerStatus.VERIFIED ||
            (product.listing.availability === ListingAvailability.CLOSED ||
              product.listing.availability === ListingAvailability.FULLY_BOOKED)
          ) {
            throw new BadRequestException("This product is not available for purchase");
          }

          // The conditional write is the stock check. Concurrent checkouts cannot
          // both reserve the same final unit.
          const reserved = await tx.product.updateMany({
            where: { id: product.id, stock: { gte: dto.quantity } },
            data: {
              stock: { decrement: dto.quantity },
              sold: { increment: dto.quantity },
            },
          });
          if (reserved.count !== 1) {
            throw new BadRequestException(
              `Insufficient stock. Available: ${Math.max(product.stock, 0)}`,
            );
          }

          return tx.order.create({
            data: {
              clientReference: dto.clientReference,
              userId,
              productId: product.id,
              quantity: dto.quantity,
              amount: roundMoney(product.price * dto.quantity),
              currency: listingCurrency(product.listing.extraData),
              deliveryAddress: dto.deliveryAddress,
              deliveryNotes: dto.deliveryNotes,
            },
            include: ORDER_INCLUDE,
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (
        dto.clientReference &&
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const existing = await this.prisma.order.findUnique({
          where: { clientReference: dto.clientReference },
          include: ORDER_INCLUDE,
        });
        if (existing?.userId === userId) return existing;
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034"
      ) {
        throw new ConflictException("Inventory changed; retry the order");
      }
      throw error;
    }
  }

  findByUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: ORDER_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
  }

  findByPartner(partnerId: string | undefined, requesterRole: string) {
    if (requesterRole !== "ADMIN" && !partnerId) {
      throw new ForbiddenException("A partner profile is required");
    }
    return this.prisma.order.findMany({
      where:
        requesterRole === "ADMIN"
          ? undefined
          : { product: { listing: { partnerId } } },
      include: {
        ...ORDER_INCLUDE,
        user: { select: { name: true, email: true, avatar: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(
    id: string,
    userId: string,
    requesterRole: string,
    partnerId?: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        ...ORDER_INCLUDE,
        user: { select: { id: true, name: true, email: true } },
      },
    });
    if (!order) throw new NotFoundException("Order not found");

    const canView =
      order.userId === userId ||
      requesterRole === "ADMIN" ||
      (Boolean(partnerId) && order.product.listing.partnerId === partnerId);
    if (!canView) throw new ForbiddenException("You do not have access to this order");
    return order;
  }

  async updateStatus(
    id: string,
    dto: UpdateOrderStatusDto,
    requesterRole: string,
    partnerId?: string,
  ) {
    const order = await this.assertManageAccess(id, requesterRole, partnerId);
    if (order.status === dto.status) return order;
    if (!ORDER_TRANSITIONS[order.status].includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition order from ${order.status} to ${dto.status}`,
      );
    }
    if (dto.status === OrderStatus.CANCELLED) {
      return this.cancelAndRestoreStock(order);
    }

    const changed = await this.prisma.order.updateMany({
      where: { id, status: order.status },
      data: {
        status: dto.status,
        ...(dto.deliveryAgent !== undefined && { deliveryAgent: dto.deliveryAgent }),
        ...(dto.trackingNumber !== undefined && { trackingNumber: dto.trackingNumber }),
      },
    });
    if (changed.count !== 1) {
      throw new ConflictException("Order status changed; refresh and try again");
    }
    return this.prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDE });
  }

  async assignDelivery(
    id: string,
    dto: AssignDeliveryDto,
    requesterRole: string,
    partnerId?: string,
  ) {
    const order = await this.assertManageAccess(id, requesterRole, partnerId);
    if (
      order.status !== OrderStatus.CONFIRMED &&
      order.status !== OrderStatus.PREPARING
    ) {
      throw new BadRequestException(
        `Delivery cannot be assigned while order is ${order.status}`,
      );
    }
    const changed = await this.prisma.order.updateMany({
      where: { id, status: order.status },
      data: {
        deliveryAgent: dto.deliveryAgent,
        ...(dto.trackingNumber !== undefined && { trackingNumber: dto.trackingNumber }),
        status: OrderStatus.SHIPPED,
      },
    });
    if (changed.count !== 1) {
      throw new ConflictException("Order status changed; refresh and try again");
    }
    return this.prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDE });
  }

  async cancel(id: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { payment: { select: { status: true } } },
    });
    if (!order) throw new NotFoundException("Order not found");
    if (order.userId !== userId) {
      throw new ForbiddenException("This order does not belong to you");
    }
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        `Only PENDING orders can be cancelled. Current status: ${order.status}`,
      );
    }
    return this.cancelAndRestoreStock(order);
  }

  private async cancelAndRestoreStock(order: {
    id: string;
    productId: string;
    quantity: number;
    status: OrderStatus;
    payment: { status: PaymentStatus } | null;
  }) {
    if (order.payment?.status === PaymentStatus.PAID) {
      throw new BadRequestException("Paid orders require a refund workflow");
    }
    return this.prisma.$transaction(async (tx) => {
      const changed = await tx.order.updateMany({
        where: { id: order.id, status: order.status },
        data: { status: OrderStatus.CANCELLED },
      });
      if (changed.count !== 1) {
        throw new ConflictException("Order status changed; refresh and try again");
      }
      await tx.product.update({
        where: { id: order.productId },
        data: {
          stock: { increment: order.quantity },
          sold: { decrement: order.quantity },
        },
      });
      return tx.order.findUnique({ where: { id: order.id }, include: ORDER_INCLUDE });
    });
  }

  private async assertManageAccess(
    orderId: string,
    requesterRole: string,
    partnerId?: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: { select: { status: true } },
        product: { select: { listing: { select: { partnerId: true } } } },
      },
    });
    if (!order) throw new NotFoundException("Order not found");
    if (
      requesterRole !== "ADMIN" &&
      (!partnerId || order.product.listing.partnerId !== partnerId)
    ) {
      throw new ForbiddenException("You do not have permission to manage this order");
    }
    return order;
  }
}
