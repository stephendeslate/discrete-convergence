// TRACED: EM-API-005 — Dashboard CRUD with organization scoping
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { clampPagination } from '@repo/shared';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organizationId: string, dto: CreateDashboardDto) {
    return this.prisma.dashboard.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        status: 'DRAFT',
        organizationId,
      },
    });
  }

  async findAll(organizationId: string, page?: number, limit?: number) {
    const pagination = clampPagination(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.dashboard.findMany({
        where: { organizationId },
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.dashboard.count({ where: { organizationId } }),
    ]);
    return { data, total, page: pagination.page, limit: pagination.limit };
  }

  async findOne(organizationId: string, id: string) {
    // findFirst: scope by organizationId for tenant isolation at application level
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id, organizationId },
    });
    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }
    return dashboard;
  }

  async update(organizationId: string, id: string, dto: UpdateDashboardDto) {
    const dashboard = await this.findOne(organizationId, id);
    return this.prisma.dashboard.update({
      where: { id: dashboard.id },
      data: { ...dto },
    });
  }

  async remove(organizationId: string, id: string) {
    const dashboard = await this.findOne(organizationId, id);
    return this.prisma.dashboard.update({
      where: { id: dashboard.id },
      data: { status: 'ARCHIVED' },
    });
  }
}
