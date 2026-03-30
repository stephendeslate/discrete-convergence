import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { DataSourceType } from '@prisma/client';
import { parsePagination } from '../common/pagination.utils';

// TRACED: AE-DS-001
@Injectable()
export class DataSourceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDataSourceDto) {
    return this.prisma.dataSource.create({
      data: {
        name: dto.name,
        type: dto.type as DataSourceType,
        connectionUrl: dto.connectionUrl,
        tenantId,
        isActive: dto.isActive ?? true,
      },
      include: { widgets: true },
    });
  }

  async findAll(tenantId: string, page?: string, pageSize?: string) {
    const pagination = parsePagination(page, pageSize);
    const [items, total] = await Promise.all([
      this.prisma.dataSource.findMany({
        where: { tenantId },
        include: { widgets: true },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dataSource.count({ where: { tenantId } }),
    ]);
    return { items, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async findOne(tenantId: string, id: string) {
    const dataSource = await this.prisma.dataSource.findUnique({
      where: { id },
      include: { widgets: true },
    });

    if (!dataSource || dataSource.tenantId !== tenantId) {
      throw new NotFoundException('Data source not found');
    }

    return dataSource;
  }

  async update(tenantId: string, id: string, dto: UpdateDataSourceDto) {
    await this.findOne(tenantId, id);

    return this.prisma.dataSource.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.type !== undefined && { type: dto.type as DataSourceType }),
        ...(dto.connectionUrl !== undefined && { connectionUrl: dto.connectionUrl }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      include: { widgets: true },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.dataSource.delete({ where: { id } });
  }
}
