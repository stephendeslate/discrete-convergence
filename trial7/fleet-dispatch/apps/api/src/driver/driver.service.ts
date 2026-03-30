import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { DriverStatus } from '@prisma/client';
import { clampPagination } from '@fleet-dispatch/shared';

// TRACED:FD-DRV-003
@Injectable()
export class DriverService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDriverDto) {
    return this.prisma.driver.create({
      data: {
        tenantId: dto.tenantId,
        name: dto.name,
        licenseNumber: dto.licenseNumber,
        phone: dto.phone,
      },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const pagination = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.driver.findMany({
        where: { tenantId },
        skip: pagination.skip,
        take: pagination.take,
        include: { dispatches: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.driver.count({ where: { tenantId } }),
    ]);
    return { data, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async findOne(id: string, tenantId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { id },
      include: { dispatches: true },
    });
    if (!driver || driver.tenantId !== tenantId) {
      throw new NotFoundException('Driver not found');
    }
    return driver;
  }

  async update(id: string, tenantId: string, dto: UpdateDriverDto) {
    await this.findOne(id, tenantId);
    return this.prisma.driver.update({
      where: { id },
      data: {
        ...dto,
        status: dto.status ? (dto.status as DriverStatus) : undefined,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.driver.delete({ where: { id } });
  }
}
