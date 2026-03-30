// TRACED:AUDIT-SERVICE — Business logic for audit log tracking
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.module';
import { clampPagination, PaginatedResult } from '@repo/shared';
import { AuditLog } from '@prisma/client';
import { buildPaginatedResult } from '../common/pagination.utils';

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'EXPORT',
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
        userId,
        tenantId,
        details: details ? (details as unknown as import('@prisma/client').Prisma.InputJsonValue) : undefined,
      },
    });
  }

  async findAll(
    tenantId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<AuditLog>> {
    const params = clampPagination(page, limit);
    const skip = (params.page - 1) * params.limit;

    const where = { tenantId };
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return buildPaginatedResult(data, total, page, limit);
  }
}
