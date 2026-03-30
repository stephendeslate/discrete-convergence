// TRACED: FD-DSP-003
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateDispatchDto } from './dto/create-dispatch.dto';
import { UpdateDispatchDto } from './dto/update-dispatch.dto';
import { DispatchStatus, Prisma } from '@prisma/client';
import { getPaginationParams } from '../common/pagination.utils';

@Injectable()
export class DispatchService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDispatchDto) {
    return this.prisma.dispatch.create({
      data: {
        referenceNumber: dto.referenceNumber,
        pickupAddress: dto.pickupAddress,
        deliveryAddress: dto.deliveryAddress,
        cost: new Prisma.Decimal(dto.cost),
        weight: new Prisma.Decimal(dto.weight),
        notes: dto.notes,
        vehicleId: dto.vehicleId,
        driverId: dto.driverId,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        tenantId,
      },
      include: { vehicle: true, driver: true },
    });
  }

  async findAll(tenantId: string, page?: number, limit?: number) {
    const { skip, take } = getPaginationParams(page, limit);
    return this.prisma.dispatch.findMany({
      where: { tenantId },
      skip,
      take,
      include: { vehicle: true, driver: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const dispatch = await this.prisma.dispatch.findUnique({
      where: { id },
      include: { vehicle: true, driver: true },
    });
    if (!dispatch || dispatch.tenantId !== tenantId) {
      throw new NotFoundException('Dispatch not found');
    }
    return dispatch;
  }

  async update(tenantId: string, id: string, dto: UpdateDispatchDto) {
    await this.findOne(tenantId, id);
    return this.prisma.dispatch.update({
      where: { id },
      data: {
        pickupAddress: dto.pickupAddress,
        deliveryAddress: dto.deliveryAddress,
        status: dto.status ? (dto.status as DispatchStatus) : undefined,
        cost: dto.cost !== undefined ? new Prisma.Decimal(dto.cost) : undefined,
        weight: dto.weight !== undefined ? new Prisma.Decimal(dto.weight) : undefined,
        notes: dto.notes,
        vehicleId: dto.vehicleId,
        driverId: dto.driverId,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        deliveredAt: dto.deliveredAt ? new Date(dto.deliveredAt) : undefined,
      },
      include: { vehicle: true, driver: true },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.dispatch.delete({ where: { id } });
  }
}
