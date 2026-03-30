import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { clampPagination } from '@fleet-dispatch/shared';

// TRACED:FD-AUD-002
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAuditLogDto) {
    return this.prisma.auditLog.create({
      data: {
        tenantId: dto.tenantId,
        userId: dto.userId,
        action: dto.action,
        entity: dto.entity,
        entityId: dto.entityId,
        metadata: dto.metadata,
      },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const pagination = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { tenantId },
        skip: pagination.skip,
        take: pagination.take,
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where: { tenantId } }),
    ]);
    return { data, total, page: pagination.page, pageSize: pagination.pageSize };
  }
}
