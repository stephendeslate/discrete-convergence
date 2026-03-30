import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../infra/prisma.service';
import { getPaginationParams, createPaginatedResult } from '../common/pagination.utils';

/**
 * Audit log service for tracking user actions.
 * VERIFY: AE-AUDIT-001 — audit log records with tenant scoping
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(tenantId: string, userId: string | null, action: string, entity: string, entityId?: string, metadata?: Record<string, unknown>) {
    const entry = await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action,
        entity,
        entityId,
        metadata: (metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
    this.logger.log(`Audit: ${action} on ${entity} by user ${userId}`);
    return entry;
  }

  async findAll(tenantId: string, page?: number, limit?: number) {
    const { skip, take } = getPaginationParams(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where: { tenantId } }),
    ]);
    return createPaginatedResult(data, total, page ?? 1, take);
  }
}
