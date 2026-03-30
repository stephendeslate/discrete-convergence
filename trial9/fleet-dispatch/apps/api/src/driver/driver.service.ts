import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { DriverStatus, Prisma } from '@prisma/client';
import { parsePagination } from '@fleet-dispatch/shared';

// TRACED: FD-DRV-002
@Injectable()
export class DriverService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDriverDto) {
    return this.prisma.driver.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        licenseNumber: dto.licenseNumber,
        status: (dto.status as DriverStatus) ?? 'AVAILABLE',
        hourlyRate: new Prisma.Decimal(dto.hourlyRate),
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, page?: string, pageSize?: string) {
    const pagination = parsePagination(page, pageSize);
    const [items, total] = await Promise.all([
      this.prisma.driver.findMany({
        where: { tenantId },
        skip: pagination.skip,
        take: pagination.take,
        include: { dispatches: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.driver.count({ where: { tenantId } }),
    ]);

    return { items, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async findOne(tenantId: string, id: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { id },
      include: { dispatches: true },
    });

    if (!driver || driver.tenantId !== tenantId) {
      throw new NotFoundException('Driver not found');
    }

    return driver;
  }

  async update(tenantId: string, id: string, dto: UpdateDriverDto) {
    await this.findOne(tenantId, id);

    return this.prisma.driver.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.licenseNumber !== undefined && { licenseNumber: dto.licenseNumber }),
        ...(dto.status !== undefined && { status: dto.status as DriverStatus }),
        ...(dto.hourlyRate !== undefined && { hourlyRate: new Prisma.Decimal(dto.hourlyRate) }),
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.driver.delete({ where: { id } });
  }
}
