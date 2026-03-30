import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { parsePagination } from '@repo/shared';

// TRACED: FD-AUDIT-001
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page?: number, limit?: number) {
    const { skip, limit: take } = parsePagination(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, email: true, name: true } } },
      }),
      this.prisma.auditLog.count({ where: { tenantId } }),
    ]);
    return { data, total, page: page ?? 1, limit: take };
  }

  async create(tenantId: string, userId: string, action: string, entity: string, entityId: string, details?: string) {
    return this.prisma.auditLog.create({
      data: { tenantId, userId, action, entity, entityId, details },
    });
  }
}
