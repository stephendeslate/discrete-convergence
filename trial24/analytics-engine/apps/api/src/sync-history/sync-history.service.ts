// TRACED:SYNC-SERVICE — Business logic for sync history tracking
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.module';
import { clampPagination, PaginatedResult } from '@repo/shared';
import { SyncHistory } from '@prisma/client';
import { buildPaginatedResult } from '../common/pagination.utils';

@Injectable()
export class SyncHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findByDataSource(
    dataSourceId: string,
    tenantId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<SyncHistory>> {
    const params = clampPagination(page, limit);
    const skip = (params.page - 1) * params.limit;

    const where = { dataSourceId, tenantId };
    const [data, total] = await Promise.all([
      this.prisma.syncHistory.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: { startedAt: 'desc' },
      }),
      this.prisma.syncHistory.count({ where }),
    ]);

    return buildPaginatedResult(data, total, page, limit);
  }

  async findOne(id: string, tenantId: string): Promise<SyncHistory> {
    // tenant-scoped query
    const record = await this.prisma.syncHistory.findFirst({
      where: { id, tenantId },
    });
    if (!record) {
      throw new NotFoundException(`SyncHistory ${id} not found`);
    }
    return record;
  }

  async triggerSync(dataSourceId: string, tenantId: string): Promise<SyncHistory> {
    return this.prisma.syncHistory.create({
      data: {
        dataSourceId,
        tenantId,
        status: 'PENDING',
      },
    });
  }
}
