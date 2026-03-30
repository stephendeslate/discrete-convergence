import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { TripStatus } from '@prisma/client';
import { parsePagination } from '@repo/shared';

// TRACED: FD-TRIP-001
@Injectable()
export class TripService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page?: number, limit?: number) {
    const { skip, limit: take } = parsePagination(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.trip.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { route: true, vehicle: true, driver: true },
      }),
      this.prisma.trip.count({ where: { tenantId } }),
    ]);
    return { data, total, page: page ?? 1, limit: take };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst used because we scope by both id and tenantId for tenant isolation
    const trip = await this.prisma.trip.findFirst({
      where: { id, tenantId },
      include: { route: true, vehicle: true, driver: true, dispatches: true },
    });
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }
    return trip;
  }

  async create(dto: CreateTripDto, tenantId: string) {
    return this.prisma.trip.create({
      data: {
        routeId: dto.routeId,
        vehicleId: dto.vehicleId,
        driverId: dto.driverId,
        status: (dto.status as TripStatus) ?? 'SCHEDULED',
        startTime: dto.startTime ? new Date(dto.startTime) : null,
        tenantId,
      },
    });
  }

  async update(id: string, dto: UpdateTripDto, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.trip.update({
      where: { id },
      data: {
        ...(dto.status && { status: dto.status as TripStatus }),
        ...(dto.startTime && { startTime: new Date(dto.startTime) }),
        ...(dto.endTime && { endTime: new Date(dto.endTime) }),
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.trip.delete({ where: { id } });
  }
}
