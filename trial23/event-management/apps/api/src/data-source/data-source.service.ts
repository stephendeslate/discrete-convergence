// TRACED: EM-API-006 — DataSource CRUD with sync and history
// TRACED: EM-DATA-006 — SyncHistory tracks FAILED status
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { clampPagination } from '@repo/shared';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';

@Injectable()
export class DataSourceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organizationId: string, dto: CreateDataSourceDto) {
    return this.prisma.dataSource.create({
      data: {
        name: dto.name,
        type: dto.type,
        config: dto.config ?? null,
        status: 'ACTIVE',
        organizationId,
      },
    });
  }

  async findAll(organizationId: string, page?: number, limit?: number) {
    const pagination = clampPagination(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.dataSource.findMany({
        where: { organizationId },
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.dataSource.count({ where: { organizationId } }),
    ]);
    return { data, total, page: pagination.page, limit: pagination.limit };
  }

  async findOne(organizationId: string, id: string) {
    // findFirst: scope by organizationId for tenant isolation at application level
    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id, organizationId },
    });
    if (!dataSource) {
      throw new NotFoundException('Data source not found');
    }
    return dataSource;
  }

  async update(organizationId: string, id: string, dto: UpdateDataSourceDto) {
    const dataSource = await this.findOne(organizationId, id);
    return this.prisma.dataSource.update({
      where: { id: dataSource.id },
      data: { ...dto },
    });
  }

  async remove(organizationId: string, id: string) {
    const dataSource = await this.findOne(organizationId, id);
    return this.prisma.dataSource.delete({ where: { id: dataSource.id } });
  }

  async sync(organizationId: string, id: string) {
    const dataSource = await this.findOne(organizationId, id);
    let status = 'SUCCESS';

    try {
      await this.prisma.dataSource.update({
        where: { id: dataSource.id },
        data: { lastSyncAt: new Date() },
      });
    } catch {
      status = 'FAILED';
    }

    return this.prisma.syncHistory.create({
      data: {
        dataSourceId: dataSource.id,
        status,
        startedAt: new Date(),
        completedAt: new Date(),
        organizationId,
      },
    });
  }

  async getSyncHistory(organizationId: string, id: string, page?: number, limit?: number) {
    await this.findOne(organizationId, id);

    const pagination = clampPagination(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.syncHistory.findMany({
        where: { dataSourceId: id, organizationId },
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { startedAt: 'desc' },
      }),
      this.prisma.syncHistory.count({ where: { dataSourceId: id, organizationId } }),
    ]);
    return { data, total, page: pagination.page, limit: pagination.limit };
  }
}
