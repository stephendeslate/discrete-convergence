import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { getPagination } from '../common/pagination.utils';
import { DashboardStatus } from '@prisma/client';

// TRACED:AE-DASH-002
@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDashboardDto, tenantId: string) {
    return this.prisma.dashboard.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: (dto.status as DashboardStatus) ?? DashboardStatus.DRAFT,
        tenantId,
      },
      include: { widgets: true },
    });
  }

  async findAll(tenantId: string, page?: string, pageSize?: string) {
    const pagination = getPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.dashboard.findMany({
        where: { tenantId },
        include: { widgets: true },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dashboard.count({ where: { tenantId } }),
    ]);
    return { data, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async findOne(id: string, tenantId: string) {
    const dashboard = await this.prisma.dashboard.findUnique({
      where: { id },
      include: { widgets: true },
    });
    if (!dashboard || dashboard.tenantId !== tenantId) {
      throw new NotFoundException('Dashboard not found');
    }
    return dashboard;
  }

  async update(id: string, dto: UpdateDashboardDto, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dashboard.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && { status: dto.status as DashboardStatus }),
      },
      include: { widgets: true },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dashboard.delete({ where: { id } });
  }
}
