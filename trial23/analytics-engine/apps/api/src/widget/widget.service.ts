// TRACED: AE-API-002 — Widget CRUD service with tenant scoping
import { Injectable, NotFoundException } from '@nestjs/common';
import { clampPagination } from '@repo/shared';
import { PrismaService } from '../infra/prisma.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';

@Injectable()
export class WidgetService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page?: number, limit?: number) {
    const pagination = clampPagination(page, limit);

    const [data, total] = await Promise.all([
      this.prisma.widget.findMany({
        where: { tenantId },
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.widget.count({ where: { tenantId } }),
    ]);

    return { data, total, page: pagination.page, limit: pagination.limit };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst required: composite lookup by id + tenantId for tenant isolation
    const widget = await this.prisma.widget.findFirst({
      where: { id, tenantId },
    });

    if (!widget) {
      throw new NotFoundException(`Widget ${id} not found`);
    }

    return widget;
  }

  async create(tenantId: string, dto: CreateWidgetDto) {
    return this.prisma.widget.create({
      data: {
        name: dto.name,
        type: dto.type,
        dashboardId: dto.dashboardId,
        config: dto.config ?? null,
        tenantId,
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateWidgetDto) {
    await this.findOne(id, tenantId);

    return this.prisma.widget.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    return this.prisma.widget.delete({ where: { id } });
  }

  async getWidgetData(id: string, tenantId: string) {
    const widget = await this.findOne(id, tenantId);

    return {
      widgetId: widget.id,
      data: [],
      fetchedAt: new Date().toISOString(),
    };
  }
}
