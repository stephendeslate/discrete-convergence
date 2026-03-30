// TRACED: AE-API-001 — Dashboard CRUD service with tenant scoping
// TRACED: AE-EDGE-003 — dashboard not found → 404
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { clampPagination } from '@repo/shared';
import { PrismaService } from '../infra/prisma.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page?: number, limit?: number) {
    const pagination = clampPagination(page, limit);

    const [data, total] = await Promise.all([
      this.prisma.dashboard.findMany({
        where: { tenantId },
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dashboard.count({ where: { tenantId } }),
    ]);

    return { data, total, page: pagination.page, limit: pagination.limit };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst required: composite lookup by id + tenantId for tenant isolation
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id, tenantId },
    });

    if (!dashboard) {
      throw new NotFoundException(`Dashboard ${id} not found`);
    }

    return dashboard;
  }

  async create(tenantId: string, dto: CreateDashboardDto) {
    return this.prisma.dashboard.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        tenantId,
        status: 'draft',
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateDashboardDto) {
    await this.findOne(id, tenantId);

    return this.prisma.dashboard.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    return this.prisma.dashboard.delete({ where: { id } });
  }

  async publish(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    return this.prisma.dashboard.update({
      where: { id },
      data: { status: 'published' },
    });
  }

  async archive(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    return this.prisma.dashboard.update({
      where: { id },
      data: { status: 'archived' },
    });
  }

  async countByTenant(tenantId: string): Promise<number> {
    const result = await this.prisma.$executeRaw(
      Prisma.sql`SELECT COUNT(*) FROM "Dashboard" WHERE "tenantId" = ${tenantId}`,
    );
    return result;
  }
}
