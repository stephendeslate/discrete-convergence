// TRACED:AE-DASH-001 — Dashboard CRUD with tenant isolation and paginated listing
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { paginatedQuery } from '../common/paginated-query';
import type { PaginatedResult } from '../common/paginated-query';
import type { Dashboard, DashboardStatus } from '@prisma/client';
import type { CreateDashboardDto } from './dto/create-dashboard.dto';
import type { UpdateDashboardDto } from './dto/update-dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDashboardDto): Promise<Dashboard> {
    return this.prisma.dashboard.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: (dto.status as DashboardStatus) ?? 'DRAFT',
        tenantId,
      },
    });
  }

  async findAll(
    tenantId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<Dashboard>> {
    return paginatedQuery<Dashboard>(
      this.prisma.dashboard,
      { tenantId },
      page,
      limit,
    );
  }

  async findOne(tenantId: string, id: string): Promise<Dashboard> {
    const dashboard = await this.prisma.dashboard.findUnique({
      where: { id },
      include: { widgets: true },
    });

    if (!dashboard || dashboard.tenantId !== tenantId) {
      throw new NotFoundException(`Dashboard ${id} not found`);
    }

    return dashboard;
  }

  async update(tenantId: string, id: string, dto: UpdateDashboardDto): Promise<Dashboard> {
    await this.findOne(tenantId, id);

    return this.prisma.dashboard.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && { status: dto.status as DashboardStatus }),
      },
    });
  }

  async remove(tenantId: string, id: string): Promise<Dashboard> {
    await this.findOne(tenantId, id);
    return this.prisma.dashboard.delete({ where: { id } });
  }
}
