import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { buildPagination } from '../common/pagination.utils';
import type { AuditLog } from '@prisma/client';

/** TRACED:EM-AUD-001 — Audit log service */
@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string, page: number, limit: number): Promise<{ data: AuditLog[]; total: number }> {
    const { skip, take } = buildPagination(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { organizationId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where: { organizationId } }),
    ]);
    return { data, total };
  }

  async create(params: {
    action: string;
    entityType: string;
    entityId: string;
    userId: string;
    organizationId: string;
    metadata?: string;
  }): Promise<AuditLog> {
    return this.prisma.auditLog.create({ data: params });
  }
}
