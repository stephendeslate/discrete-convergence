import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../infra/prisma.service';
import { LoggerService } from '../infra/logger.service';
import { CreateVehicleDto, UpdateVehicleDto } from './vehicle.dto';
import { getPagination } from '../common/pagination.utils';

@Injectable()
export class VehicleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async findAll(tenantId: string, query: { page?: number; pageSize?: number }) {
    const { skip, take, page, pageSize } = getPagination(query);
    const where = { tenantId };

    const [data, total] = await Promise.all([
      this.prisma.vehicle.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.vehicle.count({ where }),
    ]);

    return { data, total, page, pageSize };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: scoped by tenantId for tenant isolation
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id, tenantId },
      include: { trips: true, maintenance: true },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  async create(dto: CreateVehicleDto, tenantId: string) {
    const vehicle = await this.prisma.vehicle.create({
      data: {
        vin: dto.vin,
        make: dto.make,
        model: dto.model,
        year: dto.year,
        mileage: dto.mileage ?? 0,
        tenantId,
      },
    });

    this.logger.log(`Vehicle ${vehicle.id} created`, 'VehicleService');
    return vehicle;
  }

  async update(id: string, dto: UpdateVehicleDto, tenantId: string) {
    // findFirst: scoped by tenantId before update for tenant isolation
    const existing = await this.prisma.vehicle.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Vehicle not found');
    }

    return this.prisma.vehicle.update({
      where: { id },
      data: dto as Prisma.VehicleUpdateInput,
    });
  }

  async delete(id: string, tenantId: string) {
    // findFirst: scoped by tenantId before delete for tenant isolation
    const existing = await this.prisma.vehicle.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Vehicle not found');
    }

    await this.prisma.vehicle.delete({ where: { id } });
    return { deleted: true };
  }

  async getMaintenanceCostReport(tenantId: string) {
    const result = await this.prisma.$executeRaw(
      Prisma.sql`SELECT v.id, v.vin, SUM(m.cost) as total_cost
        FROM vehicles v
        LEFT JOIN maintenance m ON v.id = m.vehicle_id
        WHERE v.tenant_id = ${tenantId}
        GROUP BY v.id, v.vin`,
    );
    return { affectedRows: result };
  }
}
