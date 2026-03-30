// TRACED:FD-API-003 — TechnicianService CRUD with N+1 prevention
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { clampPagination } from '@fleet-dispatch/shared';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';

@Injectable()
export class TechnicianService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateTechnicianDto) {
    return this.prisma.technician.create({
      data: {
        userId: dto.userId,
        companyId,
        skills: dto.skills ?? [],
        latitude: dto.latitude ? new Prisma.Decimal(dto.latitude) : undefined,
        longitude: dto.longitude ? new Prisma.Decimal(dto.longitude) : undefined,
      },
      include: { user: true },
    });
  }

  async findAll(companyId: string, page?: number, pageSize?: number) {
    const pagination = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.technician.findMany({
        where: { companyId },
        include: { user: true },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.technician.count({ where: { companyId } }),
    ]);
    return { data, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async findOne(companyId: string, id: string) {
    // findFirst: scoped by companyId for tenant isolation
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
        available: dto.available,
        latitude: dto.latitude ? new Prisma.Decimal(dto.latitude) : undefined,
        longitude: dto.longitude ? new Prisma.Decimal(dto.longitude) : undefined,
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
      where: { companyId, available: true },
      include: { user: true },
    });
  }
}
