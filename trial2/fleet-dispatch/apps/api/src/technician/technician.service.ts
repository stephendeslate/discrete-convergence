import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { clampPagination } from '@fleet-dispatch/shared';

/**
 * Technician service — CRUD, availability, and schedule management.
 * TRACED:FD-TECH-001
 */
@Injectable()
export class TechnicianService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateTechnicianDto) {
    return this.prisma.technician.create({
      data: {
        companyId,
        userId: dto.userId,
        skills: dto.skills ?? [],
      },
      include: { user: true },
    });
  }

  async findAll(companyId: string, page?: number, pageSize?: number) {
    const { page: validPage, take, skip } = clampPagination(page, pageSize);

    const [data, total] = await Promise.all([
      this.prisma.technician.findMany({
        where: { companyId },
        include: { user: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.technician.count({ where: { companyId } }),
    ]);

    return {
      data,
      meta: { page: validPage, pageSize: take, total, totalPages: Math.ceil(total / take) },
    };
  }

  async findOne(companyId: string, id: string) {
    // findFirst: filtering by both companyId and id for tenant isolation
    const technician = await this.prisma.technician.findFirst({
      where: { id, companyId },
      include: { user: true, workOrders: true },
    });

    if (!technician) {
      throw new NotFoundException('Technician not found');
    }

    return technician;
  }

  async update(companyId: string, id: string, dto: UpdateTechnicianDto) {
    await this.findOne(companyId, id);

    return this.prisma.technician.update({
      where: { id },
      data: {
        skills: dto.skills,
        isAvailable: dto.isAvailable,
      },
      include: { user: true },
    });
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    return this.prisma.technician.delete({ where: { id } });
  }

  async findAvailable(companyId: string) {
    return this.prisma.technician.findMany({
      where: { companyId, isAvailable: true },
      include: { user: true },
    });
  }

  async getSchedule(companyId: string, id: string) {
    await this.findOne(companyId, id);

    return this.prisma.workOrder.findMany({
      where: {
        companyId,
        technicianId: id,
        status: { in: ['ASSIGNED', 'EN_ROUTE', 'ON_SITE', 'IN_PROGRESS'] },
      },
      include: { customer: true },
      orderBy: { scheduledAt: 'asc' },
    });
  }
}
