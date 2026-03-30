import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { WorkOrderStatus } from '@prisma/client';
import { PrismaService } from '../common/services/prisma.service';
import { clampPagination } from '@fleet-dispatch/shared';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';

// TRACED:FD-DM-002 — Work order 9-state machine with valid transitions
const VALID_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  UNASSIGNED: [WorkOrderStatus.ASSIGNED, WorkOrderStatus.CANCELLED],
  ASSIGNED: [WorkOrderStatus.EN_ROUTE, WorkOrderStatus.CANCELLED],
  EN_ROUTE: [WorkOrderStatus.ON_SITE, WorkOrderStatus.CANCELLED],
  ON_SITE: [WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.CANCELLED],
  IN_PROGRESS: [WorkOrderStatus.COMPLETED, WorkOrderStatus.CANCELLED],
  COMPLETED: [WorkOrderStatus.INVOICED, WorkOrderStatus.CANCELLED],
  INVOICED: [WorkOrderStatus.PAID, WorkOrderStatus.CANCELLED],
  PAID: [],
  CANCELLED: [],
};

@Injectable()
export class WorkOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateWorkOrderDto) {
    return this.prisma.workOrder.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        technicianId: dto.technicianId,
        customerId: dto.customerId,
        companyId,
      },
      include: { technician: true, customer: true },
    });
  }

  // TRACED:FD-PERF-003 — Pagination with clampPagination and Cache-Control
  async findAll(companyId: string, page?: number, requestedPageSize?: number) {
    const { pageSize: clampedSize, skip } = clampPagination(page, requestedPageSize);
    const [orders, totalOrders] = await Promise.all([
      this.prisma.workOrder.findMany({
        where: { companyId },
        include: { technician: true, customer: true },
        skip,
        take: clampedSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.workOrder.count({ where: { companyId } }),
    ]);
    return { data: orders, total: totalOrders, page: page ?? 1, pageSize: clampedSize };
  }

  async findOne(companyId: string, orderId: string) {
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id: orderId },
      include: { technician: true, customer: true, photos: true },
    });

    if (!workOrder || workOrder.companyId !== companyId) {
      throw new NotFoundException('Work order not found');
    }

    return workOrder;
  }

  async update(companyId: string, id: string, dto: UpdateWorkOrderDto) {
    const currentOrder = await this.findOne(companyId, id);
    return this.prisma.workOrder.update({
      where: { id: currentOrder.id },
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        technicianId: dto.technicianId,
        customerId: dto.customerId,
      },
      include: { technician: true, customer: true },
    });
  }

  async updateStatus(companyId: string, id: string, newStatus: WorkOrderStatus) {
    const currentOrder = await this.findOne(companyId, id);
    const validNext = VALID_TRANSITIONS[currentOrder.status];

    if (!validNext.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentOrder.status} to ${newStatus}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      return tx.workOrder.update({
        where: { id: currentOrder.id },
        data: {
          status: newStatus,
          completedAt: newStatus === WorkOrderStatus.COMPLETED ? new Date() : undefined,
        },
        include: { technician: true, customer: true },
      });
    });
  }

  async delete(companyId: string, orderId: string) {
    const orderToDelete = await this.findOne(companyId, orderId);
    await this.prisma.workOrder.delete({ where: { id: orderToDelete.id } });
    return { deleted: true };
  }
}
