import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { Prisma, WorkOrderStatus } from '@prisma/client';
import { clampPagination } from '@fleet-dispatch/shared';
import type { CreateWorkOrderDto } from './dto/create-work-order.dto';
import type { UpdateWorkOrderDto } from './dto/update-work-order.dto';

const VALID_TRANSITIONS: Record<string, string[]> = {
  UNASSIGNED: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['EN_ROUTE', 'UNASSIGNED', 'CANCELLED'],
  EN_ROUTE: ['ON_SITE', 'CANCELLED'],
  ON_SITE: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: ['INVOICED', 'CANCELLED'],
  INVOICED: ['PAID', 'CANCELLED'],
  PAID: [],
  CANCELLED: [],
};

// TRACED:FD-WO-001
@Injectable()
export class WorkOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateWorkOrderDto) {
    return this.prisma.workOrder.create({
      data: {
        companyId,
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        technicianId: dto.technicianId,
        customerId: dto.customerId,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        address: dto.address,
        latitude: dto.latitude ? new Prisma.Decimal(dto.latitude) : undefined,
        longitude: dto.longitude
          ? new Prisma.Decimal(dto.longitude)
          : undefined,
        status: dto.technicianId ? 'ASSIGNED' : 'UNASSIGNED',
      },
      include: { technician: true, customer: true },
    });
  }

  async findAll(companyId: string, page?: number, pageSize?: number) {
    const { page: p, pageSize: ps } = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.workOrder.findMany({
        where: { companyId },
        include: { technician: true, customer: true },
        skip: (p - 1) * ps,
        take: ps,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.workOrder.count({ where: { companyId } }),
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
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id },
      include: {
        technician: true,
        customer: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
        photos: true,
      },
    });
    if (!workOrder || workOrder.companyId !== companyId) {
      throw new NotFoundException('Work order not found');
    }
    return workOrder;
  }

  async update(companyId: string, id: string, dto: UpdateWorkOrderDto) {
    const existing = await this.findOne(companyId, id);
    return this.prisma.workOrder.update({
      where: { id: existing.id },
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        technicianId: dto.technicianId,
        customerId: dto.customerId,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        address: dto.address,
        latitude: dto.latitude ? new Prisma.Decimal(dto.latitude) : undefined,
        longitude: dto.longitude
          ? new Prisma.Decimal(dto.longitude)
          : undefined,
      },
      include: { technician: true, customer: true },
    });
  }

  async remove(companyId: string, id: string) {
    const existing = await this.findOne(companyId, id);
    return this.prisma.workOrder.delete({ where: { id: existing.id } });
  }

  // TRACED:FD-WO-002
  async updateStatus(
    companyId: string,
    id: string,
    status: string,
    userId: string,
    note?: string,
  ) {
    const workOrder = await this.findOne(companyId, id);
    const validNextStatuses = VALID_TRANSITIONS[workOrder.status];

    if (!validNextStatuses || !validNextStatuses.includes(status)) {
      throw new BadRequestException(
        `Cannot transition from ${workOrder.status} to ${status}`,
      );
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.workOrder.update({
        where: { id: workOrder.id },
        data: {
          status: status as WorkOrderStatus,
          completedAt: status === 'COMPLETED' ? new Date() : undefined,
        },
        include: { technician: true, customer: true },
      }),
      this.prisma.workOrderStatusHistory.create({
        data: {
          workOrderId: workOrder.id,
          fromStatus: workOrder.status,
          toStatus: status as WorkOrderStatus,
          changedBy: userId,
          note,
        },
      }),
    ]);

    return updated;
  }
}
