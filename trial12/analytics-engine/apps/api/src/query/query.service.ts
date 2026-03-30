import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateQueryDto } from './dto/create-query.dto';
import { getPaginationParams } from '../common/pagination.utils';

// TRACED: AE-QUERY-002
@Injectable()
export class QueryService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateQueryDto, tenantId: string) {
    return this.prisma.queryExecution.create({
      data: {
        query: dto.query,
        dataSourceId: dto.dataSourceId,
        tenantId,
        executionTime: dto.executionTime ?? 0,
        rowCount: dto.rowCount ?? 0,
      },
    });
  }

  async findAll(tenantId: string, page?: number, limit?: number) {
    const { skip, take } = getPaginationParams(page, limit);
    const [items, total] = await Promise.all([
      this.prisma.queryExecution.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.queryExecution.count({ where: { tenantId } }),
    ]);
    return { items, total, page: page ?? 1, pageSize: take };
  }

  async findOne(id: string, tenantId: string) {
    const query = await this.prisma.queryExecution.findUnique({
      where: { id },
    });
    if (!query || query.tenantId !== tenantId) {
      throw new NotFoundException('Query execution not found');
    }
    return query;
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.queryExecution.delete({ where: { id } });
  }
}
