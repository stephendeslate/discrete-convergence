// TRACED:AE-DS-001 — DataSource CRUD with tenant isolation and paginated listing
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { paginatedQuery } from '../common/paginated-query';
import type { PaginatedResult } from '../common/paginated-query';
import { Prisma } from '@prisma/client';
import type { DataSource, DataSourceType } from '@prisma/client';
import type { CreateDataSourceDto } from './dto/create-data-source.dto';
import type { UpdateDataSourceDto } from './dto/update-data-source.dto';

@Injectable()
export class DataSourceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDataSourceDto): Promise<DataSource> {
    return this.prisma.dataSource.create({
      data: {
        name: dto.name,
        type: dto.type as DataSourceType,
        config: (dto.config ?? {}) as Prisma.InputJsonValue,
        tenantId,
      },
    });
  }

  async findAll(
    tenantId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<DataSource>> {
    return paginatedQuery<DataSource>(
      this.prisma.dataSource,
      { tenantId },
      page,
      limit,
    );
  }

  async findOne(tenantId: string, id: string): Promise<DataSource> {
    const dataSource = await this.prisma.dataSource.findUnique({
      where: { id },
      include: { syncRuns: { take: 10, orderBy: { createdAt: 'desc' } } },
    });

    if (!dataSource || dataSource.tenantId !== tenantId) {
      throw new NotFoundException(`DataSource ${id} not found`);
    }

    return dataSource;
  }

  async update(tenantId: string, id: string, dto: UpdateDataSourceDto): Promise<DataSource> {
    await this.findOne(tenantId, id);

    return this.prisma.dataSource.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.type !== undefined && { type: dto.type as DataSourceType }),
        ...(dto.config !== undefined && { config: dto.config as Prisma.InputJsonValue }),
      },
    });
  }

  async remove(tenantId: string, id: string): Promise<DataSource> {
    await this.findOne(tenantId, id);
    return this.prisma.dataSource.delete({ where: { id } });
  }
}
