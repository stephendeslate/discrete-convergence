import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { parsePagination } from '@repo/shared';
import { WidgetType } from '@prisma/client';

// TRACED: AE-WIDGET-001
@Injectable()
export class WidgetService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page?: number, limit?: number) {
    const { skip, limit: take } = parsePagination(page, limit);
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
    return { data, total, page: page ?? 1, limit: take };
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

  async create(dto: CreateWidgetDto, tenantId: string) {
    return this.prisma.widget.create({
      data: {
        title: dto.title,
        type: dto.type as WidgetType,
        config: dto.config,
        dashboardId: dto.dashboardId,
        dataSourceId: dto.dataSourceId,
        tenantId,
        positionX: dto.positionX ?? 0,
        positionY: dto.positionY ?? 0,
        width: dto.width ?? 6,
        height: dto.height ?? 4,
      },
    });
  }

  async update(id: string, dto: UpdateWidgetDto, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.widget.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.config !== undefined && { config: dto.config }),
        ...(dto.positionX !== undefined && { positionX: dto.positionX }),
        ...(dto.positionY !== undefined && { positionY: dto.positionY }),
        ...(dto.width !== undefined && { width: dto.width }),
        ...(dto.height !== undefined && { height: dto.height }),
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.widget.delete({ where: { id } });
  }
}
