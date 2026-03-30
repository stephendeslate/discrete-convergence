// TRACED:AUDIT-SVC — Audit log service
// TRACED:AUDIT-ACTIONS — AuditAction enum: CREATE, UPDATE, DELETE, LOGIN, EXPORT (VERIFY:AUDIT-ACTIONS)
// TRACED:AUDIT-IMMUTABLE — audit logs are append-only, no update/delete methods (VERIFY:AUDIT-IMMUTABLE)
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { getPrismaSkipTake, paginateResponse } from '../common/pagination.utils';
import { PaginatedResult } from '@repo/shared';
import { AuditLog, AuditAction } from '@prisma/client';

/**
 * Audit log service for recording and querying audit events.
 * TRACED:AE-AL-001 — Audit log service
 */
@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * TRACED:AE-AL-002 — Audit log list with pagination
   */
  async findAll(
    tenantId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<AuditLog>> {
    const { skip, take } = getPrismaSkipTake(page, limit);

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where: { tenantId } }),
    ]);

    return paginateResponse(data, total, page, limit);
  }

  /**
   * Create an audit log entry.
   * TRACED:AE-AL-003 — Audit log creation with action validation
   */
  async create(
    action: AuditAction,
    entity: string,
    entityId: string,
    userId: string,
    tenantId: string,
    details?: Record<string, unknown>,
  ): Promise<AuditLog> {
    if (!entity || !entityId) {
      throw new Error('Entity and entityId are required for audit logging');
    }

    return this.prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        userId,
        tenantId,
        details: (details ?? undefined) as undefined | Record<string, string | number | boolean | null>,
      },
    });
  }
}
