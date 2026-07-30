import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  UseGuards,
  Headers,
  RawBodyRequest,
  Req,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { PaymentsService } from "./payments.service";
import { InitiatePaymentDto } from "./dto/initiate-payment.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { Request } from "express";
import { Role } from "@prisma/client";

@ApiTags("payments")
@Controller("payments")
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post("initiate")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Initiate payment for a booking or order" })
  initiate(@CurrentUser() user, @Body() dto: InitiatePaymentDto) {
    return this.paymentsService.initiate(user.id, dto);
  }

  @Post("webhook")
  @ApiOperation({ summary: "Signed Flutterwave webhook handler (system only)" })
  webhook(
    @Headers("x-provider") provider: string,
    @Headers("flutterwave-signature") signature: string | undefined,
    @Req() request: RawBodyRequest<Request>,
    @Body() payload: Record<string, unknown>,
  ) {
    return this.paymentsService.handleWebhook({
      provider: provider ?? "flutterwave",
      signature,
      rawBody: request.rawBody,
      payload,
    });
  }

  @Get("booking/:bookingId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get payment for a booking" })
  findByBooking(@Param("bookingId") bookingId: string, @CurrentUser() user) {
    return this.paymentsService.findByBooking(
      bookingId,
      user.id,
      user.role,
      user.partner?.id,
    );
  }

  @Get("order/:orderId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get payment for an order" })
  findByOrder(@Param("orderId") orderId: string, @CurrentUser() user) {
    return this.paymentsService.findByOrder(
      orderId,
      user.id,
      user.role,
      user.partner?.id,
    );
  }

  @Get("transactions")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List recorded transactions (admin)" })
  findTransactions(@Query() pagination: PaginationDto) {
    return this.paymentsService.findTransactions(pagination);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get an authorised payment by its provider reference" })
  findOne(@Param("id") id: string, @CurrentUser() user) {
    return this.paymentsService.findOne(
      id,
      user.id,
      user.role,
      user.partner?.id,
    );
  }
}
