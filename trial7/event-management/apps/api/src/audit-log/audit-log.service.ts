import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateAuditLogDto } from './audit-log.dto';
import { clampPagination } from '@event-management/shared';

// TRACED:EM-AUD-002
@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAuditLogDto, userId: string, tenantId: string) {
    return this.prisma.auditLog.create({
      data: {
        action: dto.action as 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN',
        entity: dto.entity,
        entityId: dto.entityId,
        details: dto.details,
        userId,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, page?: string, pageSize?: string) {
    const pagination = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { tenantId },
        include: { user: true },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where: { tenantId } }),
    ]);
    return { data, total, page: pagination.page, pageSize: pagination.pageSize };
  }
}
