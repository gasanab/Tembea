import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { MessagesService } from "./messages.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { Transform } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

class SendMessageDto {
  @ApiProperty()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  body!: string;
}

class StartConversationDto {
  @ApiProperty()
  @IsString()
  @MaxLength(128)
  partnerId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(128)
  listingId?: string;

  @ApiProperty()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  firstMessage!: string;
}

@ApiTags("messages")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("messages")
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get("conversations")
  @ApiOperation({ summary: "Get all my conversations" })
  getConversations(@CurrentUser() user) {
    return this.messagesService.getMyConversations(user.id, user.role);
  }

  @Post("conversations")
  @ApiOperation({ summary: "Start a new conversation with a partner" })
  startConversation(@CurrentUser() user, @Body() dto: StartConversationDto) {
    return this.messagesService.startConversation(
      user.id,
      dto.partnerId,
      dto.listingId,
      dto.firstMessage,
    );
  }

  @Get("conversations/:id")
  @ApiOperation({ summary: "Get messages in a conversation" })
  getMessages(@Param("id") id: string, @CurrentUser() user) {
    return this.messagesService.getMessages(id, user.id);
  }

  @Post("conversations/:id/send")
  @ApiOperation({ summary: "Send a message in a conversation" })
  sendMessage(
    @Param("id") id: string,
    @CurrentUser() user,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagesService.sendMessage(user.id, id, dto.body);
  }
}
