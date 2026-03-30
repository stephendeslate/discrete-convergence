import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { clampPagination } from '@fleet-dispatch/shared';

/**
 * Customer service — CRUD operations.
 * TRACED:FD-CUST-001
 */
@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: {
        companyId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
      },
    });
  }

  async findAll(companyId: string, page?: number, pageSize?: number) {
    const { page: validPage, take, skip } = clampPagination(page, pageSize);

    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({
        where: { companyId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count({ where: { companyId } }),
    ]);

    return {
      data,
      meta: { page: validPage, pageSize: take, total, totalPages: Math.ceil(total / take) },
    };
  }

  async findOne(companyId: string, id: string) {
    // findFirst: filtering by companyId + id for multi-tenant isolation
    const customer = await this.prisma.customer.findFirst({
      where: { id, companyId },
      include: { workOrders: true },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async update(companyId: string, id: string, dto: UpdateCustomerDto) {
    await this.findOne(companyId, id);

    return this.prisma.customer.update({
      where: { id },
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
      },
    });
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    return this.prisma.customer.delete({ where: { id } });
  }
}
