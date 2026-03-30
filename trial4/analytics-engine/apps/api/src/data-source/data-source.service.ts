import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { clampPagination, buildPaginatedResponse } from '../common/pagination.utils';

// TRACED:AE-API-004 — data source CRUD with sync history
@Injectable()
export class DataSourceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDataSourceDto) {
    return this.prisma.dataSource.create({
      data: {
        name: dto.name,
        type: dto.type,
        configEncrypted: dto.configEncrypted,
        scheduleMinutes: dto.scheduleMinutes,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const params = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.dataSource.findMany({
        where: { tenantId },
        include: { syncRuns: { take: 5, orderBy: { startedAt: 'desc' } } },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dataSource.count({ where: { tenantId } }),
    ]);
    return buildPaginatedResponse(data, total, page, pageSize);
  }

  async findOne(tenantId: string, id: string) {
    // findFirst: scope by tenantId for RLS enforcement
    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id, tenantId },
      include: { fieldMappings: true, syncRuns: { take: 10, orderBy: { startedAt: 'desc' } } },
    });
    if (!dataSource) {
      throw new NotFoundException('Data source not found');
    }
    return dataSource;
  }

  async update(tenantId: string, id: string, dto: UpdateDataSourceDto) {
    await this.findOne(tenantId, id);
    return this.prisma.dataSource.update({
      where: { id },
      data: dto,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.dataSource.delete({ where: { id } });
  }

  // TRACED:AE-DAT-006 — $executeRaw with Prisma.sql for RLS context
  async setTenantContext(tenantId: string) {
    await this.prisma.$executeRaw(
      Prisma.sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`,
    );
  }

  async getSyncHistory(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.syncRun.findMany({
      where: { dataSourceId: id },
      orderBy: { startedAt: 'desc' },
      take: 50,
    });
  }
}
