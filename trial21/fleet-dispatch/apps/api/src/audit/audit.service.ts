import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { DEFAULT_PAGE_SIZE } from '@fleet-dispatch/shared';
import { buildPaginatedResult } from '../common/pagination.utils';

/**
 * Audit log retrieval for compliance.
 * TRACED: FD-AUDIT-001
 */
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page: number = 1, limit: number = DEFAULT_PAGE_SIZE) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { tenantId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where: { tenantId } }),
    ]);
    return buildPaginatedResult(data, total, page, limit);
  }

  async create(
    tenantId: string,
    companyId: string,
    userId: string,
    action: string,
    entity: string,
    entityId?: string,
    details?: string,
  ) {
    return this.prisma.auditLog.create({
      data: { userId, action, entity, entityId, details, companyId, tenantId },
    });
  }
}
