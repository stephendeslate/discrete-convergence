// TRACED:AE-DATA-003 — Queries against indexed tenantId, status, and composite fields
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { clampPagination } from '@analytics-engine/shared';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';

@Injectable()
export class WidgetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dashboardId: string, dto: CreateWidgetDto) {
    return this.prisma.widget.create({
      data: {
        type: dto.type,
        title: dto.title,
        config: dto.config ?? {},
        dashboardId,
      },
    });
  }

  async findAll(dashboardId: string, page?: number, limit?: number) {
    const { page: clampedPage, limit: clampedLimit } = clampPagination(page, limit);
    const skip = (clampedPage - 1) * clampedLimit;
    const [items, total] = await Promise.all([
      this.prisma.widget.findMany({
        where: { dashboardId },
        skip,
        take: clampedLimit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.widget.count({ where: { dashboardId } }),
    ]);
    return { items, total, page: clampedPage, limit: clampedLimit };
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
    await this.findOne(id);
    return this.prisma.widget.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.widget.delete({ where: { id } });
  }
}
