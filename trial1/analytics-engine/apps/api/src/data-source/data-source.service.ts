// TRACED:AE-DATA-002 — Enum usage with @@map and @map conventions
// TRACED:AE-DATA-007 — Multi-tenant entity relationships via tenantId foreign key
import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSourceType } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { paginatedQuery } from '../common/paginated-query';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';

@Injectable()
export class DataSourceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDataSourceDto) {
    return this.prisma.dataSource.create({
      data: {
        name: dto.name,
        type: dto.type as DataSourceType,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, page?: number, limit?: number) {
    return paginatedQuery(
      this.prisma.dataSource, { tenantId }, page, limit,
      { include: { syncRuns: { take: 5, orderBy: { startedAt: 'desc' } } } },
    );
  }

  async findOne(tenantId: string, id: string) {
    const dataSource = await this.prisma.dataSource.findFirst({ // findFirst: scope by tenantId for multi-tenant data isolation
      where: { id, tenantId },
      include: { syncRuns: { take: 10, orderBy: { startedAt: 'desc' } } },
    });
    if (!dataSource) {
      throw new NotFoundException('Data source not found');
    }
    return dataSource;
  }

  async update(tenantId: string, id: string, dto: UpdateDataSourceDto) {
    const dataSource = await this.findOne(tenantId, id);
    return this.prisma.dataSource.update({ where: { id: dataSource.id }, data: { ...dto } });
  }

  async remove(tenantId: string, id: string) {
    const dataSource = await this.findOne(tenantId, id);
    return this.prisma.dataSource.delete({ where: { id: dataSource.id } });
  }

  async triggerSync(tenantId: string, id: string) {
    const source = await this.findOne(tenantId, id);
    return this.prisma.syncRun.create({
      data: {
        status: 'RUNNING',
        startedAt: new Date(),
        dataSourceId: source.id,
      },
    });
  }
}
