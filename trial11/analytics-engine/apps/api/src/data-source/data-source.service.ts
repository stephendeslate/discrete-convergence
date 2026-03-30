import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { parsePagination } from '@analytics-engine/shared';
import { DataSourceStatus } from '@prisma/client';

// TRACED: AE-DS-002
@Injectable()
export class DataSourceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDataSourceDto, tenantId: string) {
    return this.prisma.dataSource.create({
      data: {
        name: dto.name,
        type: dto.type,
        config: dto.config,
        refreshRate: dto.refreshRate ?? 300,
        tenantId,
      },
    });
  }

  // TRACED: AE-DS-003
  async findAll(tenantId: string, page?: string, pageSize?: string) {
    const pagination = parsePagination(page, pageSize);
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
    // findFirst used because we scope by both id and tenantId for tenant isolation
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
        type: dto.type,
        config: dto.config,
        status: dto.status as DataSourceStatus | undefined,
        refreshRate: dto.refreshRate,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dataSource.delete({ where: { id } });
  }
}
