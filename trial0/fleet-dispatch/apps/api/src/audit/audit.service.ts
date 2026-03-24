import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { clampPage, clampLimit, paginationMeta } from 'shared';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string, page?: number, limit?: number) {
    const p = clampPage(page);
    const l = clampLimit(limit);

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { companyId },
        skip: (p - 1) * l,
        take: l,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where: { companyId } }),
    ]);

    return { data, ...paginationMeta(total, p, l) };
  }

  async log(companyId: string, userId: string, action: string, entity: string, entityId: string, changes?: Record<string, unknown>) {
    return this.prisma.auditLog.create({
      data: {
        companyId,
        userId,
        action,
        entity,
        entityId,
        changes: changes ? JSON.stringify(changes) : undefined,
      },
    });
  }
}
