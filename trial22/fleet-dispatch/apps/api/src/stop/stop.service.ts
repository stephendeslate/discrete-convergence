import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateStopDto } from './dto/create-stop.dto';
import { parsePagination } from '@repo/shared';

// TRACED: FD-STOP-001
@Injectable()
export class StopService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page?: number, limit?: number) {
    const { skip, limit: take } = parsePagination(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.stop.findMany({ where: { tenantId }, skip, take, orderBy: { sequence: 'asc' } }),
      this.prisma.stop.count({ where: { tenantId } }),
    ]);
    return { data, total, page: page ?? 1, limit: take };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst used because we scope by both id and tenantId for tenant isolation
    const stop = await this.prisma.stop.findFirst({ where: { id, tenantId } });
    if (!stop) {
      throw new NotFoundException('Stop not found');
    }
    return stop;
  }

  async create(dto: CreateStopDto, tenantId: string) {
    return this.prisma.stop.create({
      data: {
        routeId: dto.routeId, name: dto.name, address: dto.address,
        latitude: dto.latitude, longitude: dto.longitude, sequence: dto.sequence, tenantId,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.stop.delete({ where: { id } });
  }
}
