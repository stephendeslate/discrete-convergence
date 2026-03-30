import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { WidgetType } from '@prisma/client';
import { getPaginationParams } from '../common/pagination.utils';

// TRACED: AE-WIDGET-002
@Injectable()
export class WidgetService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateWidgetDto, tenantId: string) {
    return this.prisma.widget.create({
      data: {
        name: dto.name,
        type: dto.type as WidgetType,
        config: dto.config ?? '{}',
        dashboardId: dto.dashboardId,
        dataSourceId: dto.dataSourceId,
        positionX: dto.positionX ?? 0,
        positionY: dto.positionY ?? 0,
        width: dto.width ?? 4,
        height: dto.height ?? 3,
        tenantId,
      },
      include: { dashboard: true, dataSource: true },
    });
  }

  async findAll(tenantId: string, page?: number, limit?: number) {
    const { skip, take } = getPaginationParams(page, limit);
    const [items, total] = await Promise.all([
      this.prisma.widget.findMany({
        where: { tenantId },
        include: { dashboard: true, dataSource: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.widget.count({ where: { tenantId } }),
    ]);
    return { items, total, page: page ?? 1, pageSize: take };
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
        name: dto.name,
        type: dto.type as WidgetType | undefined,
        config: dto.config,
        positionX: dto.positionX,
        positionY: dto.positionY,
        width: dto.width,
        height: dto.height,
      },
      include: { dashboard: true, dataSource: true },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.widget.delete({ where: { id } });
  }
}
