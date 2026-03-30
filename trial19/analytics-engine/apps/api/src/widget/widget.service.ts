import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { parsePagination } from '@analytics-engine/shared';
import { WidgetType } from '@prisma/client';

// TRACED: AE-API-006
@Injectable()
export class WidgetService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: { page?: number; limit?: number }) {
    const { skip, limit } = parsePagination(query);
    const [data, total] = await Promise.all([
      this.prisma.widget.findMany({
        where: { tenantId },
        include: { dashboard: true, dataSource: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.widget.count({ where: { tenantId } }),
    ]);
    return { data, total, page: query.page ?? 1, limit };
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

  async create(tenantId: string, dto: CreateWidgetDto) {
    return this.prisma.widget.create({
      data: {
        name: dto.name,
        type: dto.type as WidgetType,
        config: dto.config,
        positionX: dto.positionX ?? 0,
        positionY: dto.positionY ?? 0,
        width: dto.width ?? 4,
        height: dto.height ?? 3,
        dashboardId: dto.dashboardId,
        dataSourceId: dto.dataSourceId,
        tenantId,
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateWidgetDto) {
    await this.findOne(id, tenantId);
    return this.prisma.widget.update({
      where: { id },
      data: {
        name: dto.name,
        type: dto.type as WidgetType,
        config: dto.config,
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
