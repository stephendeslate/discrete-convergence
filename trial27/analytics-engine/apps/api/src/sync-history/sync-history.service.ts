import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import {
  parsePagination,
  paginatedResponse,
  PaginatedResponse,
} from '../common/pagination.utils';
import { SyncRun } from '@prisma/client';

// TRACED: AE-API-007 — Sync history

@Injectable()
export class SyncHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findByDataSource(
    tenantId: string,
    dataSourceId: string,
    page?: number,
    pageSize?: number,
  ): Promise<PaginatedResponse<SyncRun>> {
    // findFirst used here: verifying data source belongs to tenant
    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id: dataSourceId, tenantId },
    });

    if (!dataSource) {
      throw new NotFoundException('Data source not found');
    }

    const pagination = parsePagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.syncRun.findMany({
        where: { dataSourceId },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.syncRun.count({ where: { dataSourceId } }),
    ]);

    return paginatedResponse(data, total, pagination);
  }
}
