// TRACED:DASHBOARD-SERVICE — Business logic for dashboard CRUD
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.module';
import { CreateDashboardDto, UpdateDashboardDto } from './dashboard.dto';
import { clampPagination, PaginatedResult } from '@repo/shared';
import { Dashboard } from '@prisma/client';
import { buildPaginatedResult } from '../common/pagination.utils';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDashboardDto, userId: string, tenantId: string): Promise<Dashboard> {
    return this.prisma.dashboard.create({
      data: {
        name: dto.name,
        description: dto.description,
        isPublic: dto.isPublic ?? false,
        userId,
        tenantId,
      },
    });
  }

  async findAll(
    tenantId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<Dashboard>> {
    const params = clampPagination(page, limit);
    const skip = (params.page - 1) * params.limit;

    const [data, total] = await Promise.all([
      this.prisma.dashboard.findMany({
        where: { tenantId },
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dashboard.count({ where: { tenantId } }),
    ]);

    return buildPaginatedResult(data, total, page, limit);
  }

  async findOne(id: string, tenantId: string): Promise<Dashboard> {
    // tenant-scoped query
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id, tenantId },
      include: { widgets: true },
    });
    if (!dashboard) {
      throw new NotFoundException(`Dashboard ${id} not found`);
    }
    return dashboard;
  }

  async update(
    id: string,
    dto: UpdateDashboardDto,
    userId: string,
    tenantId: string,
  ): Promise<Dashboard> {
    const dashboard = await this.findOne(id, tenantId);
    if (dashboard.userId !== userId) {
      throw new ForbiddenException('You can only update your own dashboards');
    }
    return this.prisma.dashboard.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.isPublic !== undefined && { isPublic: dto.isPublic }),
      },
    });
  }

  async remove(id: string, userId: string, tenantId: string): Promise<Dashboard> {
    const dashboard = await this.findOne(id, tenantId);
    if (dashboard.userId !== userId) {
      throw new ForbiddenException('You can only delete your own dashboards');
    }
    return this.prisma.dashboard.delete({ where: { id } });
  }
}
