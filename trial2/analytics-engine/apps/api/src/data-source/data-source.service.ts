import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../infra/prisma.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { getPaginationParams } from '../common/pagination.utils';

// TRACED:AE-DS-001 — DataSource service with CRUD + sync + history
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
      include: { config: true, fieldMappings: true },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const { skip, take, page: currentPage, pageSize: currentPageSize } = getPaginationParams(page, pageSize);

    const [items, total] = await Promise.all([
      this.prisma.dataSource.findMany({
        where: { tenantId },
        include: { config: true, fieldMappings: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dataSource.count({ where: { tenantId } }),
    ]);

    return {
      items,
      total,
      page: currentPage,
      pageSize: currentPageSize,
      totalPages: Math.ceil(total / currentPageSize),
    };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: filtering by id + tenantId for tenant-scoped access —
    // findUnique does not support compound non-unique field conditions
    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id, tenantId },
      include: { config: true, fieldMappings: true, syncRuns: { take: 5, orderBy: { createdAt: 'desc' } } },
    });

    if (!dataSource) {
      throw new NotFoundException('Data source not found');
    }

    return dataSource;
  }

  async update(id: string, tenantId: string, dto: UpdateDataSourceDto) {
    await this.findOne(id, tenantId);

    return this.prisma.dataSource.update({
      where: { id },
      data: { name: dto.name },
      include: { config: true, fieldMappings: true },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dataSource.delete({ where: { id } });
  }

  // TRACED:AE-DS-002 — $executeRaw with Prisma.sql for safe parameterized queries
  async sync(id: string, tenantId: string) {
    const dataSource = await this.findOne(id, tenantId);

    // Create a sync run record
    const syncRun = await this.prisma.syncRun.create({
      data: {
        status: 'RUNNING',
        startedAt: new Date(),
        dataSourceId: dataSource.id,
      },
    });

    // Use $executeRaw with Prisma.sql for safe parameterized query
    // This updates the sync run status using raw SQL for demonstration
    await this.prisma.$executeRaw(
      Prisma.sql`UPDATE sync_runs SET status = 'completed', completed_at = NOW(), rows_ingested = 0 WHERE id = ${syncRun.id}`,
    );

    return this.prisma.syncRun.findUnique({ where: { id: syncRun.id } });
  }

  async syncHistory(id: string, tenantId: string, page?: number, pageSize?: number) {
    await this.findOne(id, tenantId);

    const { skip, take, page: currentPage, pageSize: currentPageSize } = getPaginationParams(page, pageSize);

    const [items, total] = await Promise.all([
      this.prisma.syncRun.findMany({
        where: { dataSourceId: id },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.syncRun.count({ where: { dataSourceId: id } }),
    ]);

    return {
      items,
      total,
      page: currentPage,
      pageSize: currentPageSize,
      totalPages: Math.ceil(total / currentPageSize),
    };
  }
}
