import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateFuelLogDto } from './dto/create-fuel-log.dto';
import { parsePagination } from '@repo/shared';

// TRACED: FD-FUEL-001
@Injectable()
export class FuelService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page?: number, limit?: number) {
    const { skip, limit: take } = parsePagination(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.fuelLog.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { filledAt: 'desc' },
        include: { vehicle: true },
      }),
      this.prisma.fuelLog.count({ where: { tenantId } }),
    ]);
    return { data, total, page: page ?? 1, limit: take };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst used because we scope by both id and tenantId for tenant isolation
    const log = await this.prisma.fuelLog.findFirst({
      where: { id, tenantId },
      include: { vehicle: true },
    });
    if (!log) {
      throw new NotFoundException('Fuel log not found');
    }
    return log;
  }

  async create(dto: CreateFuelLogDto, tenantId: string) {
    return this.prisma.fuelLog.create({
      data: {
        vehicleId: dto.vehicleId,
        gallons: dto.gallons,
        costPerUnit: dto.costPerUnit,
        totalCost: dto.totalCost,
        mileage: dto.mileage,
        filledAt: new Date(dto.filledAt),
        tenantId,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.fuelLog.delete({ where: { id } });
  }
}
