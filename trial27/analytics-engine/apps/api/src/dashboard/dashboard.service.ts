import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import {
  parsePagination,
  paginatedResponse,
  PaginatedResponse,
} from '../common/pagination.utils';
import { Dashboard } from '@prisma/client';
import { DashboardStatus } from '@analytics-engine/shared';

// TRACED: AE-API-002 — Dashboard CRUD
// TRACED: AE-API-003 — Dashboard lifecycle (publish/archive)
// TRACED: AE-DATA-003 — Dashboard model
// TRACED: AE-EDGE-001 — Empty dashboard name rejected
// TRACED: AE-EDGE-002 — Duplicate dashboard name for tenant
// TRACED: AE-EDGE-008 — Publish non-draft dashboard fails
// TRACED: AE-EDGE-009 — Delete published dashboard fails
// TRACED: AE-EDGE-013 — Update archived dashboard fails
// TRACED: AE-EDGE-014 — Archive already archived dashboard fails

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    tenantId: string,
    dto: CreateDashboardDto,
  ): Promise<Dashboard> {
    // findFirst used here: checking for duplicate name within a tenant scope
    const existing = await this.prisma.dashboard.findFirst({
      where: { tenantId, name: dto.name },
    });

    if (existing) {
      throw new ConflictException('Dashboard with this name already exists');
    }

    return this.prisma.dashboard.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        layout: dto.layout ?? 'grid',
      },
    });
  }

  async findAll(
    tenantId: string,
    page?: number,
    pageSize?: number,
  ): Promise<PaginatedResponse<Dashboard>> {
    const pagination = parsePagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.dashboard.findMany({
        where: { tenantId },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dashboard.count({ where: { tenantId } }),
    ]);

    return paginatedResponse(data, total, pagination);
  }

  async findOne(tenantId: string, id: string): Promise<Dashboard> {
    // findFirst used here: fetching by ID scoped to tenant for RLS consistency
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id, tenantId },
      include: { widgets: true },
    });

    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }

    return dashboard;
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateDashboardDto,
  ): Promise<Dashboard> {
    const dashboard = await this.findOne(tenantId, id);

    if (dashboard.status === DashboardStatus.ARCHIVED) {
      throw new BadRequestException('Cannot update an archived dashboard');
    }

    return this.prisma.dashboard.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        layout: dto.layout,
      },
    });
  }

  async remove(tenantId: string, id: string): Promise<Dashboard> {
    const dashboard = await this.findOne(tenantId, id);

    if (dashboard.status === DashboardStatus.PUBLISHED) {
      throw new BadRequestException('Cannot delete a published dashboard');
    }

    return this.prisma.dashboard.delete({ where: { id } });
  }

  async publish(tenantId: string, id: string): Promise<Dashboard> {
    const dashboard = await this.findOne(tenantId, id);

    if (dashboard.status !== DashboardStatus.DRAFT) {
      throw new BadRequestException('Only draft dashboards can be published');
    }

    return this.prisma.dashboard.update({
      where: { id },
      data: {
        status: DashboardStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
  }

  async archive(tenantId: string, id: string): Promise<Dashboard> {
    const dashboard = await this.findOne(tenantId, id);

    if (dashboard.status === DashboardStatus.ARCHIVED) {
      throw new BadRequestException('Dashboard is already archived');
    }

    return this.prisma.dashboard.update({
      where: { id },
      data: { status: DashboardStatus.ARCHIVED },
    });
  }
}
