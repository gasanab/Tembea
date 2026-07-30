import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { ListingType } from '@prisma/client';
import { PUBLIC_LISTING_WHERE } from '../../common/prisma/public-listing.where';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto, partnerId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: dto.listingId },
    });

    if (!listing) throw new NotFoundException('Listing not found');

    if (listing.partnerId !== partnerId) {
      throw new ForbiddenException('This listing does not belong to you');
    }

    if (listing.type !== ListingType.MARKETPLACE) {
      throw new BadRequestException(
        'Products can only be added to MARKETPLACE listings',
      );
    }

    return this.prisma.product.create({
      data: {
        listingId: dto.listingId,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        stock: dto.stock,
        images: dto.images ?? [],
        category: dto.category,
        sku: dto.sku,
        weight: dto.weight,
        tags: dto.tags ?? [],
        featured: dto.featured ?? false,
      },
      include: {
        listing: { select: { name: true, location: true } },
      },
    });
  }

  async findByListing(listingId: string) {
    const listing = await this.prisma.listing.findFirst({
      where: {
        id: listingId,
        ...PUBLIC_LISTING_WHERE,
      },
      select: { id: true },
    });

    if (!listing) throw new NotFoundException('Listing not found');

    return this.prisma.product.findMany({
      where: {
        listingId,
        listing: { is: PUBLIC_LISTING_WHERE },
      },
      orderBy: { featured: 'desc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        listing: { is: PUBLIC_LISTING_WHERE },
      },
      include: {
        listing: {
          select: {
            id: true,
            name: true,
            location: true,
            rating: true,
          },
        },
      },
    });

    if (!product) throw new NotFoundException('Product not found');

    return product;
  }

  async findMineByListing(listingId: string, partnerId: string) {
    const listing = await this.prisma.listing.findFirst({
      where: { id: listingId, partnerId },
      select: { id: true },
    });
    if (!listing) throw new NotFoundException('Listing not found');

    return this.prisma.product.findMany({
      where: { listingId },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findMine(id: string, partnerId: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        listing: { is: { partnerId } },
      },
      include: {
        listing: {
          select: { id: true, name: true, partnerId: true, published: true },
        },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, dto: UpdateProductDto, partnerId: string) {
    await this.assertOwnership(id, partnerId);

    return this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.stock !== undefined && { stock: dto.stock }),
        ...(dto.images !== undefined && { images: dto.images }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.sku !== undefined && { sku: dto.sku }),
        ...(dto.weight !== undefined && { weight: dto.weight }),
        ...(dto.tags !== undefined && { tags: dto.tags }),
        ...(dto.featured !== undefined && { featured: dto.featured }),
      },
      include: {
        listing: { select: { name: true, location: true } },
      },
    });
  }

  async updateInventory(
    id: string,
    dto: UpdateInventoryDto,
    partnerId: string,
  ) {
    await this.assertOwnership(id, partnerId);

    return this.prisma.product.update({
      where: { id },
      data: { stock: dto.stock },
    });
  }

  async remove(id: string, partnerId: string) {
    await this.assertOwnership(id, partnerId);

    await this.prisma.product.delete({ where: { id } });

    return { message: 'Product deleted successfully' };
  }

  async search(query: string) {
    return this.prisma.product.findMany({
      where: {
        listing: { is: PUBLIC_LISTING_WHERE },
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      include: {
        listing: {
          select: { id: true, name: true, location: true, rating: true },
        },
      },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    });
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private async assertOwnership(productId: string, partnerId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        listing: { select: { partnerId: true } },
      },
    });

    if (!product) throw new NotFoundException('Product not found');

    if (product.listing.partnerId !== partnerId) {
      throw new ForbiddenException(
        'You do not have permission to modify this product',
      );
    }

    return product;
  }
}
