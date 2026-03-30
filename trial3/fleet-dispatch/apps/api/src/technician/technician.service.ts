import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { Prisma } from '@prisma/client';
import { clampPagination } from '@fleet-dispatch/shared';
import type { CreateTechnicianDto } from './dto/create-technician.dto';
import type { UpdateTechnicianDto } from './dto/update-technician.dto';

// TRACED:FD-TECH-001
@Injectable()
export class TechnicianService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateTechnicianDto) {
    return this.prisma.technician.create({
      data: {
        userId: dto.userId,
        companyId,
        skills: dto.skills ?? [],
      },
      include: { user: true },
    });
  }

  async findAll(companyId: string, page?: number, pageSize?: number) {
    const { page: p, pageSize: ps } = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.technician.findMany({
        where: { companyId },
        include: { user: true, workOrders: { where: { status: { not: 'COMPLETED' } } } },
        skip: (p - 1) * ps,
        take: ps,
      }),
      this.prisma.technician.count({ where: { companyId } }),
    ]);
    return {
      data,
      meta: {
        page: p,
        pageSize: ps,
        total,
        totalPages: Math.ceil(total / ps),
      },
    };
  }

  async findOne(companyId: string, id: string) {
    const technician = await this.prisma.technician.findUnique({
      where: { id },
      include: { user: true, workOrders: true },
    });
    if (!technician || technician.companyId !== companyId) {
      throw new NotFoundException('Technician not found');
    }
    return technician;
  }

  async update(companyId: string, id: string, dto: UpdateTechnicianDto) {
    const existing = await this.findOne(companyId, id);
    return this.prisma.technician.update({
      where: { id: existing.id },
      data: {
        skills: dto.skills,
        isAvailable: dto.isAvailable,
        latitude: dto.latitude !== undefined
          ? new Prisma.Decimal(dto.latitude)
          : undefined,
        longitude: dto.longitude !== undefined
          ? new Prisma.Decimal(dto.longitude)
          : undefined,
      },
      include: { user: true },
    });
  }

  async remove(companyId: string, id: string) {
    const existing = await this.findOne(companyId, id);
    return this.prisma.technician.delete({ where: { id: existing.id } });
  }

  async findAvailable(companyId: string) {
    return this.prisma.technician.findMany({
      where: { companyId, isAvailable: true },
      include: { user: true },
    });
  }
}
