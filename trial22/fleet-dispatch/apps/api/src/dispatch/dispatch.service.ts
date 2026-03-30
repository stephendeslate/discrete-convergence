import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateDispatchDto } from './dto/create-dispatch.dto';
import { UpdateDispatchDto } from './dto/update-dispatch.dto';
import { DispatchStatus } from '@prisma/client';
import { parsePagination } from '@repo/shared';

// TRACED: FD-DISP-001
@Injectable()
export class DispatchService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page?: number, limit?: number) {
    const { skip, limit: take } = parsePagination(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.dispatch.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { trip: true },
      }),
      this.prisma.dispatch.count({ where: { tenantId } }),
    ]);
    return { data, total, page: page ?? 1, limit: take };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst used because we scope by both id and tenantId for tenant isolation
    const dispatch = await this.prisma.dispatch.findFirst({
      where: { id, tenantId },
      include: { trip: { include: { route: true, vehicle: true, driver: true } } },
    });
    if (!dispatch) {
      throw new NotFoundException('Dispatch not found');
    }
    return dispatch;
  }

  async create(dto: CreateDispatchDto, tenantId: string) {
    return this.prisma.dispatch.create({
      data: {
        tripId: dto.tripId,
        notes: dto.notes,
        priority: dto.priority ?? 0,
        status: (dto.status as DispatchStatus) ?? 'PENDING',
        tenantId,
      },
    });
  }

  async update(id: string, dto: UpdateDispatchDto, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dispatch.update({
      where: { id },
      data: {
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
        ...(dto.status && { status: dto.status as DispatchStatus }),
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dispatch.delete({ where: { id } });
  }
}
