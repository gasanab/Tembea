import { Controller, Get, Post, Patch, Param, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { NotificationsService } from "./notifications.service";
import { SendNotificationDto } from "./dto/send-notification.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Role } from "@prisma/client";

@ApiTags("notifications")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("notifications")
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: "Get my notifications" })
  findAll(@CurrentUser() user) {
    return this.notificationsService.findAll(user.id);
  }

  @Get("unread-count")
  @ApiOperation({ summary: "Get unread notification count" })
  getUnreadCount(@CurrentUser() user) {
    return this.notificationsService.getUnreadCount(user.id);
  }

  @Patch(":id/read")
  @ApiOperation({ summary: "Mark a notification as read" })
  markRead(@Param("id") id: string, @CurrentUser() user) {
    return this.notificationsService.markRead(id, user.id);
  }

  @Patch("read-all")
  @ApiOperation({ summary: "Mark all notifications as read" })
  markAllRead(@CurrentUser() user) {
    return this.notificationsService.markAllRead(user.id);
  }

  @Post("send")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Admin: send bulk notifications to multiple users" })
  async sendBulk(@Body() dto: SendNotificationDto) {
    const results = await Promise.all(
      dto.userIds.map((userId) =>
        this.notificationsService.create(userId, dto.title, dto.message, dto.type),
      ),
    );
    return { sent: results.length, notifications: results };
  }
}
