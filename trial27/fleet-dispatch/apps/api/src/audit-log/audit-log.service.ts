// TRACED: FD-API-009 — Audit log service with tenant-scoped reads
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { paginate, buildPaginatedResult } from '../common/pagination.utils';

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const { skip, take, page: p, pageSize: ps } = paginate(page, pageSize);

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where: { tenantId } }),
    ]);

    return buildPaginatedResult(data, total, p, ps);
  }

  async log(
    tenantId: string,
    action: string,
    entity: string,
    entityId: string,
    userId?: string,
    metadata?: Record<string, unknown>,
  ) {
    return this.prisma.auditLog.create({
      data: {
        tenantId,
        action,
        entity,
        entityId,
        userId,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  }
}
