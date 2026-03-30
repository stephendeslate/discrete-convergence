// TRACED:EM-API-011 — AuditLogService read-only with tenant-scoped queries and pagination
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { buildPaginatedResult } from '../common/pagination.utils';
import { clampPagination } from '@event-management/shared';
import type { PaginatedResult } from '../common/pagination.utils';
import type { AuditLog } from '@prisma/client';

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    params: { page?: number; pageSize?: number; entity?: string },
  ): Promise<PaginatedResult<AuditLog>> {
    const { skip, take } = clampPagination(params);
    const where: Record<string, unknown> = { tenantId };
    if (params.entity) {
      where['entity'] = params.entity;
    }
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, email: true, name: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    return buildPaginatedResult(data, total, params);
  }

  async logAction(data: {
    action: string;
    entity: string;
    entityId: string;
    details?: string;
    userId: string;
    tenantId: string;
  }): Promise<AuditLog> {
    return this.prisma.auditLog.create({ data });
  }
}
