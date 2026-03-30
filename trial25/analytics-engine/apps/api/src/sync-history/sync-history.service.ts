// TRACED:SYNC-SVC — Sync history service
// TRACED:SYNC-READONLY — sync history is read-only: findAll, findOne only (VERIFY:SYNC-READONLY)
// TRACED:SYNC-TENANT-SCOPE — all queries filtered by tenantId (VERIFY:SYNC-TENANT-SCOPE)
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { getPrismaSkipTake, paginateResponse } from '../common/pagination.utils';
import { PaginatedResult } from '@repo/shared';
import { SyncHistory } from '@prisma/client';

/**
 * Sync history service for viewing sync operation records.
 * TRACED:AE-SH-001 — Sync history service
 */
@Injectable()
export class SyncHistoryService {
  private readonly logger = new Logger(SyncHistoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * TRACED:AE-SH-002 — Sync history list with pagination
   */
  async findAll(
    tenantId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<SyncHistory>> {
    const { skip, take } = getPrismaSkipTake(page, limit);

    const [data, total] = await Promise.all([
      this.prisma.syncHistory.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { startedAt: 'desc' },
        include: { dataSource: true },
      }),
      this.prisma.syncHistory.count({ where: { tenantId } }),
    ]);

    return paginateResponse(data, total, page, limit);
  }

  /**
   * TRACED:AE-SH-003 — Sync history get with not-found branching
   */
  async findOne(id: string, tenantId: string): Promise<SyncHistory> {
    // findFirst justified: fetching by ID with tenant isolation
    const syncHistory = await this.prisma.syncHistory.findFirst({
      where: { id, tenantId },
      include: { dataSource: true },
    });

    if (!syncHistory) {
      throw new NotFoundException(`Sync history with ID ${id} not found`);
    }

    return syncHistory;
  }
}
