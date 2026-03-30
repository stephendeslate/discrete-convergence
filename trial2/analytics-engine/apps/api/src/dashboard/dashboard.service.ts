import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { getPaginationParams } from '../common/pagination.utils';
import { DashboardStatus } from '@prisma/client';

// TRACED:AE-DASH-001 — Dashboard service with CRUD + publish/archive
@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDashboardDto) {
    return this.prisma.dashboard.create({
      data: {
        title: dto.title,
        description: dto.description,
        tenantId,
      },
      include: { widgets: true },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const { skip, take, page: currentPage, pageSize: currentPageSize } = getPaginationParams(page, pageSize);

    const [items, total] = await Promise.all([
      this.prisma.dashboard.findMany({
        where: { tenantId },
        include: { widgets: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dashboard.count({ where: { tenantId } }),
    ]);

    return {
      items,
      total,
      page: currentPage,
      pageSize: currentPageSize,
      totalPages: Math.ceil(total / currentPageSize),
    };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: filtering by both id and tenantId for RLS-compatible tenant scoping —
    // findUnique only supports filtering by unique fields, not compound conditions
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id, tenantId },
      include: { widgets: true, embedConfig: true },
    });

    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }

    return dashboard;
  }

  async update(id: string, tenantId: string, dto: UpdateDashboardDto) {
    await this.findOne(id, tenantId);

    return this.prisma.dashboard.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
      },
      include: { widgets: true },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dashboard.delete({ where: { id } });
  }

  async publish(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dashboard.update({
      where: { id },
      data: { status: DashboardStatus.PUBLISHED },
    });
  }

  async archive(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dashboard.update({
      where: { id },
      data: { status: DashboardStatus.ARCHIVED },
    });
  }
}
