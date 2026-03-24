import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { clampPagination, getPaginationSkip } from '@event-management/shared';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string, page?: number, limit?: number) {
    const { page: p, limit: l } = clampPagination(page, limit);
    const skip = getPaginationSkip(p, l);
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { organizationId },
        skip,
        take: l,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      }),
      this.prisma.auditLog.count({ where: { organizationId } }),
    ]);
    return { data, total, page: p, limit: l };
  }
}
