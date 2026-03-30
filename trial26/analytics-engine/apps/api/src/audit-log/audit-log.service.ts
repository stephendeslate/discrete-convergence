import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { clampPagination } from '../common/pagination.utils';

// TRACED: AE-AUDIT-001 — List audit logs with pagination
// TRACED: AE-AUDIT-002 — Create audit log entry

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page?: number, limit?: number) {
    const { skip, take, page: p, limit: l } = clampPagination(page, limit);

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where: { tenantId } }),
    ]);

    return { data, total, page: p, limit: l, totalPages: Math.ceil(total / l) };
  }

  async create(tenantId: string, userId: string, action: string, entity: string, entityId?: string, metadata?: string) {
    return this.prisma.auditLog.create({
      data: { tenantId, userId, action, entity, entityId, metadata },
    });
  }
}
