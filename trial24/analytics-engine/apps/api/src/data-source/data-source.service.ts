// TRACED:DATASOURCE-SERVICE — Business logic for data source CRUD
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.module';
import { CreateDataSourceDto, UpdateDataSourceDto } from './data-source.dto';
import { clampPagination, PaginatedResult } from '@repo/shared';
import { DataSource } from '@prisma/client';
import { buildPaginatedResult } from '../common/pagination.utils';

@Injectable()
export class DataSourceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDataSourceDto, tenantId: string): Promise<DataSource> {
    return this.prisma.dataSource.create({
      data: {
        name: dto.name,
        type: dto.type,
        connectionString: dto.connectionString,
        tenantId,
      },
    });
  }

  async findAll(
    tenantId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<DataSource>> {
    const params = clampPagination(page, limit);
    const skip = (params.page - 1) * params.limit;

    const where = { tenantId };
    const [data, total] = await Promise.all([
      this.prisma.dataSource.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dataSource.count({ where }),
    ]);

    return buildPaginatedResult(data, total, page, limit);
  }

  async findOne(id: string, tenantId: string): Promise<DataSource> {
    // tenant-scoped query
    const ds = await this.prisma.dataSource.findFirst({
      where: { id, tenantId },
    });
    if (!ds) {
      throw new NotFoundException(`DataSource ${id} not found`);
    }
    return ds;
  }

  async update(id: string, dto: UpdateDataSourceDto, tenantId: string): Promise<DataSource> {
    await this.findOne(id, tenantId);
    return this.prisma.dataSource.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.connectionString !== undefined && { connectionString: dto.connectionString }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async remove(id: string, tenantId: string): Promise<DataSource> {
    await this.findOne(id, tenantId);
    return this.prisma.dataSource.delete({ where: { id } });
  }
}
