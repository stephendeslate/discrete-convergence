import { Injectable, NotFoundException } from '@nestjs/common';
import { DashboardStatus } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { parsePagination } from '@analytics-engine/shared';

// TRACED: AE-API-002
// TRACED: AE-DATA-003
// TRACED: AE-PERF-003
@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDashboardDto, tenantId: string) {
    return this.prisma.dashboard.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: (dto.status ?? 'DRAFT') as DashboardStatus,
        tenantId,
      },
      include: { widgets: true },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const pagination = parsePagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.dashboard.findMany({
        where: { tenantId },
        include: { widgets: true },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dashboard.count({ where: { tenantId } }),
    ]);

    return { data, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async findOne(id: string, tenantId: string) {
    const dashboard = await this.prisma.dashboard.findUnique({
      where: { id },
      include: { widgets: true },
    });

    if (!dashboard || dashboard.tenantId !== tenantId) {
      throw new NotFoundException('Dashboard not found');
    }

    return dashboard;
  }

  async update(id: string, dto: UpdateDashboardDto, tenantId: string) {
    await this.findOne(id, tenantId);

    return this.prisma.dashboard.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status as DashboardStatus | undefined,
      },
      include: { widgets: true },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dashboard.delete({ where: { id } });
  }
}
