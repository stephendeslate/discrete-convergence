// TRACED: FD-API-005 — Dashboard CRUD with tenant scoping
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { paginate, clampPagination, PaginatedResult } from '../common/pagination.utils';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, userId: string, dto: CreateDashboardDto) {
    await this.prisma.setTenantContext(companyId);
    return this.prisma.dashboard.create({
      data: {
        ...dto,
        companyId,
        userId,
      },
    });
  }

  async findAll(companyId: string, page?: number, limit?: number): Promise<PaginatedResult<unknown>> {
    await this.prisma.setTenantContext(companyId);
    const clamped = clampPagination(page, limit);

    const [data, total] = await Promise.all([
      this.prisma.dashboard.findMany({
        where: { companyId },
        skip: clamped.offset,
        take: clamped.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dashboard.count({ where: { companyId } }),
    ]);

    return paginate(data, total, page, limit);
  }

  async findOne(companyId: string, id: string) {
    await this.prisma.setTenantContext(companyId);
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id, companyId },
    });

    if (!dashboard) {
      throw new NotFoundException(`Dashboard ${id} not found`);
    }

    return dashboard;
  }

  async update(companyId: string, id: string, dto: UpdateDashboardDto) {
    await this.findOne(companyId, id);
    await this.prisma.setTenantContext(companyId);
    return this.prisma.dashboard.update({
      where: { id },
      data: dto,
    });
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    await this.prisma.setTenantContext(companyId);
    return this.prisma.dashboard.delete({ where: { id } });
  }
}
