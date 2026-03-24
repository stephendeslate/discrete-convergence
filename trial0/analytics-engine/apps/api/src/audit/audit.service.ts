import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { clampPagination, getPaginationSkip } from '@analytics-engine/shared';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const pagination = clampPagination(page, pageSize);
    const skip = getPaginationSkip(pagination);

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { tenantId },
        skip,
        take: pagination.pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where: { tenantId } }),
    ]);

    return { items, total, page: pagination.page, pageSize: pagination.pageSize };
  }
}
