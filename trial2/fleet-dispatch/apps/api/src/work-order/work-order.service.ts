import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma, WorkOrderStatus } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { clampPagination } from '@fleet-dispatch/shared';

/**
 * Valid work order status transitions — state machine enforcement.
 * TRACED:FD-WO-001
 */
const VALID_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  UNASSIGNED: [WorkOrderStatus.ASSIGNED, WorkOrderStatus.CANCELLED],
  ASSIGNED: [WorkOrderStatus.EN_ROUTE, WorkOrderStatus.UNASSIGNED, WorkOrderStatus.CANCELLED],
  EN_ROUTE: [WorkOrderStatus.ON_SITE, WorkOrderStatus.CANCELLED],
  ON_SITE: [WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.CANCELLED],
  IN_PROGRESS: [WorkOrderStatus.COMPLETED, WorkOrderStatus.CANCELLED],
  COMPLETED: [WorkOrderStatus.INVOICED, WorkOrderStatus.CANCELLED],
  INVOICED: [WorkOrderStatus.PAID, WorkOrderStatus.CANCELLED],
  PAID: [],
  CANCELLED: [],
};

@Injectable()
export class WorkOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateWorkOrderDto) {
    return this.prisma.workOrder.create({
      data: {
        companyId,
        customerId: dto.customerId,
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      },
      include: { customer: true },
    });
  }

  async findAll(companyId: string, page?: number, pageSize?: number) {
    const { page: validPage, take, skip } = clampPagination(page, pageSize);

    const [data, total] = await Promise.all([
      this.prisma.workOrder.findMany({
        where: { companyId },
        include: { customer: true, technician: { include: { user: true } } },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.workOrder.count({ where: { companyId } }),
    ]);

    return {
      data,
      meta: { page: validPage, pageSize: take, total, totalPages: Math.ceil(total / take) },
    };
  }

  async findOne(companyId: string, id: string) {
    // findFirst: filtering by both companyId (tenant isolation) and id — compound where clause
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id, companyId },
      include: {
        customer: true,
        technician: { include: { user: true } },
        statusHistory: { orderBy: { createdAt: 'desc' } },
        photos: true,
        invoice: true,
      },
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    return workOrder;
  }

  async update(companyId: string, id: string, dto: UpdateWorkOrderDto) {
    await this.findOne(companyId, id);

    return this.prisma.workOrder.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      },
      include: { customer: true },
    });
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    return this.prisma.workOrder.delete({ where: { id } });
  }

  /**
   * Transition work order status with state machine validation.
   * TRACED:FD-WO-002
   */
  async updateStatus(
    companyId: string,
    id: string,
    newStatus: WorkOrderStatus,
    changedBy: string,
  ) {
    const workOrder = await this.findOne(companyId, id);
    const currentStatus = workOrder.status;

    const allowedTransitions = VALID_TRANSITIONS[currentStatus];
    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.workOrderStatusHistory.create({
        data: {
          workOrderId: id,
          fromStatus: currentStatus,
          toStatus: newStatus,
          changedBy,
        },
      });

      return tx.workOrder.update({
        where: { id },
        data: {
          status: newStatus,
          completedAt: newStatus === WorkOrderStatus.COMPLETED ? new Date() : undefined,
        },
        include: { customer: true, technician: { include: { user: true } } },
      });
    });
  }

  async assign(companyId: string, id: string, technicianId: string, changedBy: string) {
    const workOrder = await this.findOne(companyId, id);

    if (workOrder.status !== WorkOrderStatus.UNASSIGNED && workOrder.status !== WorkOrderStatus.ASSIGNED) {
      throw new BadRequestException('Work order must be UNASSIGNED or ASSIGNED to reassign');
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (workOrder.status === WorkOrderStatus.UNASSIGNED) {
        await tx.workOrderStatusHistory.create({
          data: {
            workOrderId: id,
            fromStatus: WorkOrderStatus.UNASSIGNED,
            toStatus: WorkOrderStatus.ASSIGNED,
            changedBy,
          },
        });
      }

      return tx.workOrder.update({
        where: { id },
        data: {
          technicianId,
          status: WorkOrderStatus.ASSIGNED,
        },
        include: { customer: true, technician: { include: { user: true } } },
      });
    });
  }

  /**
   * Count work orders by status for a company using raw SQL.
   * TRACED:FD-DATA-001
   */
  async countByStatus(companyId: string): Promise<Array<{ status: string; count: bigint }>> {
    return this.prisma.$queryRaw<Array<{ status: string; count: bigint }>>(Prisma.sql`
      SELECT status, COUNT(*)::bigint as count
      FROM work_orders
      WHERE company_id = ${companyId}
      GROUP BY status
    `);
  }
}
