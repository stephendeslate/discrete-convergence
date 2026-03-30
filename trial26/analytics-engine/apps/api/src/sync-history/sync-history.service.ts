import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { clampPagination } from '../common/pagination.utils';

// TRACED: AE-SYNC-001 — List sync history for data source
// TRACED: AE-SYNC-002 — Get single sync run

@Injectable()
export class SyncHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForDataSource(tenantId: string, dataSourceId: string, page?: number, limit?: number) {
    // findFirst: Verify data source belongs to tenant
    const ds = await this.prisma.dataSource.findFirst({
      where: { id: dataSourceId, tenantId },
    });

    if (!ds) {
      throw new NotFoundException('Data source not found');
    }

    const { skip, take, page: p, limit: l } = clampPagination(page, limit);

    const [data, total] = await Promise.all([
      this.prisma.syncHistory.findMany({
        where: { dataSourceId },
        skip,
        take,
        orderBy: { startedAt: 'desc' },
      }),
      this.prisma.syncHistory.count({ where: { dataSourceId } }),
    ]);

    return { data, total, page: p, limit: l, totalPages: Math.ceil(total / l) };
  }

  async findOne(tenantId: string, id: string) {
    // findFirst: Get sync run by ID, includes data source for context
    const syncRun = await this.prisma.syncHistory.findFirst({
      where: { id },
      include: { dataSource: true },
    });

    if (!syncRun) {
      throw new NotFoundException('Sync run not found');
    }

    if (syncRun.dataSource.tenantId !== tenantId) {
      throw new NotFoundException('Sync run not found');
    }

    return syncRun;
  }
}
