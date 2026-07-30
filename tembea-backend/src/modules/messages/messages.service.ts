import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PartnerStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async getMyConversations(userId: string, role: string) {
    if (role === "PARTNER") {
      // Get conversations for this partner
      const partner = await this.prisma.partner.findUnique({ where: { userId } });
      if (!partner) throw new NotFoundException("Partner profile not found");
      return this.prisma.conversation.findMany({
        where: { partnerId: partner.id },
        include: {
          client: { select: { id: true, name: true, avatar: true } },
          listing: { select: { id: true, name: true, type: true } },
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
        },
        orderBy: { updatedAt: "desc" },
      });
    }
    // CLIENT — get conversations they started
    return this.prisma.conversation.findMany({
      where: { clientId: userId },
      include: {
        partner: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
        listing: { select: { id: true, name: true, type: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async getMessages(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { partner: true },
    });
    if (!conversation) throw new NotFoundException("Conversation not found");

    // Verify user is participant
    const isClient = conversation.clientId === userId;
    const partner = await this.prisma.partner.findUnique({
      where: { id: conversation.partnerId },
    });
    const isPartner = partner?.userId === userId;
    if (!isClient && !isPartner) throw new ForbiddenException("Access denied");

    // Mark received messages as read
    await this.prisma.message.updateMany({
      where: { conversationId, senderId: { not: userId }, read: false },
      data: { read: true },
    });

    return this.prisma.message.findMany({
      where: { conversationId },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: "asc" },
    });
  }

  async sendMessage(
    senderId: string,
    conversationId: string,
    body: string,
  ) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { partner: true },
    });
    if (!conversation) throw new NotFoundException("Conversation not found");

    const partner = await this.prisma.partner.findUnique({
      where: { id: conversation.partnerId },
    });
    const isParticipant =
      conversation.clientId === senderId || partner?.userId === senderId;
    if (!isParticipant) throw new ForbiddenException("Access denied");

    const message = await this.prisma.message.create({
      data: { conversationId, senderId, body },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    });

    // Touch conversation updatedAt for sorting
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async startConversation(
    clientId: string,
    partnerId: string,
    listingId: string | undefined,
    firstMessage: string,
  ) {
    const partner = await this.prisma.partner.findFirst({
      where: { id: partnerId, status: PartnerStatus.VERIFIED },
    });
    if (!partner) throw new NotFoundException("Verified partner not found");
    if (partner.userId === clientId) {
      throw new BadRequestException("You cannot start a conversation with yourself");
    }
    if (listingId) {
      const listing = await this.prisma.listing.findFirst({
        where: {
          id: listingId,
          partnerId,
          published: true,
          partner: { status: PartnerStatus.VERIFIED },
        },
        select: { id: true },
      });
      if (!listing) throw new NotFoundException("Published listing not found");
    }

    let conversation = await this.prisma.conversation.findFirst({
      where: { clientId, partnerId, listingId: listingId ?? null },
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: { clientId, partnerId, listingId: listingId ?? null },
      });
    }

    return this.sendMessage(clientId, conversation.id, firstMessage);
  }
}
