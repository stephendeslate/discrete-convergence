import { Injectable, NotFoundException } from '@nestjs/common';
import { WidgetType, Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { parsePagination } from '@analytics-engine/shared';

// TRACED: AE-API-004
// TRACED: AE-DATA-004
@Injectable()
export class WidgetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWidgetDto, tenantId: string) {
    return this.prisma.widget.create({
      data: {
        title: dto.title,
        type: dto.type as WidgetType,
        config: (dto.config ?? {}) as Prisma.InputJsonValue,
        dashboardId: dto.dashboardId,
        dataSourceId: dto.dataSourceId,
        tenantId,
      },
      include: { dashboard: true, dataSource: true },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const pagination = parsePagination(page, pageSize);
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
        title: dto.title,
        type: dto.type as WidgetType | undefined,
        config: dto.config as Prisma.InputJsonValue | undefined,
        dataSourceId: dto.dataSourceId,
      },
      include: { dashboard: true, dataSource: true },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.widget.delete({ where: { id } });
  }
}
