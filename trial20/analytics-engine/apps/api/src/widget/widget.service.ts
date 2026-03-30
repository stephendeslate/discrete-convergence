import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { clampPagination, paginationToSkipTake } from '@analytics-engine/shared';
import { WidgetType, Prisma } from '@prisma/client';

// TRACED: AE-WID-002
@Injectable()
export class WidgetService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page?: number, limit?: number) {
    const params = clampPagination(page, limit);
    const { skip, take } = paginationToSkipTake(params);

    const [data, total] = await Promise.all([
      this.prisma.widget.findMany({
        where: { tenantId },
        include: { dashboard: true, dataSource: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.widget.count({ where: { tenantId } }),
    ]);

    return { data, total, page: params.page, limit: params.limit };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: tenant-scoped lookup by ID — ensures tenant isolation on single-record fetch
    const widget = await this.prisma.widget.findFirst({
      where: { id, tenantId },
      include: { dashboard: true, dataSource: true },
    });

    if (!widget) {
      throw new NotFoundException('Widget not found');
    }

    return widget;
  }

  async create(dto: CreateWidgetDto, tenantId: string) {
    return this.prisma.widget.create({
      data: {
        name: dto.name,
        type: dto.type as WidgetType,
        config: dto.config,
        positionX: dto.positionX ?? 0,
        positionY: dto.positionY ?? 0,
        width: dto.width ?? 4,
        height: dto.height ?? 3,
        tenantId,
        dashboardId: dto.dashboardId,
        dataSourceId: dto.dataSourceId,
      },
    });
  }

  async update(id: string, dto: UpdateWidgetDto, tenantId: string) {
    await this.findOne(id, tenantId);

    const data: Prisma.WidgetUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.type !== undefined) data.type = dto.type as WidgetType;
    if (dto.config !== undefined) data.config = dto.config;
    if (dto.positionX !== undefined) data.positionX = dto.positionX;
    if (dto.positionY !== undefined) data.positionY = dto.positionY;
    if (dto.width !== undefined) data.width = dto.width;
    if (dto.height !== undefined) data.height = dto.height;

    return this.prisma.widget.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.widget.delete({ where: { id } });
  }

  async findByDashboard(dashboardId: string, tenantId: string) {
    return this.prisma.widget.findMany({
      where: { dashboardId, tenantId },
      include: { dataSource: true },
      orderBy: { positionY: 'asc' },
    });
  }
}
