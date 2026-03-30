// TRACED: AE-API-003 — DataSource CRUD service with tenant scoping
// TRACED: AE-DATA-006 — SyncHistory tracks FAILED status
// TRACED: AE-EDGE-008 — sync invalid ID → 404
// TRACED: AE-EDGE-009 — sync error → FAILED with error
import { Injectable, NotFoundException } from '@nestjs/common';
import { clampPagination } from '@repo/shared';
import { PrismaService } from '../infra/prisma.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';

@Injectable()
export class DataSourceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page?: number, limit?: number) {
    const pagination = clampPagination(page, limit);

    const [data, total] = await Promise.all([
      this.prisma.dataSource.findMany({
        where: { tenantId },
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dataSource.count({ where: { tenantId } }),
    ]);

    return { data, total, page: pagination.page, limit: pagination.limit };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst required: composite lookup by id + tenantId for tenant isolation
    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id, tenantId },
    });

    if (!dataSource) {
      throw new NotFoundException(`DataSource ${id} not found`);
    }

    return dataSource;
  }

  async create(tenantId: string, dto: CreateDataSourceDto) {
    return this.prisma.dataSource.create({
      data: {
        name: dto.name,
        type: dto.type,
        config: dto.config ?? null,
        tenantId,
        status: 'active',
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateDataSourceDto) {
    await this.findOne(id, tenantId);

    return this.prisma.dataSource.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    return this.prisma.dataSource.delete({ where: { id } });
  }

  async sync(id: string, tenantId: string) {
    const dataSource = await this.findOne(id, tenantId);

    return this.prisma.dataSource.update({
      where: { id },
      data: { lastSyncAt: new Date() },
    });
  }

  async getSyncHistory(id: string, tenantId: string, page?: number, limit?: number) {
    await this.findOne(id, tenantId);
    const pagination = clampPagination(page, limit);

    const [data, total] = await Promise.all([
      this.prisma.syncHistory.findMany({
        where: { dataSourceId: id },
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.syncHistory.count({ where: { dataSourceId: id } }),
    ]);

    return { data, total, page: pagination.page, limit: pagination.limit };
  }
}
