import {
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  PartnerCategory,
  PartnerStatus,
  Role,
} from "@prisma/client";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { UploadsService } from "../uploads/uploads.service";

@Injectable()
export class VerificationService {
  constructor(
    private prisma: PrismaService,
    private uploads: UploadsService,
  ) {}

  private documentUrls(documents: string[]) {
    return documents.flatMap((documentId) =>
      /^tembea-doc:v1:(pdf|jpg|png):[A-Za-z0-9/_-]+$/.test(documentId)
        ? [this.uploads.verificationDocumentDownloadUrl(documentId)]
        : [],
    );
  }

  async getPendingPartners(pagination: PaginationDto) {
    const { page = 1, limit = 20 } = pagination;
    const [partners, total] = await Promise.all([
      this.prisma.partner.findMany({
        where: { status: "PENDING", documents: { isEmpty: false } },
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: { name: true, email: true, createdAt: true } } },
        orderBy: { createdAt: "asc" },
      }),
      this.prisma.partner.count({
        where: { status: "PENDING", documents: { isEmpty: false } },
      }),
    ]);
    return {
      partners: partners.map((partner) => ({
        ...partner,
        documentUrls: this.documentUrls(partner.documents),
      })),
      total,
      page,
      limit,
    };
  }

  async getAllPartners(pagination: PaginationDto) {
    const { page = 1, limit = 20 } = pagination;
    const [partners, total] = await Promise.all([
      this.prisma.partner.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { name: true, email: true } },
          _count: { select: { listings: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.partner.count(),
    ]);
    return {
      partners: partners.map((partner) => ({
        ...partner,
        documentUrls: this.documentUrls(partner.documents),
      })),
      total,
      page,
      limit,
    };
  }

  async updateStatus(partnerId: string, status: PartnerStatus) {
    const partner = await this.prisma.partner.findUnique({
      where: { id: partnerId },
    });
    if (!partner) throw new NotFoundException("Partner not found");
    if (
      status === PartnerStatus.VERIFIED &&
      (partner.documents.length === 0 ||
        !partner.documents.every((documentId) =>
          /^tembea-doc:v1:(pdf|jpg|png):[A-Za-z0-9/_-]+$/.test(documentId),
        ))
    ) {
      throw new BadRequestException(
        "A partner application needs at least one valid private verification document",
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedPartner = await tx.partner.update({
        where: { id: partnerId },
        data: { status },
      });

      if (status !== PartnerStatus.VERIFIED) {
        await tx.listing.updateMany({
          where: { partnerId, published: true },
          data: { published: false },
        });
      }

      return updatedPartner;
    });
  }

  async applyAsPartner(
    userId: string,
    businessName: string,
    category: PartnerCategory,
    documents: string[],
    phone?: string,
    website?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: {
          role: true,
          partner: { select: { id: true, status: true } },
        },
      });
      if (!user) throw new NotFoundException("User not found");
      if (user.role === Role.ADMIN) {
        throw new ForbiddenException("Administrators cannot apply as partners");
      }
      if (user.partner?.status === PartnerStatus.VERIFIED) {
        throw new ConflictException("This partner profile is already verified");
      }
      if (user.partner?.status === PartnerStatus.SUSPENDED) {
        throw new ForbiddenException(
          "This partner profile is suspended; contact support for review",
        );
      }

      const partner = user.partner
        ? await tx.partner.update({
            where: { id: user.partner.id },
            data: {
              businessName,
              category,
              documents,
              phone,
              website,
            },
          })
        : await tx.partner.create({
            data: {
              userId,
              businessName,
              category,
              documents,
              phone,
              website,
            },
          });

      if (user.role !== Role.PARTNER) {
        await tx.user.update({
          where: { id: userId },
          data: { role: Role.PARTNER },
        });
      }

      return partner;
    });
  }

}
