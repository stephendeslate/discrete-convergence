import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { Prisma } from '@prisma/client';
import { clampPagination } from '@fleet-dispatch/shared';
import type { CreateCustomerDto } from './dto/create-customer.dto';
import type { UpdateCustomerDto } from './dto/update-customer.dto';

// TRACED:FD-CUST-001
@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: {
        userId: dto.userId,
        companyId,
        phone: dto.phone,
        address: dto.address,
        latitude: dto.latitude !== undefined
          ? new Prisma.Decimal(dto.latitude)
          : undefined,
        longitude: dto.longitude !== undefined
          ? new Prisma.Decimal(dto.longitude)
          : undefined,
      },
      include: { user: true },
    });
  }

  async findAll(companyId: string, page?: number, pageSize?: number) {
    const { page: p, pageSize: ps } = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({
        where: { companyId },
        include: { user: true },
        skip: (p - 1) * ps,
        take: ps,
      }),
      this.prisma.customer.count({ where: { companyId } }),
    ]);
    return {
      data,
      meta: {
        page: p,
        pageSize: ps,
        total,
        totalPages: Math.ceil(total / ps),
      },
    };
  }

  async findOne(companyId: string, id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: { user: true, workOrders: true },
    });
    if (!customer || customer.companyId !== companyId) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async update(companyId: string, id: string, dto: UpdateCustomerDto) {
    const existing = await this.findOne(companyId, id);
    return this.prisma.customer.update({
      where: { id: existing.id },
      data: {
        phone: dto.phone,
        address: dto.address,
        latitude: dto.latitude !== undefined
          ? new Prisma.Decimal(dto.latitude)
          : undefined,
        longitude: dto.longitude !== undefined
          ? new Prisma.Decimal(dto.longitude)
          : undefined,
      },
      include: { user: true },
    });
  }

  async remove(companyId: string, id: string) {
    const existing = await this.findOne(companyId, id);
    return this.prisma.customer.delete({ where: { id: existing.id } });
  }
}
