// TRACED: EM-API-006 — Registration module
import { Module } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { RegistrationController } from './registration.controller';
import { EventModule } from '../event/event.module';
import { TicketTypeModule } from '../ticket-type/ticket-type.module';

@Module({
  imports: [EventModule, TicketTypeModule],
  controllers: [RegistrationController],
  providers: [RegistrationService],
  exports: [RegistrationService],
})
export class RegistrationModule {}
