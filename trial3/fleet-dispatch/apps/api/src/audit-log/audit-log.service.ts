import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { Prisma } from '@prisma/client';
import { clampPagination } from '@fleet-dispatch/shared';

// TRACED:FD-AUDIT-001
@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string, page?: number, pageSize?: number) {
    const { page: p, pageSize: ps } = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { companyId },
        skip: (p - 1) * ps,
        take: ps,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where: { companyId } }),
    ]);
    return {
      data,
      meta: {
        page: p,
        pageSize: ps,
        total,
        totalPages: Math.ceil(total / ps),
      },
    };
  }

  async create(
    companyId: string,
    entityType: string,
    entityId: string,
    action: string,
    performedBy: string,
    changes?: Prisma.InputJsonValue,
  ) {
    return this.prisma.auditLog.create({
      data: {
        companyId,
        entityType,
        entityId,
        action,
        performedBy,
        changes,
      },
    });
  }

  // TRACED:FD-DA-001
  async purgeOldLogs(companyId: string, beforeDate: Date) {
    const result = await this.prisma.$executeRaw(
      Prisma.sql`DELETE FROM audit_logs WHERE company_id = ${companyId} AND created_at < ${beforeDate}`,
    );
    return { deleted: result };
  }
}
