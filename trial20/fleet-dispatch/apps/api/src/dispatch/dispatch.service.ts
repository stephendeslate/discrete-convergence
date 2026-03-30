import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateDispatchDto } from './dto/create-dispatch.dto';
import { UpdateDispatchDto } from './dto/update-dispatch.dto';
import { getSkipTake } from '../common/pagination.utils';
import { DispatchStatus, Prisma } from '@prisma/client';

// TRACED: FD-DISP-002
@Injectable()
export class DispatchService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page?: number, limit?: number) {
    const { skip, take } = getSkipTake(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.dispatch.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { vehicle: true, route: true, driver: true },
      }),
      this.prisma.dispatch.count({ where: { tenantId } }),
    ]);
    return { data, total, page: page ?? 1, limit: take };
  }

  async findOne(id: string, tenantId: string) {
    const dispatch = await this.prisma.dispatch.findUnique({
      where: { id },
      include: { vehicle: true, route: true, driver: true },
    });
    if (!dispatch || dispatch.tenantId !== tenantId) {
      throw new NotFoundException('Dispatch not found');
    }
    return dispatch;
  }

  async create(dto: CreateDispatchDto, tenantId: string) {
    return this.prisma.dispatch.create({
      data: {
        vehicleId: dto.vehicleId,
        routeId: dto.routeId,
        driverId: dto.driverId,
        scheduledAt: new Date(dto.scheduledAt),
        notes: dto.notes,
        status: (dto.status as DispatchStatus) ?? 'PENDING',
        tenantId,
      },
      include: { vehicle: true, route: true, driver: true },
    });
  }

  async update(id: string, dto: UpdateDispatchDto, tenantId: string) {
    await this.findOne(id, tenantId);
    const data: Prisma.DispatchUpdateInput = {};
    if (dto.vehicleId !== undefined) data.vehicle = { connect: { id: dto.vehicleId } };
    if (dto.routeId !== undefined) data.route = { connect: { id: dto.routeId } };
    if (dto.driverId !== undefined) data.driver = { connect: { id: dto.driverId } };
    if (dto.scheduledAt !== undefined) data.scheduledAt = new Date(dto.scheduledAt);
    if (dto.completedAt !== undefined) data.completedAt = new Date(dto.completedAt);
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.cost !== undefined) data.cost = dto.cost;
    if (dto.status !== undefined) data.status = dto.status as DispatchStatus;
    return this.prisma.dispatch.update({
      where: { id },
      data,
      include: { vehicle: true, route: true, driver: true },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dispatch.delete({ where: { id } });
  }
}
