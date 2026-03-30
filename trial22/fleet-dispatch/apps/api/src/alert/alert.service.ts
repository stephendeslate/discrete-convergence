import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { AlertSeverity } from '@prisma/client';
import { parsePagination } from '@repo/shared';

// TRACED: FD-ALERT-001
@Injectable()
export class AlertService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page?: number, limit?: number) {
    const { skip, limit: take } = parsePagination(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.alert.findMany({ where: { tenantId }, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.alert.count({ where: { tenantId } }),
    ]);
    return { data, total, page: page ?? 1, limit: take };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst used because we scope by both id and tenantId for tenant isolation
    const alert = await this.prisma.alert.findFirst({ where: { id, tenantId } });
    if (!alert) {
      throw new NotFoundException('Alert not found');
    }
    return alert;
  }

  async create(dto: CreateAlertDto, tenantId: string) {
    return this.prisma.alert.create({
      data: {
        message: dto.message,
        severity: (dto.severity as AlertSeverity) ?? 'LOW',
        tenantId,
      },
    });
  }

  async markRead(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.alert.update({ where: { id }, data: { read: true } });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.alert.delete({ where: { id } });
  }
}
