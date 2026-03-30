import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { parsePagination } from '@repo/shared';

// TRACED: FD-MAINT-001
@Injectable()
export class MaintenanceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page?: number, limit?: number) {
    const { skip, limit: take } = parsePagination(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.maintenanceRecord.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { performedAt: 'desc' },
        include: { vehicle: true },
      }),
      this.prisma.maintenanceRecord.count({ where: { tenantId } }),
    ]);
    return { data, total, page: page ?? 1, limit: take };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst used because we scope by both id and tenantId for tenant isolation
    const record = await this.prisma.maintenanceRecord.findFirst({
      where: { id, tenantId },
      include: { vehicle: true },
    });
    if (!record) {
      throw new NotFoundException('Maintenance record not found');
    }
    return record;
  }

  async create(dto: CreateMaintenanceDto, tenantId: string) {
    return this.prisma.maintenanceRecord.create({
      data: {
        vehicleId: dto.vehicleId,
        description: dto.description,
        cost: dto.cost,
        performedAt: new Date(dto.performedAt),
        tenantId,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.maintenanceRecord.delete({ where: { id } });
  }
}
