import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { DashboardStatus } from '@prisma/client';
import { getPaginationParams } from '../common/pagination.utils';

// TRACED: AE-DASH-002
@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDashboardDto, tenantId: string, userId: string) {
    return this.prisma.dashboard.create({
      data: {
        name: dto.name,
        description: dto.description,
        status: (dto.status as DashboardStatus) ?? 'DRAFT',
        tenantId,
        userId,
      },
      include: { widgets: true },
    });
  }

  async findAll(tenantId: string, page?: number, limit?: number) {
    const { skip, take } = getPaginationParams(page, limit);
    const [items, total] = await Promise.all([
      this.prisma.dashboard.findMany({
        where: { tenantId },
        include: { widgets: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dashboard.count({ where: { tenantId } }),
    ]);
    return { items, total, page: page ?? 1, pageSize: take };
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
        name: dto.name,
        description: dto.description,
        status: dto.status as DashboardStatus | undefined,
      },
      include: { widgets: true },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dashboard.delete({ where: { id } });
  }
}
