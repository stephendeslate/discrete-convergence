import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { parsePagination } from '@analytics-engine/shared';
import { DataSourceType } from '@prisma/client';

// TRACED: AE-API-004
@Injectable()
export class DataSourceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: { page?: number; limit?: number }) {
    const { skip, limit } = parsePagination(query);
    const [data, total] = await Promise.all([
      this.prisma.dataSource.findMany({
        where: { tenantId },
        include: { widgets: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dataSource.count({ where: { tenantId } }),
    ]);
    return { data, total, page: query.page ?? 1, limit };
  }

  async findOne(id: string, tenantId: string) {
    const dataSource = await this.prisma.dataSource.findUnique({
      where: { id },
      include: { widgets: true },
    });

    if (!dataSource || dataSource.tenantId !== tenantId) {
      throw new NotFoundException('Data source not found');
    }

    return dataSource;
  }

  async create(tenantId: string, dto: CreateDataSourceDto) {
    return this.prisma.dataSource.create({
      data: {
        name: dto.name,
        type: dto.type as DataSourceType,
        connectionString: dto.connectionString,
        config: dto.config,
        tenantId,
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateDataSourceDto) {
    await this.findOne(id, tenantId);
    return this.prisma.dataSource.update({
      where: { id },
      data: {
        name: dto.name,
        type: dto.type as DataSourceType,
        connectionString: dto.connectionString,
        config: dto.config,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dataSource.delete({ where: { id } });
  }
}
