import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../infra/prisma.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { getPagination } from '../common/pagination.utils';
import { DataSourceType, DataSourceStatus } from '@prisma/client';

// TRACED:AE-DS-002
@Injectable()
export class DataSourceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDataSourceDto, tenantId: string) {
    return this.prisma.dataSource.create({
      data: {
        name: dto.name,
        type: dto.type as DataSourceType,
        connectionUrl: dto.connectionUrl,
        status: (dto.status as DataSourceStatus) ?? DataSourceStatus.DISCONNECTED,
        tenantId,
      },
      include: { widgets: true },
    });
  }

  async findAll(tenantId: string, page?: string, pageSize?: string) {
    const pagination = getPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.dataSource.findMany({
        where: { tenantId },
        include: { widgets: true },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dataSource.count({ where: { tenantId } }),
    ]);
    return { data, total, page: pagination.page, pageSize: pagination.pageSize };
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

  async update(id: string, dto: UpdateDataSourceDto, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dataSource.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.type !== undefined && { type: dto.type as DataSourceType }),
        ...(dto.connectionUrl !== undefined && { connectionUrl: dto.connectionUrl }),
        ...(dto.status !== undefined && { status: dto.status as DataSourceStatus }),
      },
      include: { widgets: true },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dataSource.delete({ where: { id } });
  }

  // TRACED:AE-DS-003
  async getDataSourceStats(tenantId: string): Promise<{ totalCount: number }> {
    const result = await this.prisma.$executeRaw(
      Prisma.sql`SELECT COUNT(*) FROM data_sources WHERE tenant_id = ${tenantId}`,
    );
    return { totalCount: Number(result) };
  }
}
