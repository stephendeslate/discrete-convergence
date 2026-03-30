import { Module } from '@nestjs/common';
import { PublicEventController } from './public-event.controller';
import { EventModule } from '../event/event.module';

@Module({
  imports: [EventModule],
  controllers: [PublicEventController],
})
export class PublicEventModule {}
