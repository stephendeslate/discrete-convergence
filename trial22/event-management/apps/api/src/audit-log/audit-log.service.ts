import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { clampPagination, getPaginationSkip } from '@repo/shared';

// TRACED: EM-AUDIT-001
@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: { page?: number; limit?: number }) {
    const pagination = clampPagination(query);
    const skip = getPaginationSkip(pagination);
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({ where: { tenantId }, skip, take: pagination.limit, include: { user: true }, orderBy: { createdAt: 'desc' } }),
      this.prisma.auditLog.count({ where: { tenantId } }),
    ]);
    return { data, total, page: pagination.page, limit: pagination.limit };
  }

  async create(tenantId: string, data: { action: string; entity: string; entityId: string; userId?: string; metadata?: string }) {
    return this.prisma.auditLog.create({
      data: {
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        userId: data.userId,
        metadata: data.metadata,
        tenantId,
      },
    });
  }
}
