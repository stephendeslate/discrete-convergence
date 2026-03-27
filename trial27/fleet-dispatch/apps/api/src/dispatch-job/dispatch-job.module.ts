// TRACED: FD-API-004 — Dispatch job module
import { Module } from '@nestjs/common';
import { DispatchJobController } from './dispatch-job.controller';
import { DispatchJobService } from './dispatch-job.service';

@Module({
  controllers: [DispatchJobController],
  providers: [DispatchJobService],
  exports: [DispatchJobService],
})
export class DispatchJobModule {}
