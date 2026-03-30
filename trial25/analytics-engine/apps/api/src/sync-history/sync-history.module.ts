// TRACED:SYNC-MOD — Sync history module
import { Module } from '@nestjs/common';
import { SyncHistoryController } from './sync-history.controller';
import { SyncHistoryService } from './sync-history.service';

/**
 * TRACED:AE-SH-MOD-001 — Sync history module
 */
@Module({
  controllers: [SyncHistoryController],
  providers: [SyncHistoryService],
  exports: [SyncHistoryService],
})
export class SyncHistoryModule {}
