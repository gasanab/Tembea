import { Module } from '@nestjs/common';
import { EventTicketsController } from './event-tickets.controller';
import { EventTicketsService } from './event-tickets.service';

@Module({
  controllers: [EventTicketsController],
  providers: [EventTicketsService],
  exports: [EventTicketsService],
})
export class EventTicketsModule {}
