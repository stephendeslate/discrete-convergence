// TRACED:AE-DS-001 — data source service with tier-based limits
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import {
  clampPagination,
  DATA_SOURCE_LIMITS,
  SYNC_SCHEDULE_BY_TIER,
  MAX_SYNC_FAILURES,
} from '@analytics-engine/shared';

@Injectable()
export class DataSourceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    tenantId: string,
    name: string,
    type: string,
    configEncrypted: string,
    schedule?: string,
  ) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const currentCount = await this.prisma.dataSource.count({
      where: { tenantId },
    });

    const limit = DATA_SOURCE_LIMITS[tenant.tier] ?? 0;
    if (currentCount >= limit) {
      throw new BadRequestException(
        `Tenant tier ${tenant.tier} allows maximum of ${limit} data sources`,
      );
    }

    const effectiveSchedule = schedule ?? 'MANUAL';
    const allowedSchedules = SYNC_SCHEDULE_BY_TIER[tenant.tier] ?? ['MANUAL'];
    if (!allowedSchedules.includes(effectiveSchedule)) {
      throw new BadRequestException(
        `Schedule ${effectiveSchedule} is not available for tier ${tenant.tier}`,
      );
    }

    return this.prisma.dataSource.create({
      data: {
        name,
        type: type as 'REST_API' | 'POSTGRESQL' | 'CSV' | 'WEBHOOK',
        configEncrypted,
        schedule: effectiveSchedule as 'MANUAL' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'REALTIME',
        tenantId,
      },
      include: { fieldMappings: true },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const pagination = clampPagination(page, pageSize);
    const [items, total] = await Promise.all([
      this.prisma.dataSource.findMany({
        where: { tenantId },
        include: { fieldMappings: true },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dataSource.count({ where: { tenantId } }),
    ]);

    return { items, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async findOne(id: string, tenantId: string) {
    const dataSource = await this.prisma.dataSource.findUnique({
      where: { id },
      include: { fieldMappings: true },
    });

    if (!dataSource || dataSource.tenantId !== tenantId) {
      throw new NotFoundException('Data source not found');
    }

    return dataSource;
  }

  async update(id: string, tenantId: string, name?: string, schedule?: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dataSource.update({
      where: { id },
      data: { name, schedule: schedule as 'MANUAL' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'REALTIME' | undefined },
      include: { fieldMappings: true },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dataSource.delete({ where: { id } });
  }

  async triggerSync(id: string, tenantId: string) {
    const dataSource = await this.findOne(id, tenantId);

    if (dataSource.paused) {
      throw new BadRequestException('Data source is paused due to consecutive failures');
    }

    return this.prisma.syncRun.create({
      data: {
        status: 'RUNNING',
        dataSourceId: id,
      },
    });
  }

  async getSyncHistory(id: string, tenantId: string, page?: number, pageSize?: number) {
    await this.findOne(id, tenantId);
    const pagination = clampPagination(page, pageSize);
    const [items, total] = await Promise.all([
      this.prisma.syncRun.findMany({
        where: { dataSourceId: id },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.syncRun.count({ where: { dataSourceId: id } }),
    ]);

    return { items, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async recordSyncFailure(dataSourceId: string): Promise<void> {
    const dataSource = await this.prisma.dataSource.findUnique({
      where: { id: dataSourceId },
    });
    if (!dataSource) return;

    const newFailureCount = dataSource.consecutiveFailures + 1;
    await this.prisma.dataSource.update({
      where: { id: dataSourceId },
      data: {
        consecutiveFailures: newFailureCount,
        paused: newFailureCount >= MAX_SYNC_FAILURES,
      },
    });
  }
}
