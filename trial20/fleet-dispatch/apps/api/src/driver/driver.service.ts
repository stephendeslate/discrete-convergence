import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { getSkipTake } from '../common/pagination.utils';
import { DriverStatus, Prisma } from '@prisma/client';

// TRACED: FD-DRV-002
@Injectable()
export class DriverService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page?: number, limit?: number) {
    const { skip, take } = getSkipTake(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.driver.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.driver.count({ where: { tenantId } }),
    ]);
    return { data, total, page: page ?? 1, limit: take };
  }

  async findOne(id: string, tenantId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { id },
    });
    if (!driver || driver.tenantId !== tenantId) {
      throw new NotFoundException('Driver not found');
    }
    return driver;
  }

  async create(dto: CreateDriverDto, tenantId: string) {
    return this.prisma.driver.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        licenseNumber: dto.licenseNumber,
        phone: dto.phone,
        status: (dto.status as DriverStatus) ?? 'AVAILABLE',
        tenantId,
      },
    });
  }

  async update(id: string, dto: UpdateDriverDto, tenantId: string) {
    await this.findOne(id, tenantId);
    const data: Prisma.DriverUpdateInput = {};
    if (dto.firstName !== undefined) data.firstName = dto.firstName;
    if (dto.lastName !== undefined) data.lastName = dto.lastName;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.licenseNumber !== undefined) data.licenseNumber = dto.licenseNumber;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.status !== undefined) data.status = dto.status as DriverStatus;
    return this.prisma.driver.update({ where: { id }, data });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.driver.delete({ where: { id } });
  }
}
