// TRACED:API-MAINTENANCE-SERVICE
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.module';
import { buildPaginatedResponse, buildSkipTake } from '../common/pagination.utils';
import { CreateMaintenanceDto, UpdateMaintenanceDto } from './dto';
import type { PaginatedResult } from '@fleet-dispatch/shared';
import type { Maintenance } from '@prisma/client';

@Injectable()
export class MaintenanceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string, page: number, limit: number): Promise<PaginatedResult<Maintenance>> {
    await this.prisma.setCompanyId(companyId);
    const { skip, take } = buildSkipTake(page, limit);

    const [data, total] = await Promise.all([
      this.prisma.maintenance.findMany({
        where: { companyId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { vehicle: true },
      }),
      this.prisma.maintenance.count({ where: { companyId } }),
    ]);

    return buildPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string, companyId: string): Promise<Maintenance> {
    await this.prisma.setCompanyId(companyId);
    // tenant-scoped query
    const record = await this.prisma.maintenance.findFirst({
      where: { id, companyId },
      include: { vehicle: true },
    });
    if (!record) {
      throw new NotFoundException('Maintenance record not found');
    }
    return record;
  }

  async create(dto: CreateMaintenanceDto, companyId: string): Promise<Maintenance> {
    await this.prisma.setCompanyId(companyId);

    // tenant-scoped query — validate vehicle exists
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: dto.vehicleId, companyId },
    });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return this.prisma.maintenance.create({
      data: {
        vehicleId: dto.vehicleId,
        type: dto.type,
        description: dto.description,
        scheduledDate: new Date(dto.scheduledDate),
        completedDate: dto.completedDate ? new Date(dto.completedDate) : null,
        cost: dto.cost ?? null,
        companyId,
      },
    });
  }

  async update(id: string, dto: UpdateMaintenanceDto, companyId: string): Promise<Maintenance> {
    await this.findOne(id, companyId);

    const data: Record<string, unknown> = {};
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.scheduledDate !== undefined) data.scheduledDate = new Date(dto.scheduledDate);
    if (dto.completedDate !== undefined) data.completedDate = new Date(dto.completedDate);
    if (dto.cost !== undefined) data.cost = dto.cost;

    return this.prisma.maintenance.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, companyId: string): Promise<Maintenance> {
    await this.findOne(id, companyId);
    return this.prisma.maintenance.delete({ where: { id } });
  }
}
