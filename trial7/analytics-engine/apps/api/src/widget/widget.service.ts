import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../infra/prisma.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { getPagination } from '../common/pagination.utils';
import { WidgetType } from '@prisma/client';

// TRACED:AE-WIDG-002
@Injectable()
export class WidgetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWidgetDto, tenantId: string) {
    return this.prisma.widget.create({
      data: {
        title: dto.title,
        type: dto.type as WidgetType,
        config: (dto.config ?? {}) as Prisma.InputJsonValue,
        positionX: dto.positionX ?? 0,
        positionY: dto.positionY ?? 0,
        width: dto.width ?? 4,
        height: dto.height ?? 3,
        refreshRate: dto.refreshRate ?? 60,
        dashboardId: dto.dashboardId,
        dataSourceId: dto.dataSourceId,
        tenantId,
      },
      include: { dashboard: true, dataSource: true },
    });
  }

  async findAll(tenantId: string, page?: string, pageSize?: string) {
    const pagination = getPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.widget.findMany({
        where: { tenantId },
        include: { dashboard: true, dataSource: true },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.widget.count({ where: { tenantId } }),
    ]);
    return { data, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async findOne(id: string, tenantId: string) {
    const widget = await this.prisma.widget.findUnique({
      where: { id },
      include: { dashboard: true, dataSource: true },
    });
    if (!widget || widget.tenantId !== tenantId) {
      throw new NotFoundException('Widget not found');
    }
    return widget;
  }

  async update(id: string, dto: UpdateWidgetDto, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.widget.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.type !== undefined && { type: dto.type as WidgetType }),
        ...(dto.config !== undefined && { config: dto.config as Prisma.InputJsonValue }),
        ...(dto.positionX !== undefined && { positionX: dto.positionX }),
        ...(dto.positionY !== undefined && { positionY: dto.positionY }),
        ...(dto.width !== undefined && { width: dto.width }),
        ...(dto.height !== undefined && { height: dto.height }),
        ...(dto.refreshRate !== undefined && { refreshRate: dto.refreshRate }),
      },
      include: { dashboard: true, dataSource: true },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.widget.delete({ where: { id } });
  }
}
