import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../infra/prisma.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { getPagination } from '../common/pagination.utils';
import { AuditAction } from '@prisma/client';

// TRACED:AE-AUDIT-002
@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAuditLogDto, userId: string, tenantId: string) {
    return this.prisma.auditLog.create({
      data: {
        action: dto.action as AuditAction,
        entity: dto.entity,
        entityId: dto.entityId,
        details: (dto.details ?? {}) as Prisma.InputJsonValue,
        userId,
        tenantId,
      },
      include: { user: { select: { id: true, email: true, name: true } } },
    });
  }

  async findAll(tenantId: string, page?: string, pageSize?: string) {
    const pagination = getPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { tenantId },
        include: { user: { select: { id: true, email: true, name: true } } },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where: { tenantId } }),
    ]);
    return { data, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async findByEntity(entity: string, entityId: string, tenantId: string) {
    return this.prisma.auditLog.findMany({
      where: { entity, entityId, tenantId },
      include: { user: { select: { id: true, email: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
