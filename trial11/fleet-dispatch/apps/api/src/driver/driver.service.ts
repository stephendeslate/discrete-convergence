import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { getPagination } from '../common/pagination.utils';

// TRACED: FD-API-003
@Injectable()
export class DriverService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDriverDto) {
    return this.prisma.driver.create({
      data: {
        name: dto.name,
        licenseNumber: dto.licenseNumber,
        phone: dto.phone,
        status: dto.status,
        userId: dto.userId,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const pagination = getPagination(page, pageSize);
    return this.prisma.driver.findMany({
      where: { tenantId },
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    // findFirst justified: composite filter on id + tenantId for tenant isolation;
    // findUnique only supports @id or @unique fields
    const driver = await this.prisma.driver.findFirst({
      where: { id, tenantId },
      include: { dispatches: true },
    });
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }
    return driver;
  }

  async update(tenantId: string, id: string, dto: UpdateDriverDto) {
    await this.findOne(tenantId, id);
    return this.prisma.driver.update({
      where: { id },
      data: dto,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.driver.delete({ where: { id } });
  }
}
