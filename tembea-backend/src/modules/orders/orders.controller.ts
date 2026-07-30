import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AssignDeliveryDto } from './dto/assign-delivery.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ─── Client routes ───────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Place an order for a product (authenticated user)' })
  create(@CurrentUser() user, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(user.id, dto);
  }

  @Get('my')
  @ApiOperation({ summary: "Get the current user's orders" })
  findMyOrders(@CurrentUser() user) {
    return this.ordersService.findByUser(user.id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a PENDING order (order owner)' })
  cancel(@Param('id') id: string, @CurrentUser() user) {
    return this.ordersService.cancel(id, user.id);
  }

  // ─── Partner routes ──────────────────────────────────────────────────────────

  @Get('partner')
  @UseGuards(RolesGuard)
  @Roles(Role.PARTNER, Role.ADMIN)
  @ApiOperation({ summary: "Get orders for the partner's products" })
  findPartnerOrders(@CurrentUser() user) {
    return this.ordersService.findByPartner(user.partner?.id, user.role);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.PARTNER, Role.ADMIN)
  @ApiOperation({ summary: 'Update order status (partner)' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user,
  ) {
    return this.ordersService.updateStatus(
      id,
      dto,
      user.role,
      user.partner?.id,
    );
  }

  @Patch(':id/assign-delivery')
  @UseGuards(RolesGuard)
  @Roles(Role.PARTNER, Role.ADMIN)
  @ApiOperation({ summary: 'Assign delivery agent and mark order as SHIPPED (partner)' })
  assignDelivery(
    @Param('id') id: string,
    @Body() dto: AssignDeliveryDto,
    @CurrentUser() user,
  ) {
    return this.ordersService.assignDelivery(
      id,
      dto,
      user.role,
      user.partner?.id,
    );
  }

  // ─── Shared authenticated route ──────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Get a single order by ID (owner or partner)' })
  findOne(@Param('id') id: string, @CurrentUser() user) {
    return this.ordersService.findOne(id, user.id, user.role, user.partner?.id);
  }
}
