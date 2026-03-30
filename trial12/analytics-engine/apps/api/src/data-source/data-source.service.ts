import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { DataSourceType, DataSourceStatus, Prisma } from '@prisma/client';
import { getPaginationParams } from '../common/pagination.utils';

// TRACED: AE-DS-002
@Injectable()
export class DataSourceService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDataSourceDto, tenantId: string) {
    return this.prisma.dataSource.create({
      data: {
        name: dto.name,
        type: dto.type as DataSourceType,
        connectionString: dto.connectionString,
        tenantId,
      },
      include: { widgets: true },
    });
  }

  async findAll(tenantId: string, page?: number, limit?: number) {
    const { skip, take } = getPaginationParams(page, limit);
    const [items, total] = await Promise.all([
      this.prisma.dataSource.findMany({
        where: { tenantId },
        include: { widgets: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dataSource.count({ where: { tenantId } }),
    ]);
    return { items, total, page: page ?? 1, pageSize: take };
  }

  async findOne(id: string, tenantId: string) {
    const ds = await this.prisma.dataSource.findUnique({
      where: { id },
      include: { widgets: true },
    });
    if (!ds || ds.tenantId !== tenantId) {
      throw new NotFoundException('Data source not found');
    }
    return ds;
  }

  async update(id: string, dto: UpdateDataSourceDto, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dataSource.update({
      where: { id },
      data: {
        name: dto.name,
        type: dto.type as DataSourceType | undefined,
        connectionString: dto.connectionString,
        status: dto.status as DataSourceStatus | undefined,
      },
      include: { widgets: true },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dataSource.delete({ where: { id } });
  }

  // TRACED: AE-DS-003
  async getConnectionStats(tenantId: string) {
    const result = await this.prisma.$executeRaw(Prisma.sql`
      SELECT COUNT(*) as total
      FROM "data_sources"
      WHERE "tenantId" = ${tenantId} AND "status" = 'active'
    `);
    return { activeConnections: result };
  }
}
