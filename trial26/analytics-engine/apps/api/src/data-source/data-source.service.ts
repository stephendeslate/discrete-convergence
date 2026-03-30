import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { clampPagination } from '../common/pagination.utils';
import { SYNC_FAILURE_THRESHOLD } from '@analytics-engine/shared';

// TRACED: AE-DS-001 — Create data source
// TRACED: AE-DS-002 — List data sources with pagination
// TRACED: AE-DS-003 — Get single data source
// TRACED: AE-DS-004 — Update data source
// TRACED: AE-DS-005 — Delete data source
// TRACED: AE-DS-006 — Test connection
// TRACED: AE-DS-007 — Sync data source
// TRACED: AE-EDGE-004 — Duplicate data source name
// TRACED: AE-EDGE-005 — Sync on paused data source

@Injectable()
export class DataSourceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDataSourceDto) {
    // findFirst: Check for duplicate name within tenant
    const existing = await this.prisma.dataSource.findFirst({
      where: { tenantId, name: dto.name },
    });

    if (existing) {
      throw new ConflictException('Data source with this name already exists');
    }

    return this.prisma.dataSource.create({
      data: {
        name: dto.name,
        type: dto.type,
        connectionConfig: dto.connectionConfig,
        syncSchedule: dto.syncSchedule,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, page?: number, limit?: number) {
    const { skip, take, page: p, limit: l } = clampPagination(page, limit);

    const [data, total] = await Promise.all([
      this.prisma.dataSource.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dataSource.count({ where: { tenantId } }),
    ]);

    return { data, total, page: p, limit: l, totalPages: Math.ceil(total / l) };
  }

  async findOne(tenantId: string, id: string) {
    // findFirst: Scoped by tenantId for RLS compliance
    const ds = await this.prisma.dataSource.findFirst({
      where: { id, tenantId },
    });

    if (!ds) {
      throw new NotFoundException('Data source not found');
    }

    return ds;
  }

  async update(tenantId: string, id: string, dto: UpdateDataSourceDto) {
    await this.findOne(tenantId, id);

    return this.prisma.dataSource.update({
      where: { id },
      data: {
        name: dto.name,
        connectionConfig: dto.connectionConfig,
        syncSchedule: dto.syncSchedule,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.dataSource.delete({ where: { id } });
  }

  async testConnection(tenantId: string, id: string) {
    const ds = await this.findOne(tenantId, id);

    if (ds.status === 'ERROR') {
      throw new BadRequestException('Data source is in error state. Reset before testing.');
    }

    // Simulate connection test based on type
    if (ds.type === 'REST_API') {
      return { success: true, latencyMs: 120, message: 'REST API connection successful' };
    } else if (ds.type === 'POSTGRESQL') {
      return { success: true, latencyMs: 45, message: 'Database connection successful' };
    } else if (ds.type === 'CSV') {
      return { success: true, latencyMs: 10, message: 'CSV source ready' };
    }

    return { success: true, latencyMs: 5, message: 'Webhook endpoint active' };
  }

  async sync(tenantId: string, id: string) {
    const ds = await this.findOne(tenantId, id);

    if (ds.status === 'PAUSED') {
      throw new BadRequestException('Cannot sync a paused data source');
    }

    if (ds.failureCount >= SYNC_FAILURE_THRESHOLD) {
      throw new BadRequestException('Data source has exceeded failure threshold. Resume manually.');
    }

    const syncRun = await this.prisma.syncHistory.create({
      data: {
        dataSourceId: id,
        status: 'RUNNING',
      },
    });

    // Simulate successful sync
    const completed = await this.prisma.syncHistory.update({
      where: { id: syncRun.id },
      data: {
        status: 'COMPLETED',
        recordsProcessed: Math.floor(Math.random() * 500) + 50,
        completedAt: new Date(),
      },
    });

    await this.prisma.dataSource.update({
      where: { id },
      data: { lastSyncAt: new Date(), failureCount: 0 },
    });

    return completed;
  }
}
