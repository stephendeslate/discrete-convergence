import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { clampPagination, buildPaginatedResponse } from '../common/pagination.utils';

// TRACED:AE-API-002 — dashboard CRUD with tenant scoping
@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDashboardDto) {
    return this.prisma.dashboard.create({
      data: {
        title: dto.title,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const params = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.dashboard.findMany({
        where: { tenantId },
        include: { widgets: true },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dashboard.count({ where: { tenantId } }),
    ]);
    return buildPaginatedResponse(data, total, page, pageSize);
  }

  async findOne(tenantId: string, id: string) {
    // findFirst: scope by tenantId for RLS enforcement
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id, tenantId },
      include: { widgets: true, embedConfig: true },
    });
    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }
    return dashboard;
  }

  async update(tenantId: string, id: string, dto: UpdateDashboardDto) {
    await this.findOne(tenantId, id);
    return this.prisma.dashboard.update({
      where: { id },
      data: dto,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.dashboard.delete({ where: { id } });
  }

  async publish(tenantId: string, id: string) {
    const dashboard = await this.findOne(tenantId, id);
    if (dashboard.status === 'ARCHIVED') {
      throw new BadRequestException('Cannot publish an archived dashboard');
    }
    return this.prisma.dashboard.update({
      where: { id },
      data: { status: 'PUBLISHED' },
    });
  }

  async archive(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.dashboard.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
  }
}
