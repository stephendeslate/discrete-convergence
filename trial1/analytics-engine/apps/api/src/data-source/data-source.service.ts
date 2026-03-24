// TRACED:AE-DATA-002 — Enum usage with @@map and @map conventions
// TRACED:AE-DATA-007 — Multi-tenant entity relationships via tenantId foreign key
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { clampPagination } from '@analytics-engine/shared';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';

@Injectable()
export class DataSourceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDataSourceDto) {
    return this.prisma.dataSource.create({
      data: {
        name: dto.name,
        type: dto.type,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, page?: number, limit?: number) {
    const { page: clampedPage, limit: clampedLimit } = clampPagination(page, limit);
    const skip = (clampedPage - 1) * clampedLimit;
    const [items, total] = await Promise.all([
      this.prisma.dataSource.findMany({
        where: { tenantId },
        skip,
        take: clampedLimit,
        include: { syncRuns: { take: 5, orderBy: { startedAt: 'desc' } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dataSource.count({ where: { tenantId } }),
    ]);
    return { items, total, page: clampedPage, limit: clampedLimit };
  }

  async findOne(tenantId: string, id: string) {
    // findFirst: scope by tenantId for multi-tenant data isolation
    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id, tenantId },
      include: { syncRuns: { take: 10, orderBy: { startedAt: 'desc' } } },
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
      data: { ...dto },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.dataSource.delete({ where: { id } });
  }

  async triggerSync(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.syncRun.create({
      data: {
        status: 'RUNNING',
        startedAt: new Date(),
        dataSourceId: id,
      },
    });
  }
}
