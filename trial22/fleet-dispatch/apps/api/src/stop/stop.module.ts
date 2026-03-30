import { Module } from '@nestjs/common';
import { StopService } from './stop.service';
import { StopController } from './stop.controller';

@Module({
  controllers: [StopController],
  providers: [StopService],
  exports: [StopService],
})
export class StopModule {}
