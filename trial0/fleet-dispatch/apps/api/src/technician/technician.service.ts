// TRACED:FD-TECH-001
// TRACED:FD-TECH-002
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { clampPage, clampLimit, paginationMeta } from 'shared';

@Injectable()
export class TechnicianService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string, page?: number, limit?: number) {
    const p = clampPage(page);
    const l = clampLimit(limit);

    const [data, total] = await Promise.all([
      this.prisma.technician.findMany({
        where: { companyId },
        include: { user: true },
        skip: (p - 1) * l,
        take: l,
      }),
      this.prisma.technician.count({ where: { companyId } }),
    ]);

    return { data, ...paginationMeta(total, p, l) };
  }

  async findAvailable(companyId: string) {
    return this.prisma.technician.findMany({
      where: { companyId, isAvailable: true },
      include: { user: true },
    });
  }

  async findById(id: string, companyId: string) {
    // findFirst justified: ID + company scope for tenant isolation
    const tech = await this.prisma.technician.findFirst({
      where: { id, companyId },
      include: { user: true, workOrders: { where: { status: { notIn: ['COMPLETED', 'CANCELLED', 'PAID'] } } } },
    });
    if (!tech) throw new NotFoundException('Technician not found');
    return tech;
  }

  async updatePosition(id: string, latitude: number, longitude: number) {
    return this.prisma.technician.update({
      where: { id },
      data: { latitude, longitude, lastGpsAt: new Date() },
    });
  }

  async getSchedule(id: string, companyId: string, date: Date) {
    await this.findById(id, companyId);

    return this.prisma.workOrder.findMany({
      where: {
        technicianId: id,
        companyId,
        status: { notIn: ['COMPLETED', 'CANCELLED', 'PAID'] },
        scheduledStart: {
          gte: new Date(date.toISOString().split('T')[0] ?? ''),
          lt: new Date(new Date(date.toISOString().split('T')[0] ?? '').getTime() + 86400000),
        },
      },
      include: { customer: true },
      orderBy: { scheduledStart: 'asc' },
    });
  }
}
