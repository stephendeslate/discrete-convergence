// TRACED:WIDGET-SERVICE — Business logic for widget CRUD
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.module';
import { CreateWidgetDto, UpdateWidgetDto } from './widget.dto';
import { clampPagination, PaginatedResult } from '@repo/shared';
import { Widget, Prisma } from '@prisma/client';
import { buildPaginatedResult } from '../common/pagination.utils';

@Injectable()
export class WidgetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWidgetDto, tenantId: string): Promise<Widget> {
    return this.prisma.widget.create({
      data: {
        title: dto.title,
        type: dto.type,
        config: (dto.config ?? {}) as Prisma.InputJsonValue,
        position: dto.position ?? 0,
        dashboardId: dto.dashboardId,
        tenantId,
      },
    });
  }

  async findByDashboard(
    dashboardId: string,
    tenantId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<Widget>> {
    const params = clampPagination(page, limit);
    const skip = (params.page - 1) * params.limit;

    const where = { dashboardId, tenantId };
    const [data, total] = await Promise.all([
      this.prisma.widget.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: { position: 'asc' },
      }),
      this.prisma.widget.count({ where }),
    ]);

    return buildPaginatedResult(data, total, page, limit);
  }

  async findOne(id: string, tenantId: string): Promise<Widget> {
    // tenant-scoped query
    const widget = await this.prisma.widget.findFirst({
      where: { id, tenantId },
    });
    if (!widget) {
      throw new NotFoundException(`Widget ${id} not found`);
    }
    return widget;
  }

  async update(id: string, dto: UpdateWidgetDto, tenantId: string): Promise<Widget> {
    await this.findOne(id, tenantId);
    return this.prisma.widget.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.config !== undefined && { config: dto.config as Prisma.InputJsonValue }),
        ...(dto.position !== undefined && { position: dto.position }),
      },
    });
  }

  async remove(id: string, tenantId: string): Promise<Widget> {
    await this.findOne(id, tenantId);
    return this.prisma.widget.delete({ where: { id } });
  }
}
