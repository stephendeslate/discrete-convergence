// TRACED: EM-API-005 — TicketType module
import { Module } from '@nestjs/common';
import { TicketTypeService } from './ticket-type.service';
import { TicketTypeController } from './ticket-type.controller';
import { EventModule } from '../event/event.module';

@Module({
  imports: [EventModule],
  controllers: [TicketTypeController],
  providers: [TicketTypeService],
  exports: [TicketTypeService],
})
export class TicketTypeModule {}
