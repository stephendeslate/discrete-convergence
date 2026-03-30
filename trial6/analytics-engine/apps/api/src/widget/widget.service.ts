// TRACED:AE-WID-001 — Widget CRUD with dashboard ownership verification
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { paginatedQuery } from '../common/paginated-query';
import type { PaginatedResult } from '../common/paginated-query';
import { Prisma } from '@prisma/client';
import type { Widget, WidgetType } from '@prisma/client';
import type { CreateWidgetDto } from './dto/create-widget.dto';
import type { UpdateWidgetDto } from './dto/update-widget.dto';

@Injectable()
export class WidgetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateWidgetDto): Promise<Widget> {
    // Verify dashboard belongs to tenant before creating widget
    const dashboard = await this.prisma.dashboard.findUnique({
      where: { id: dto.dashboardId },
    });

    if (!dashboard || dashboard.tenantId !== tenantId) {
      throw new NotFoundException(`Dashboard ${dto.dashboardId} not found`);
    }

    return this.prisma.widget.create({
      data: {
        type: dto.type as WidgetType,
        title: dto.title,
        config: (dto.config ?? {}) as Prisma.InputJsonValue,
        dashboardId: dto.dashboardId,
      },
    });
  }

  async findAll(
    tenantId: string,
    dashboardId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<Widget>> {
    // Verify dashboard belongs to tenant
    const dashboard = await this.prisma.dashboard.findUnique({
      where: { id: dashboardId },
    });

    if (!dashboard || dashboard.tenantId !== tenantId) {
      throw new NotFoundException(`Dashboard ${dashboardId} not found`);
    }

    return paginatedQuery<Widget>(
      this.prisma.widget,
      { dashboardId },
      page,
      limit,
    );
  }

  async findOne(tenantId: string, id: string): Promise<Widget> {
    const widget = await this.prisma.widget.findUnique({
      where: { id },
      include: { dashboard: true },
    });

    if (!widget) {
      throw new NotFoundException(`Widget ${id} not found`);
    }

    // Verify tenant ownership through dashboard
    const dashboard = await this.prisma.dashboard.findUnique({
      where: { id: widget.dashboardId },
    });

    if (!dashboard || dashboard.tenantId !== tenantId) {
      throw new NotFoundException(`Widget ${id} not found`);
    }

    return widget;
  }

  async update(tenantId: string, id: string, dto: UpdateWidgetDto): Promise<Widget> {
    await this.findOne(tenantId, id);

    return this.prisma.widget.update({
      where: { id },
      data: {
        ...(dto.type !== undefined && { type: dto.type as WidgetType }),
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.config !== undefined && { config: dto.config as Prisma.InputJsonValue }),
      },
    });
  }

  async remove(tenantId: string, id: string): Promise<Widget> {
    await this.findOne(tenantId, id);
    return this.prisma.widget.delete({ where: { id } });
  }
}
