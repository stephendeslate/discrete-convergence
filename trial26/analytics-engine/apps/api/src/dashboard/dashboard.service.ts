import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { clampPagination } from '../common/pagination.utils';

// TRACED: AE-DASH-001 — Create dashboard
// TRACED: AE-DASH-002 — List dashboards with pagination
// TRACED: AE-DASH-003 — Get single dashboard
// TRACED: AE-DASH-004 — Update dashboard
// TRACED: AE-DASH-005 — Delete dashboard
// TRACED: AE-DASH-006 — Publish dashboard
// TRACED: AE-DASH-007 — Archive dashboard
// TRACED: AE-EDGE-001 — Empty dashboard name
// TRACED: AE-EDGE-002 — Duplicate dashboard name for tenant

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDashboardDto) {
    if (!dto.name || dto.name.trim().length === 0) {
      throw new BadRequestException('Dashboard name cannot be empty');
    }

    // findFirst: Check for duplicate name within the same tenant
    const existing = await this.prisma.dashboard.findFirst({
      where: { tenantId, name: dto.name },
    });

    if (existing) {
      throw new ConflictException('Dashboard with this name already exists');
    }

    return this.prisma.dashboard.create({
      data: {
        name: dto.name,
        description: dto.description,
        layout: dto.layout ?? 'grid',
        status: 'DRAFT',
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, page?: number, limit?: number) {
    const { skip, take, page: p, limit: l } = clampPagination(page, limit);

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

    return { data, total, page: p, limit: l, totalPages: Math.ceil(total / l) };
  }

  async findOne(tenantId: string, id: string) {
    // findFirst: Scoped by tenantId for RLS compliance
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id, tenantId },
      include: { widgets: true },
    });

    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }

    return dashboard;
  }

  async update(tenantId: string, id: string, dto: UpdateDashboardDto) {
    const dashboard = await this.findOne(tenantId, id);

    if (dashboard.status === 'ARCHIVED') {
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

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.dashboard.delete({ where: { id } });
  }

  async publish(tenantId: string, id: string) {
    const dashboard = await this.findOne(tenantId, id);

    if (dashboard.status !== 'DRAFT') {
      throw new BadRequestException('Only draft dashboards can be published');
    }

    return this.prisma.dashboard.update({
      where: { id },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
    });
  }

  async archive(tenantId: string, id: string) {
    const dashboard = await this.findOne(tenantId, id);

    if (dashboard.status === 'ARCHIVED') {
      throw new BadRequestException('Dashboard is already archived');
    }

    return this.prisma.dashboard.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
  }
}
