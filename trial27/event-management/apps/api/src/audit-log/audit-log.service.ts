// TRACED: EM-API-007 — AuditLog service
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getPaginationParams, paginate, PaginatedResult } from '../common/pagination.utils';
import { AuditLog } from '@prisma/client';

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    page?: string,
    pageSize?: string,
  ): Promise<PaginatedResult<AuditLog>> {
    const { skip, take, page: p, pageSize: ps } = getPaginationParams(page, pageSize);

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where: { tenantId } }),
    ]);

    return paginate(data, total, p, ps);
  }

  async create(params: {
    tenantId: string;
    action: string;
    entity: string;
    entityId: string;
    userId?: string;
    metadata?: string;
  }): Promise<AuditLog> {
    const log = await this.prisma.auditLog.create({ data: params });
    this.logger.log(`Audit log: ${params.action} on ${params.entity}:${params.entityId}`);
    return log;
  }
}
