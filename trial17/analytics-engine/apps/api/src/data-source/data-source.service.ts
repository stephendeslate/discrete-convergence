import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { parsePagination } from '@analytics-engine/shared';
import { DataSourceType, Prisma } from '@prisma/client';

// TRACED: AE-API-006 — DataSourceService implements CRUD with tenant isolation
// TRACED: AE-DATA-005 — DataSources include @@index on tenantId

@Injectable()
export class DataSourceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDataSourceDto, tenantId: string) {
    return this.prisma.dataSource.create({
      data: {
        name: dto.name,
        type: dto.type as DataSourceType,
        connectionInfo: (dto.connectionInfo ?? {}) as Prisma.InputJsonValue,
        tenantId,
      },
      include: { widgets: true },
    });
  }

  async findAll(tenantId: string, query: { page?: number; pageSize?: number }) {
    const { pageSize, skip, page } = parsePagination(query);

    const [data, total] = await Promise.all([
      this.prisma.dataSource.findMany({
        where: { tenantId },
        include: { widgets: true },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dataSource.count({ where: { tenantId } }),
    ]);

    return { data, total, page, pageSize };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst justification: querying by both id and tenantId for tenant isolation
    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id, tenantId },
      include: { widgets: true },
    });

    if (!dataSource) {
      throw new NotFoundException('Data source not found');
    }

    return dataSource;
  }

  async update(id: string, dto: UpdateDataSourceDto, tenantId: string) {
    await this.findOne(id, tenantId);

    return this.prisma.dataSource.update({
      where: { id },
      data: {
        name: dto.name,
        type: dto.type as DataSourceType,
        connectionInfo: dto.connectionInfo as Prisma.InputJsonValue,
      },
      include: { widgets: true },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    await this.prisma.dataSource.delete({ where: { id } });
  }
}
