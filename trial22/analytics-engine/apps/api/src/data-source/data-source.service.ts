import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { parsePagination } from '@repo/shared';

// TRACED: AE-DS-001
@Injectable()
export class DataSourceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page?: number, limit?: number) {
    const { skip, limit: take } = parsePagination(page, limit);
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
    return { data, total, page: page ?? 1, limit: take };
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

  async create(dto: CreateDataSourceDto, tenantId: string) {
    return this.prisma.dataSource.create({
      data: {
        name: dto.name,
        type: dto.type,
        connectionString: dto.connectionString,
        tenantId,
      },
    });
  }

  async update(id: string, dto: UpdateDataSourceDto, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dataSource.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.connectionString !== undefined && {
          connectionString: dto.connectionString,
        }),
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dataSource.delete({ where: { id } });
  }
}
