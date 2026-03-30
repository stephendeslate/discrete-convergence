// TRACED:DASH-SVC — Dashboard service with CRUD
// TRACED:DASH-CRUD — full CRUD: findAll, findOne, create, update, remove (VERIFY:DASH-CRUD)
// TRACED:DASH-TENANT-SCOPE — all queries filtered by tenantId (VERIFY:DASH-TENANT-SCOPE)
// TRACED:API-DASHBOARD-CRUD — dashboard CRUD endpoints (VERIFY:API-DASHBOARD-CRUD)
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { getPrismaSkipTake, paginateResponse } from '../common/pagination.utils';
import { PaginatedResult } from '@repo/shared';
import { Dashboard } from '@prisma/client';

/**
 * Dashboard service handling CRUD operations.
 * TRACED:AE-DASH-001 — Dashboard service with tenant isolation
 */
@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * List dashboards for a tenant with pagination.
   * TRACED:AE-DASH-002 — Dashboard list with pagination
   */
  async findAll(
    tenantId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<Dashboard>> {
    const { skip, take } = getPrismaSkipTake(page, limit);

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

    return paginateResponse(data, total, page, limit);
  }

  /**
   * Get a single dashboard by ID.
   * TRACED:AE-DASH-003 — Dashboard get with not-found branching
   */
  async findOne(id: string, tenantId: string): Promise<Dashboard> {
    // findFirst justified: fetching by ID with tenant isolation — compound filter
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id, tenantId },
      include: { widgets: true },
    });

    if (!dashboard) {
      throw new NotFoundException(`Dashboard with ID ${id} not found`);
    }

    return dashboard;
  }

  /**
   * Create a new dashboard.
   * TRACED:AE-DASH-004 — Dashboard creation
   */
  async create(
    dto: CreateDashboardDto,
    userId: string,
    tenantId: string,
  ): Promise<Dashboard> {
    return this.prisma.dashboard.create({
      data: {
        name: dto.name,
        description: dto.description,
        isPublic: dto.isPublic ?? false,
        userId,
        tenantId,
      },
    });
  }

  /**
   * Update an existing dashboard.
   * TRACED:AE-DASH-005 — Dashboard update with ownership check
   */
  async update(
    id: string,
    dto: UpdateDashboardDto,
    userId: string,
    tenantId: string,
    role: string,
  ): Promise<Dashboard> {
    const dashboard = await this.findOne(id, tenantId);

    // Only the owner or an admin can update
    if (dashboard.userId !== userId && role !== 'ADMIN') {
      throw new ForbiddenException('You can only update your own dashboards');
    }

    return this.prisma.dashboard.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.isPublic !== undefined ? { isPublic: dto.isPublic } : {}),
      },
    });
  }

  /**
   * Delete a dashboard.
   * TRACED:AE-DASH-006 — Dashboard deletion with ownership branching
   */
  async remove(
    id: string,
    userId: string,
    tenantId: string,
    role: string,
  ): Promise<Dashboard> {
    const dashboard = await this.findOne(id, tenantId);

    if (dashboard.userId !== userId && role !== 'ADMIN') {
      throw new ForbiddenException('You can only delete your own dashboards');
    }

    this.logger.log(`Deleting dashboard ${id} by user ${userId}`);
    return this.prisma.dashboard.delete({ where: { id } });
  }

  /**
   * Get aggregated dashboard data (counts, stats).
   * Domain-action method with branching logic.
   * TRACED:AE-DASH-007 — Dashboard getData with branching
   */
  async getData(
    tenantId: string,
    includeWidgets: boolean,
  ): Promise<{ totalDashboards: number; publicCount: number; widgets?: number }> {
    const totalDashboards = await this.prisma.dashboard.count({
      where: { tenantId },
    });

    const publicCount = await this.prisma.dashboard.count({
      where: { tenantId, isPublic: true },
    });

    if (includeWidgets) {
      const widgetCount = await this.prisma.widget.count({
        where: { tenantId },
      });
      return { totalDashboards, publicCount, widgets: widgetCount };
    }

    return { totalDashboards, publicCount };
  }
}
