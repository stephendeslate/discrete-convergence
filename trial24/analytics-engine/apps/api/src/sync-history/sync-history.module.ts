import { Module } from '@nestjs/common';
import { SyncHistoryController } from './sync-history.controller';
import { SyncHistoryService } from './sync-history.service';

@Module({
  controllers: [SyncHistoryController],
  providers: [SyncHistoryService],
})
export class SyncHistoryModule {}
