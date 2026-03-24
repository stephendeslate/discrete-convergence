// TRACED:FD-CUST-001
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { clampPage, clampLimit, paginationMeta } from 'shared';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string, page?: number, limit?: number) {
    const p = clampPage(page);
    const l = clampLimit(limit);

    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({
        where: { companyId },
        skip: (p - 1) * l,
        take: l,
        orderBy: { name: 'asc' },
      }),
      this.prisma.customer.count({ where: { companyId } }),
    ]);

    return { data, ...paginationMeta(total, p, l) };
  }

  async findById(id: string, companyId: string) {
    // findFirst justified: ID + company scope for tenant isolation
    const customer = await this.prisma.customer.findFirst({
      where: { id, companyId },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async getWorkOrders(id: string, companyId: string) {
    await this.findById(id, companyId);
    return this.prisma.workOrder.findMany({
      where: { customerId: id, companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: { name: string; email: string; phone?: string; address: string; city: string; state: string; zip: string; latitude?: number; longitude?: number }, companyId: string) {
    return this.prisma.customer.create({
      data: { ...data, companyId },
    });
  }
}
