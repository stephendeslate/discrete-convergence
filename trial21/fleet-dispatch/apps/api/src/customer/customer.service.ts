import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { DEFAULT_PAGE_SIZE } from '@fleet-dispatch/shared';
import { buildPaginatedResult } from '../common/pagination.utils';
import pino from 'pino';

const logger = pino({ name: 'customer-service' });

/**
 * Customer CRUD and work order lookup.
 * TRACED: FD-CUST-001
 */
@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, companyId: string, dto: CreateCustomerDto) {
    const customer = await this.prisma.customer.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        latitude: dto.latitude,
        longitude: dto.longitude,
        companyId,
        tenantId,
      },
    });
    logger.info({ customerId: customer.id }, 'Customer created');
    return customer;
  }

  async findAll(tenantId: string, page: number = 1, limit: number = DEFAULT_PAGE_SIZE) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({
        where: { tenantId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count({ where: { tenantId } }),
    ]);
    return buildPaginatedResult(data, total, page, limit);
  }

  async findOne(tenantId: string, id: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer || customer.tenantId !== tenantId) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async update(tenantId: string, id: string, dto: UpdateCustomerDto) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer || customer.tenantId !== tenantId) {
      throw new NotFoundException('Customer not found');
    }
    return this.prisma.customer.update({
      where: { id },
      data: dto,
    });
  }

  async getWorkOrders(tenantId: string, id: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer || customer.tenantId !== tenantId) {
      throw new NotFoundException('Customer not found');
    }
    return this.prisma.workOrder.findMany({
      where: { customerId: id, tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
