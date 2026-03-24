// TRACED:FD-AUDIT-001 — audit log read-only service with tenant scoping and pagination
import { Injectable } from '@nestjs/common';
import type { AuditLog } from '@prisma/client';
import { clampPagination } from '@fleet-dispatch/shared';
import type { PaginatedResult } from '@fleet-dispatch/shared';
import { PrismaService } from '../common/services/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    page?: number,
    pageSize?: number,
    entity?: string,
  ): Promise<PaginatedResult<AuditLog>> {
    const { page: p, pageSize: ps } = clampPagination(page, pageSize);
    const where = {
      tenantId,
      ...(entity && { entity }),
    };
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip: (p - 1) * ps,
        take: ps,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    return {
      data,
      meta: { total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) },
    };
  }

  async create(
    action: string,
    entity: string,
    entityId: string,
    userId: string,
    tenantId: string,
    details?: Record<string, unknown>,
  ): Promise<AuditLog> {
    return this.prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        details: details ?? {},
        userId,
        tenantId,
      },
    });
  }
}
