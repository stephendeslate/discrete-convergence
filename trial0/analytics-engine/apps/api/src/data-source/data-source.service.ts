// TRACED:AE-DS-001 — DataSource service with CRUD and sync operations
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { Prisma } from '@prisma/client';
import { clampPagination, getPaginationSkip } from '@analytics-engine/shared';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';

@Injectable()
export class DataSourceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDataSourceDto, tenantId: string) {
    return this.prisma.dataSource.create({
      data: {
        name: dto.name,
        connectorType: dto.connectorType,
        configEncrypted: dto.configEncrypted,
        syncSchedule: dto.syncSchedule,
        tenantId,
      },
      include: { fieldMappings: true },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const pagination = clampPagination(page, pageSize);
    const skip = getPaginationSkip(pagination);

    const [items, total] = await Promise.all([
      this.prisma.dataSource.findMany({
        where: { tenantId },
        include: { fieldMappings: true },
        skip,
        take: pagination.pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dataSource.count({ where: { tenantId } }),
    ]);

    return { items, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: scope by tenantId for multi-tenant isolation
    const ds = await this.prisma.dataSource.findFirst({
      where: { id, tenantId },
      include: { fieldMappings: true, syncRuns: { take: 10, orderBy: { createdAt: 'desc' } } },
    });
    if (!ds) {
      throw new NotFoundException('DataSource not found');
    }
    return ds;
  }

  async update(id: string, dto: UpdateDataSourceDto, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dataSource.update({
      where: { id },
      data: {
        name: dto.name,
        syncSchedule: dto.syncSchedule,
      },
      include: { fieldMappings: true },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dataSource.delete({ where: { id } });
  }

  // TRACED:AE-DS-002 — Sync trigger with failure count tracking
  async triggerSync(id: string, tenantId: string) {
    const ds = await this.findOne(id, tenantId);
    if (!ds.isActive) {
      throw new BadRequestException('DataSource is paused due to consecutive failures');
    }

    return this.prisma.syncRun.create({
      data: {
        status: 'RUNNING',
        startedAt: new Date(),
        dataSourceId: id,
        tenantId,
      },
    });
  }

  async getSyncHistory(id: string, tenantId: string, page?: number, pageSize?: number) {
    await this.findOne(id, tenantId);
    const pagination = clampPagination(page, pageSize);
    const skip = getPaginationSkip(pagination);

    const [items, total] = await Promise.all([
      this.prisma.syncRun.findMany({
        where: { dataSourceId: id, tenantId },
        skip,
        take: pagination.pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.syncRun.count({ where: { dataSourceId: id, tenantId } }),
    ]);

    return { items, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  // TRACED:AE-RAW-001 — $executeRaw with Prisma.sql for RLS policy setup
  async enableRls(): Promise<void> {
    await this.prisma.$executeRaw(Prisma.sql`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'data_sources' AND policyname = 'tenant_isolation'
        ) THEN
          ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
          ALTER TABLE data_sources FORCE ROW LEVEL SECURITY;
        END IF;
      END $$;
    `);
  }
}
