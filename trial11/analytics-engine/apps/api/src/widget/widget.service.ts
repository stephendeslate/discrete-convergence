import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { parsePagination } from '@analytics-engine/shared';
import { WidgetType } from '@prisma/client';

// TRACED: AE-WID-002
@Injectable()
export class WidgetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWidgetDto, tenantId: string) {
    return this.prisma.widget.create({
      data: {
        name: dto.name,
        type: dto.type as WidgetType,
        config: dto.config,
        dashboardId: dto.dashboardId,
        dataSourceId: dto.dataSourceId,
        position: dto.position ?? 0,
        tenantId,
      },
      include: { dashboard: true, dataSource: true },
    });
  }

  // TRACED: AE-WID-003
  async findAll(tenantId: string, page?: string, pageSize?: string) {
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
    // findFirst used because we scope by both id and tenantId for tenant isolation
    const widget = await this.prisma.widget.findFirst({
      where: { id, tenantId },
      include: { dashboard: true, dataSource: true },
    });
    if (!widget) {
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
        position: dto.position,
      },
      include: { dashboard: true, dataSource: true },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.widget.delete({ where: { id } });
  }
}
