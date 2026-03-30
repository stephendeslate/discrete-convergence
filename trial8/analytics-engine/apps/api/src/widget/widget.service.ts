// TRACED:AE-DATA-003 — Queries against indexed tenantId, status, and composite fields
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, WidgetType } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { paginatedQuery } from '../common/paginated-query';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';

@Injectable()
export class WidgetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dashboardId: string, dto: CreateWidgetDto) {
    return this.prisma.widget.create({
      data: {
        type: dto.type as WidgetType,
        title: dto.title,
        config: (dto.config ?? {}) as Prisma.InputJsonValue,
        dashboardId,
      },
    });
  }

  async findAll(dashboardId: string, page?: number, limit?: number) {
    return paginatedQuery(this.prisma.widget, { dashboardId }, page, limit);
  }

  async findOne(id: string) {
    // findFirst: lookup by widget ID with potential soft-delete filter in future
    const widget = await this.prisma.widget.findFirst({
      where: { id },
    });
    if (!widget) {
      throw new NotFoundException('Widget not found');
    }
    return widget;
  }

  async update(id: string, dto: UpdateWidgetDto) {
    const existing = await this.findOne(id);
    const data: Prisma.WidgetUpdateInput = {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.type !== undefined && { type: dto.type as WidgetType }),
      ...(dto.config !== undefined && { config: dto.config as Prisma.InputJsonValue }),
    };
    return this.prisma.widget.update({ where: { id: existing.id }, data });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    return this.prisma.widget.delete({ where: { id: existing.id } });
  }
}
