import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { clampPagination, paginationToSkipTake } from '@analytics-engine/shared';
import { DataSourceType, Prisma } from '@prisma/client';

// TRACED: AE-DS-002
@Injectable()
export class DataSourceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page?: number, limit?: number) {
    const params = clampPagination(page, limit);
    const { skip, take } = paginationToSkipTake(params);

    const [data, total] = await Promise.all([
      this.prisma.dataSource.findMany({
        where: { tenantId },
        include: { widgets: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dataSource.count({ where: { tenantId } }),
    ]);

    return { data, total, page: params.page, limit: params.limit };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: tenant-scoped lookup by ID — ensures tenant isolation on single-record fetch
    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id, tenantId },
      include: { widgets: true },
    });

    if (!dataSource) {
      throw new NotFoundException('Data source not found');
    }

    return dataSource;
  }

  async create(dto: CreateDataSourceDto, tenantId: string, userId: string) {
    return this.prisma.dataSource.create({
      data: {
        name: dto.name,
        type: dto.type as DataSourceType,
        connectionString: dto.connectionString,
        tenantId,
        userId,
      },
    });
  }

  async update(id: string, dto: UpdateDataSourceDto, tenantId: string) {
    await this.findOne(id, tenantId);

    const data: Prisma.DataSourceUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.type !== undefined) data.type = dto.type as DataSourceType;
    if (dto.connectionString !== undefined) data.connectionString = dto.connectionString;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    return this.prisma.dataSource.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dataSource.delete({ where: { id } });
  }
}
