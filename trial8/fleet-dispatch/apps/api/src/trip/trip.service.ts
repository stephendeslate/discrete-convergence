import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { LoggerService } from '../infra/logger.service';
import { CreateTripDto, UpdateTripDto } from './trip.dto';
import { getPagination } from '../common/pagination.utils';

@Injectable()
export class TripService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async findAll(tenantId: string, query: { page?: number; pageSize?: number }) {
    const { skip, take, page, pageSize } = getPagination(query);
    const where = { tenantId };

    const [data, total] = await Promise.all([
      this.prisma.trip.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { vehicle: true, driver: true, route: true },
      }),
      this.prisma.trip.count({ where }),
    ]);

    return { data, total, page, pageSize };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: scoped by tenantId for tenant isolation
    const trip = await this.prisma.trip.findFirst({
      where: { id, tenantId },
      include: { vehicle: true, driver: true, route: true },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    return trip;
  }

  async create(dto: CreateTripDto, tenantId: string) {
    const trip = await this.prisma.trip.create({
      data: {
        vehicleId: dto.vehicleId,
        driverId: dto.driverId,
        routeId: dto.routeId,
        startTime: dto.startTime ? new Date(dto.startTime) : undefined,
        tenantId,
      },
    });

    this.logger.log(`Trip ${trip.id} created`, 'TripService');
    return trip;
  }

  async update(id: string, dto: UpdateTripDto, tenantId: string) {
    // findFirst: scoped by tenantId before update for tenant isolation
    const existing = await this.prisma.trip.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Trip not found');
    }

    return this.prisma.trip.update({
      where: { id },
      data: {
        ...(dto.status !== undefined && {
          status: dto.status as 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
        }),
        ...(dto.startTime !== undefined && { startTime: new Date(dto.startTime) }),
        ...(dto.endTime !== undefined && { endTime: new Date(dto.endTime) }),
      },
    });
  }

  async delete(id: string, tenantId: string) {
    // findFirst: scoped by tenantId before delete for tenant isolation
    const existing = await this.prisma.trip.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Trip not found');
    }

    await this.prisma.trip.delete({ where: { id } });
    return { deleted: true };
  }
}
