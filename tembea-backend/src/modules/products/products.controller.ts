import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { VerifiedPartnerGuard } from '../../common/guards/verified-partner.guard';
import { getPartnerIdOrThrow } from '../../common/utils/partner-context';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ─── Partner routes ──────────────────────────────────────────────────────────

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiOperation({ summary: 'Create a product for a marketplace listing (partner)' })
  create(@CurrentUser() user, @Body() dto: CreateProductDto) {
    return this.productsService.create(dto, getPartnerIdOrThrow(user));
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiOperation({ summary: 'Update a product (partner)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user,
  ) {
    return this.productsService.update(id, dto, getPartnerIdOrThrow(user));
  }

  @Patch(':id/inventory')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiOperation({ summary: 'Update product stock/inventory (partner)' })
  updateInventory(
    @Param('id') id: string,
    @Body() dto: UpdateInventoryDto,
    @CurrentUser() user,
  ) {
    return this.productsService.updateInventory(
      id,
      dto,
      getPartnerIdOrThrow(user),
    );
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiOperation({ summary: 'Delete a product (partner)' })
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.productsService.remove(id, getPartnerIdOrThrow(user));
  }

  // ─── Public routes ───────────────────────────────────────────────────────────

  @Get('mine/listing/:listingId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiOperation({
    summary: 'Get my products for a listing, including drafts',
  })
  findMineByListing(
    @Param('listingId') listingId: string,
    @CurrentUser() user,
  ) {
    return this.productsService.findMineByListing(
      listingId,
      getPartnerIdOrThrow(user),
    );
  }

  @Get('mine/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedPartnerGuard)
  @Roles(Role.PARTNER)
  @ApiOperation({ summary: 'Get one of my products, including draft data' })
  findMine(@Param('id') id: string, @CurrentUser() user) {
    return this.productsService.findMine(id, getPartnerIdOrThrow(user));
  }

  @Get('listing/:listingId')
  @ApiOperation({
    summary: 'Get products for a public, verified listing',
  })
  findByListing(@Param('listingId') listingId: string) {
    return this.productsService.findByListing(listingId);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products by name (public)' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  search(@Query('q') q: string) {
    return this.productsService.search(q ?? '');
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a product from a public, verified listing',
  })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }
}
