import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { clampPagination } from '@fleet-dispatch/shared';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        companyId,
      },
    });
  }

  async findAll(companyId: string, page?: number, customerPageSize?: number) {
    const { pageSize: perPage, skip: startAt } = clampPagination(page, customerPageSize);
    const [customers, customerCount] = await Promise.all([
      this.prisma.customer.findMany({
        where: { companyId },
        skip: startAt,
        take: perPage,
        orderBy: { name: 'asc' },
      }),
      this.prisma.customer.count({ where: { companyId } }),
    ]);
    return { data: customers, total: customerCount, page: page ?? 1, pageSize: perPage };
  }

  async findOne(companyId: string, customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      include: { workOrders: true },
    });

    if (!customer || customer.companyId !== companyId) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async update(companyId: string, id: string, dto: UpdateCustomerDto) {
    const customerToUpdate = await this.findOne(companyId, id);
    return this.prisma.customer.update({
      where: { id: customerToUpdate.id },
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
      },
    });
  }

  async delete(companyId: string, customerId: string) {
    const customerToRemove = await this.findOne(companyId, customerId);
    await this.prisma.customer.delete({ where: { id: customerToRemove.id } });
    return { deleted: true };
  }
}
