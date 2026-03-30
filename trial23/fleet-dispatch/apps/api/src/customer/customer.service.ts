// TRACED: FD-API-003 — CRUD with tenant scoping
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { paginate, clampPagination, PaginatedResult } from '../common/pagination.utils';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateCustomerDto) {
    await this.prisma.setTenantContext(companyId);
    return this.prisma.customer.create({
      data: { ...dto, companyId },
    });
  }

  async findAll(companyId: string, page?: number, limit?: number): Promise<PaginatedResult<unknown>> {
    await this.prisma.setTenantContext(companyId);
    const clamped = clampPagination(page, limit);

    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({
        where: { companyId },
        skip: clamped.offset,
        take: clamped.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count({ where: { companyId } }),
    ]);

    return paginate(data, total, page, limit);
  }

  async findOne(companyId: string, id: string) {
    await this.prisma.setTenantContext(companyId);
    const customer = await this.prisma.customer.findFirst({
      where: { id, companyId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer ${id} not found`);
    }

    return customer;
  }

  async update(companyId: string, id: string, dto: UpdateCustomerDto) {
    await this.findOne(companyId, id);
    await this.prisma.setTenantContext(companyId);
    return this.prisma.customer.update({
      where: { id },
      data: dto,
    });
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    await this.prisma.setTenantContext(companyId);
    return this.prisma.customer.delete({ where: { id } });
  }
}
