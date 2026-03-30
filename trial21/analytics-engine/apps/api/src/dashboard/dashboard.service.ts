import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { DashboardStatus } from '@prisma/client';
import { getPaginationParams, createPaginatedResult } from '../common/pagination.utils';

/**
 * Dashboard service handling CRUD and lifecycle transitions.
 * VERIFY: AE-DASH-001 — dashboard status transitions DRAFT→PUBLISHED→ARCHIVED
 * VERIFY: AE-DASH-002 — dashboards scoped to tenant
 */
@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateDashboardDto) {
    const dashboard = await this.prisma.dashboard.create({
      data: {
        title: dto.title,
        description: dto.description,
        tenantId,
        createdById: userId,
      },
    });
    this.logger.log(`Dashboard ${dashboard.id} created by user ${userId}`);
    return dashboard;
  }

  async findAll(tenantId: string, page?: number, limit?: number) {
    const { skip, take } = getPaginationParams(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.dashboard.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { widgets: true },
      }),
      this.prisma.dashboard.count({ where: { tenantId } }),
    ]);
    return createPaginatedResult(data, total, page ?? 1, take);
  }

  async findOne(tenantId: string, id: string) {
    // findFirst used here: combining tenant scope with ID for RLS-safe lookup
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id, tenantId },
      include: { widgets: true, embedConfig: true },
    });
    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }
    return dashboard;
  }

  async update(tenantId: string, id: string, dto: UpdateDashboardDto) {
    await this.findOne(tenantId, id);
    return this.prisma.dashboard.update({
      where: { id },
      data: dto,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    await this.prisma.dashboard.delete({ where: { id } });
    this.logger.log(`Dashboard ${id} deleted`);
  }

  /**
   * Publish a dashboard. Only DRAFT dashboards can be published.
   * VERIFY: AE-DASH-003 — only DRAFT dashboards can be published
   */
  async publish(tenantId: string, id: string) {
    const dashboard = await this.findOne(tenantId, id);
    if (dashboard.status !== DashboardStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT dashboards can be published');
    }
    return this.prisma.dashboard.update({
      where: { id },
      data: { status: DashboardStatus.PUBLISHED },
    });
  }

  /**
   * Archive a dashboard. Only PUBLISHED dashboards can be archived.
   * VERIFY: AE-DASH-004 — only PUBLISHED dashboards can be archived
   */
  async archive(tenantId: string, id: string) {
    const dashboard = await this.findOne(tenantId, id);
    if (dashboard.status !== DashboardStatus.PUBLISHED) {
      throw new BadRequestException('Only PUBLISHED dashboards can be archived');
    }
    return this.prisma.dashboard.update({
      where: { id },
      data: { status: DashboardStatus.ARCHIVED },
    });
  }
}
