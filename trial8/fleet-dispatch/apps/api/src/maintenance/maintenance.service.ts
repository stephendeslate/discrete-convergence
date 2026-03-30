import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { LoggerService } from '../infra/logger.service';
import { CreateMaintenanceDto, UpdateMaintenanceDto } from './maintenance.dto';
import { getPagination } from '../common/pagination.utils';

@Injectable()
export class MaintenanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async findAll(tenantId: string, query: { page?: number; pageSize?: number }) {
    const { skip, take, page, pageSize } = getPagination(query);
    const where = { tenantId };

    const [data, total] = await Promise.all([
      this.prisma.maintenance.findMany({
        where,
        skip,
        take,
        orderBy: { date: 'desc' },
        include: { vehicle: true },
      }),
      this.prisma.maintenance.count({ where }),
    ]);

    return { data, total, page, pageSize };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: scoped by tenantId for tenant isolation
    const record = await this.prisma.maintenance.findFirst({
      where: { id, tenantId },
      include: { vehicle: true },
    });

    if (!record) {
      throw new NotFoundException('Maintenance record not found');
    }

    return record;
  }

  async create(dto: CreateMaintenanceDto, tenantId: string) {
    const record = await this.prisma.maintenance.create({
      data: {
        vehicleId: dto.vehicleId,
        type: dto.type as 'SCHEDULED' | 'UNSCHEDULED' | 'EMERGENCY',
        cost: dto.cost,
        date: new Date(dto.date),
        notes: dto.notes,
        tenantId,
      },
    });

    this.logger.log(`Maintenance ${record.id} created`, 'MaintenanceService');
    return record;
  }

  async update(id: string, dto: UpdateMaintenanceDto, tenantId: string) {
    // findFirst: scoped by tenantId before update for tenant isolation
    const existing = await this.prisma.maintenance.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Maintenance record not found');
    }

    return this.prisma.maintenance.update({
      where: { id },
      data: {
        ...(dto.type !== undefined && {
          type: dto.type as 'SCHEDULED' | 'UNSCHEDULED' | 'EMERGENCY',
        }),
        ...(dto.cost !== undefined && { cost: dto.cost }),
        ...(dto.date !== undefined && { date: new Date(dto.date) }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });
  }

  async delete(id: string, tenantId: string) {
    // findFirst: scoped by tenantId before delete for tenant isolation
    const existing = await this.prisma.maintenance.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Maintenance record not found');
    }

    await this.prisma.maintenance.delete({ where: { id } });
    return { deleted: true };
  }
}
