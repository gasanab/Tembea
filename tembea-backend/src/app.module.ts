import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { validate } from "./config/env.validation";
import jwtConfig from "./config/jwt.config";
import { HealthController } from "./common/controllers/health.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { RequestIdMiddleware } from "./common/middleware/request-id.middleware";

import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { ListingsModule } from "./modules/listings/listings.module";
import { BookingsModule } from "./modules/bookings/bookings.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { ReviewsModule } from "./modules/reviews/reviews.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { UploadsModule } from "./modules/uploads/uploads.module";
import { EarningsModule } from "./modules/earnings/earnings.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { VerificationModule } from "./modules/verification/verification.module";
import { SearchModule } from "./modules/search/search.module";
import { WishlistModule } from "./modules/wishlist/wishlist.module";
import { MessagesModule } from "./modules/messages/messages.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { RoomsModule } from "./modules/rooms/rooms.module";
import { EventTicketsModule } from "./modules/event-tickets/event-tickets.module";
import { VehiclesModule } from "./modules/vehicles/vehicles.module";
import { GuidesModule } from "./modules/guides/guides.module";
import { ExperiencesModule } from "./modules/experiences/experiences.module";
import { ProductsModule } from "./modules/products/products.module";
import { OrdersModule } from "./modules/orders/orders.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig],
      validate,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute window
        limit: 60,  // 60 requests per minute per IP
      },
    ]),
    PrismaModule,
    // Core
    AuthModule,
    UsersModule,
    // Marketplace
    ListingsModule,
    RoomsModule,
    EventTicketsModule,
    VehiclesModule,
    GuidesModule,
    ExperiencesModule,
    ProductsModule,
    OrdersModule,
    BookingsModule,
    PaymentsModule,
    ReviewsModule,
    SearchModule,
    WishlistModule,
    // Communication
    NotificationsModule,
    MessagesModule,
    // Partner
    UploadsModule,
    EarningsModule,
    AnalyticsModule,
    VerificationModule,
    // Admin
    ReportsModule,
  ],
  controllers: [HealthController],
  providers: [
    ThrottlerGuard,
    {
      provide: APP_GUARD,
      // useExisting keeps the global production guard replaceable in
      // integration tests without weakening the real runtime limits.
      useExisting: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes("*");
  }
}
