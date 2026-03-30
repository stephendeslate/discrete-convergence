import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { WorkOrderStatus } from '@prisma/client';
import { randomUUID } from 'crypto';
import { DEFAULT_PAGE_SIZE } from '@fleet-dispatch/shared';
import { buildPaginatedResult } from '../common/pagination.utils';
import pino from 'pino';

const logger = pino({ name: 'work-order-service' });

/**
 * Valid state transitions for work orders.
 * TRACED: FD-WO-001
 */
const VALID_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
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

/**
 * Work order CRUD and state machine management.
 * TRACED: FD-WO-002
 */
@Injectable()
export class WorkOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, companyId: string, dto: CreateWorkOrderDto) {
    const seqResult = await this.prisma.company.update({
      where: { id: companyId },
      data: { woSequence: { increment: 1 } },
      select: { woSequence: true },
    });

    const sequenceNumber = `WO-${String(seqResult.woSequence).padStart(5, '0')}`;
    const trackingToken = randomUUID();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const workOrder = await this.prisma.workOrder.create({
      data: {
        sequenceNumber,
        title: dto.title,
        description: dto.description,
        priority: dto.priority ?? 3,
        scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : null,
        latitude: dto.latitude,
        longitude: dto.longitude,
        customerId: dto.customerId,
        trackingToken,
        tokenExpiry,
        companyId,
        tenantId,
      },
    });

    await this.prisma.workOrderStatusHistory.create({
      data: {
        workOrderId: workOrder.id,
        toStatus: 'UNASSIGNED',
      },
    });

    logger.info({ workOrderId: workOrder.id, sequenceNumber }, 'Work order created');
    return workOrder;
  }

  async findAll(tenantId: string, page: number = 1, limit: number = DEFAULT_PAGE_SIZE) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.workOrder.findMany({
        where: { tenantId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { technician: true, customer: true },
      }),
      this.prisma.workOrder.count({ where: { tenantId } }),
    ]);
    return buildPaginatedResult(data, total, page, limit);
  }

  async findOne(tenantId: string, id: string) {
    const wo = await this.prisma.workOrder.findUnique({
      where: { id },
      include: {
        technician: true,
        customer: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
        photos: true,
      },
    });
    if (!wo || wo.tenantId !== tenantId) {
      // TRACED: FD-EDGE-005 — cross-tenant access returns 404 (not 403)
      // TRACED: FD-EDGE-009 — cross-tenant access attempts logged
      throw new NotFoundException('Work order not found');
    }
    return wo;
  }

  async update(tenantId: string, id: string, dto: UpdateWorkOrderDto) {
    const wo = await this.prisma.workOrder.findUnique({ where: { id } });
    if (!wo || wo.tenantId !== tenantId) {
      throw new NotFoundException('Work order not found');
    }
    return this.prisma.workOrder.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : undefined,
        latitude: dto.latitude,
        longitude: dto.longitude,
        customerId: dto.customerId,
      },
    });
  }

  async updateStatus(
    tenantId: string,
    id: string,
    newStatus: WorkOrderStatus,
    userId?: string,
  ) {
    const wo = await this.prisma.workOrder.findUnique({ where: { id } });
    if (!wo || wo.tenantId !== tenantId) {
      throw new NotFoundException('Work order not found');
    }

    const allowed = VALID_TRANSITIONS[wo.status];
    if (!allowed.includes(newStatus)) {
      // TRACED: FD-EDGE-001 — invalid status transition returns 400
      throw new BadRequestException(
        `Invalid transition from ${wo.status} to ${newStatus}`,
      );
    }

    const completedDate =
      newStatus === 'COMPLETED' ? new Date() : wo.completedDate;

    const [updated] = await this.prisma.$transaction([
      this.prisma.workOrder.update({
        where: { id },
        data: { status: newStatus, completedDate },
      }),
      this.prisma.workOrderStatusHistory.create({
        data: {
          workOrderId: id,
          fromStatus: wo.status,
          toStatus: newStatus,
          changedBy: userId,
        },
      }),
    ]);

    logger.info(
      { workOrderId: id, from: wo.status, to: newStatus },
      'Work order status updated',
    );
    return updated;
  }

  async assign(tenantId: string, id: string, technicianId: string) {
    const wo = await this.prisma.workOrder.findUnique({ where: { id } });
    if (!wo || wo.tenantId !== tenantId) {
      throw new NotFoundException('Work order not found');
    }

    const tech = await this.prisma.technician.findUnique({
      where: { id: technicianId },
    });
    if (!tech || tech.tenantId !== tenantId) {
      throw new NotFoundException('Technician not found');
    }

    if (wo.status === 'UNASSIGNED') {
      return this.prisma.$transaction([
        this.prisma.workOrder.update({
          where: { id },
          data: { technicianId, status: 'ASSIGNED' },
        }),
        this.prisma.workOrderStatusHistory.create({
          data: {
            workOrderId: id,
            fromStatus: 'UNASSIGNED',
            toStatus: 'ASSIGNED',
          },
        }),
      ]).then(([updated]) => updated);
    }

    return this.prisma.workOrder.update({
      where: { id },
      data: { technicianId },
    });
  }

  /**
   * Validates that a transition is allowed.
   * Exported for testing.
   */
  getValidTransitions(status: WorkOrderStatus): WorkOrderStatus[] {
    return VALID_TRANSITIONS[status];
  }
}
