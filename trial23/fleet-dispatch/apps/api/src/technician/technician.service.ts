// TRACED: FD-API-002 — CRUD with tenant scoping
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { paginate, clampPagination, PaginatedResult } from '../common/pagination.utils';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';

@Injectable()
export class TechnicianService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateTechnicianDto) {
    await this.prisma.setTenantContext(companyId);
    return this.prisma.technician.create({
      data: { ...dto, companyId },
    });
  }

  async findAll(companyId: string, page?: number, limit?: number): Promise<PaginatedResult<unknown>> {
    await this.prisma.setTenantContext(companyId);
    const clamped = clampPagination(page, limit);

    const [data, total] = await Promise.all([
      this.prisma.technician.findMany({
        where: { companyId },
        skip: clamped.offset,
        take: clamped.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.technician.count({ where: { companyId } }),
    ]);

    return paginate(data, total, page, limit);
  }

  async findOne(companyId: string, id: string) {
    await this.prisma.setTenantContext(companyId);
    const technician = await this.prisma.technician.findFirst({
      where: { id, companyId },
    });

    if (!technician) {
      throw new NotFoundException(`Technician ${id} not found`);
    }

    return technician;
  }

  async update(companyId: string, id: string, dto: UpdateTechnicianDto) {
    await this.findOne(companyId, id);
    await this.prisma.setTenantContext(companyId);
    return this.prisma.technician.update({
      where: { id },
      data: dto,
    });
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    await this.prisma.setTenantContext(companyId);
    return this.prisma.technician.delete({ where: { id } });
  }
}
