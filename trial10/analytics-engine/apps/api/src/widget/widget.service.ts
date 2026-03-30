import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { WidgetType } from '@prisma/client';
import { parsePagination } from '../common/pagination.utils';

// TRACED: AE-WIDGET-001
@Injectable()
export class WidgetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateWidgetDto) {
    return this.prisma.widget.create({
      data: {
        title: dto.title,
        type: dto.type as WidgetType,
        config: dto.config ?? '{}',
        position: dto.position ?? 0,
        tenantId,
        dashboardId: dto.dashboardId,
        dataSourceId: dto.dataSourceId,
      },
      include: { dashboard: true, dataSource: true },
    });
  }

  async findAll(tenantId: string, page?: string, pageSize?: string) {
    const pagination = parsePagination(page, pageSize);
    const [items, total] = await Promise.all([
      this.prisma.widget.findMany({
        where: { tenantId },
        include: { dashboard: true, dataSource: true },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.widget.count({ where: { tenantId } }),
    ]);
    return { items, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async findOne(tenantId: string, id: string) {
    const widget = await this.prisma.widget.findUnique({
      where: { id },
      include: { dashboard: true, dataSource: true },
    });

    if (!widget || widget.tenantId !== tenantId) {
      throw new NotFoundException('Widget not found');
    }

    return widget;
  }

  async update(tenantId: string, id: string, dto: UpdateWidgetDto) {
    await this.findOne(tenantId, id);

    return this.prisma.widget.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.type !== undefined && { type: dto.type as WidgetType }),
        ...(dto.config !== undefined && { config: dto.config }),
        ...(dto.position !== undefined && { position: dto.position }),
        ...(dto.dataSourceId !== undefined && { dataSourceId: dto.dataSourceId }),
      },
      include: { dashboard: true, dataSource: true },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.widget.delete({ where: { id } });
  }
}
