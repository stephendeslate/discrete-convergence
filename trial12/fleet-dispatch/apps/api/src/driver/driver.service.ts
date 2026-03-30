// TRACED: FD-DRV-003
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { DriverStatus, Prisma } from '@prisma/client';
import { getPaginationParams } from '../common/pagination.utils';

@Injectable()
export class DriverService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDriverDto) {
    return this.prisma.driver.create({
      data: {
        name: dto.name,
        licenseNumber: dto.licenseNumber,
        phone: dto.phone,
        email: dto.email,
        costPerMile: new Prisma.Decimal(dto.costPerMile),
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, page?: number, limit?: number) {
    const { skip, take } = getPaginationParams(page, limit);
    return this.prisma.driver.findMany({
      where: { tenantId },
      skip,
      take,
      include: { dispatches: true },
      orderBy: { createdAt: 'desc' },
    });
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
        ...dto,
        status: dto.status ? (dto.status as DriverStatus) : undefined,
        costPerMile: dto.costPerMile !== undefined ? new Prisma.Decimal(dto.costPerMile) : undefined,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.driver.delete({ where: { id } });
  }
}
