import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import {
  parsePagination,
  paginatedResponse,
  PaginatedResponse,
} from '../common/pagination.utils';
import { AuditLog } from '@prisma/client';

// TRACED: AE-API-008 — Audit log
// TRACED: AE-DATA-007 — AuditLog model

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    page?: number,
    pageSize?: number,
  ): Promise<PaginatedResponse<AuditLog>> {
    const pagination = parsePagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { tenantId },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where: { tenantId } }),
    ]);

    return paginatedResponse(data, total, pagination);
  }

  async create(
    tenantId: string,
    action: string,
    entity: string,
    entityId?: string,
    userId?: string,
    metadata?: Record<string, unknown>,
  ): Promise<AuditLog> {
    return this.prisma.auditLog.create({
      data: { tenantId, action, entity, entityId, userId, metadata: metadata as object | undefined },
    });
  }
}
