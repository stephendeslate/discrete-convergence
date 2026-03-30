import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { DashboardStatus, Prisma } from '@prisma/client';
import { parsePagination } from '../common/pagination.utils';

// TRACED: AE-DASH-001
@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateDashboardDto) {
    return this.prisma.dashboard.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: (dto.status as DashboardStatus) ?? 'DRAFT',
        tenantId,
        userId,
      },
      include: { widgets: true },
    });
  }

  async findAll(tenantId: string, page?: string, pageSize?: string) {
    const pagination = parsePagination(page, pageSize);
    const [items, total] = await Promise.all([
      this.prisma.dashboard.findMany({
        where: { tenantId },
        include: { widgets: true, user: { select: { id: true, name: true, email: true } } },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dashboard.count({ where: { tenantId } }),
    ]);
    return { items, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async findOne(tenantId: string, id: string) {
    const dashboard = await this.prisma.dashboard.findUnique({
      where: { id },
      include: { widgets: true, user: { select: { id: true, name: true, email: true } } },
    });

    if (!dashboard || dashboard.tenantId !== tenantId) {
      throw new NotFoundException('Dashboard not found');
    }

    return dashboard;
  }

  async update(tenantId: string, id: string, dto: UpdateDashboardDto) {
    await this.findOne(tenantId, id);

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

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.dashboard.delete({ where: { id } });
  }

  // TRACED: AE-DATA-002
  async getStats(tenantId: string) {
    const result = await this.prisma.$executeRaw(
      Prisma.sql`SELECT COUNT(*) FROM dashboards WHERE tenant_id = ${tenantId}`,
    );
    return { count: result };
  }
}
