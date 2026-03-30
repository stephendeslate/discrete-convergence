import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateDispatchDto } from './dto/create-dispatch.dto';
import { UpdateDispatchDto } from './dto/update-dispatch.dto';
import { getPagination } from '../common/pagination.utils';

// TRACED: FD-API-005
@Injectable()
export class DispatchService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDispatchDto) {
    return this.prisma.dispatch.create({
      data: {
        vehicleId: dto.vehicleId,
        driverId: dto.driverId,
        origin: dto.origin,
        destination: dto.destination,
        status: dto.status,
        scheduledAt: new Date(dto.scheduledAt),
        cost: dto.cost ?? 0,
        notes: dto.notes,
        tenantId,
      },
      include: { vehicle: true, driver: true },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const pagination = getPagination(page, pageSize);
    return this.prisma.dispatch.findMany({
      where: { tenantId },
      include: { vehicle: true, driver: true },
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    // findFirst justified: composite filter on id + tenantId for tenant isolation;
    // findUnique only supports @id or @unique fields
    const dispatch = await this.prisma.dispatch.findFirst({
      where: { id, tenantId },
      include: { vehicle: true, driver: true },
    });
    if (!dispatch) {
      throw new NotFoundException('Dispatch not found');
    }
    return dispatch;
  }

  async update(tenantId: string, id: string, dto: UpdateDispatchDto) {
    await this.findOne(tenantId, id);
    return this.prisma.dispatch.update({
      where: { id },
      data: {
        ...dto,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        completedAt: dto.completedAt ? new Date(dto.completedAt) : undefined,
      },
      include: { vehicle: true, driver: true },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.dispatch.delete({ where: { id } });
  }
}
