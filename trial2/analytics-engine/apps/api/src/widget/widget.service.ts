import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto, UpdateWidgetPositionDto } from './dto/update-widget.dto';
import { getPaginationParams } from '../common/pagination.utils';

// TRACED:AE-WIDG-001 — Widget service with CRUD + position update
@Injectable()
export class WidgetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dashboardId: string, tenantId: string, dto: CreateWidgetDto) {
    // Verify dashboard belongs to tenant
    // findFirst: filtering by id + tenantId for tenant-scoped access —
    // findUnique does not support compound non-unique field conditions
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id: dashboardId, tenantId },
    });

    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }

    return this.prisma.widget.create({
      data: {
        title: dto.title,
        type: dto.type,
        positionX: dto.positionX ?? 0,
        positionY: dto.positionY ?? 0,
        width: dto.width ?? 1,
        height: dto.height ?? 1,
        dashboardId,
        dataSourceId: dto.dataSourceId,
      },
      include: { dataSource: true },
    });
  }

  async findAll(dashboardId: string, tenantId: string, page?: number, pageSize?: number) {
    // Verify dashboard belongs to tenant
    // findFirst: filtering by id + tenantId for tenant-scoped access
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id: dashboardId, tenantId },
    });

    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }

    const { skip, take, page: currentPage, pageSize: currentPageSize } = getPaginationParams(page, pageSize);

    const [items, total] = await Promise.all([
      this.prisma.widget.findMany({
        where: { dashboardId },
        include: { dataSource: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.widget.count({ where: { dashboardId } }),
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
    // findFirst: filtering by widget id while joining through dashboard to check tenantId —
    // requires relational filter which findUnique does not support
    const widget = await this.prisma.widget.findFirst({
      where: { id, dashboard: { tenantId } },
      include: { dataSource: true, dashboard: true },
    });

    if (!widget) {
      throw new NotFoundException('Widget not found');
    }

    return widget;
  }

  async update(id: string, tenantId: string, dto: UpdateWidgetDto) {
    await this.findOne(id, tenantId);

    return this.prisma.widget.update({
      where: { id },
      data: {
        title: dto.title,
        dataSourceId: dto.dataSourceId,
      },
      include: { dataSource: true },
    });
  }

  async updatePosition(id: string, tenantId: string, dto: UpdateWidgetPositionDto) {
    await this.findOne(id, tenantId);

    return this.prisma.widget.update({
      where: { id },
      data: {
        positionX: dto.positionX,
        positionY: dto.positionY,
        width: dto.width,
        height: dto.height,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.widget.delete({ where: { id } });
  }
}
