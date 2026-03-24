// TRACED:FD-WO-001
// TRACED:FD-WO-002
// TRACED:FD-WO-003
// TRACED:FD-WO-004
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { clampPage, clampLimit, paginationMeta } from 'shared';
import { WorkOrderStatus } from '@prisma/client';
import { randomUUID } from 'node:crypto';

const VALID_TRANSITIONS: Record<string, string[]> = {
  UNASSIGNED: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['EN_ROUTE', 'UNASSIGNED', 'CANCELLED'],
  EN_ROUTE: ['ON_SITE', 'CANCELLED'],
  ON_SITE: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: ['INVOICED'],
  INVOICED: ['PAID'],
  PAID: [],
  CANCELLED: [],
};

@Injectable()
export class WorkOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWorkOrderDto, companyId: string, userId: string) {
    const count = await this.prisma.workOrder.count({ where: { companyId } });

    const workOrder = await this.prisma.workOrder.create({
      data: {
        sequenceNumber: count + 1,
        title: dto.title,
        description: dto.description,
        priority: (dto.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') ?? 'MEDIUM',
        scheduledStart: dto.scheduledStart ? new Date(dto.scheduledStart) : undefined,
        scheduledEnd: dto.scheduledEnd ? new Date(dto.scheduledEnd) : undefined,
        customerId: dto.customerId,
        notes: dto.notes,
        companyId,
      },
      include: { customer: true, technician: true },
    });

    await this.prisma.workOrderStatusHistory.create({
      data: {
        workOrderId: workOrder.id,
        toStatus: 'UNASSIGNED',
        changedBy: userId,
      },
    });

    return workOrder;
  }

  async findAll(companyId: string, page?: number, limit?: number) {
    const p = clampPage(page);
    const l = clampLimit(limit);

    const [data, total] = await Promise.all([
      this.prisma.workOrder.findMany({
        where: { companyId },
        include: { customer: true, technician: { include: { user: true } } },
        skip: (p - 1) * l,
        take: l,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.workOrder.count({ where: { companyId } }),
    ]);

    return { data, ...paginationMeta(total, p, l) };
  }

  async findById(id: string, companyId: string) {
    // findFirst justified: fetching by ID with company scope for tenant isolation
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id, companyId },
      include: {
        customer: true,
        technician: { include: { user: true } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
        photos: true,
        lineItems: true,
        routeStops: true,
      },
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    return workOrder;
  }

  async update(id: string, dto: UpdateWorkOrderDto, companyId: string) {
    await this.findById(id, companyId);

    return this.prisma.workOrder.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        scheduledStart: dto.scheduledStart ? new Date(dto.scheduledStart) : undefined,
        scheduledEnd: dto.scheduledEnd ? new Date(dto.scheduledEnd) : undefined,
        notes: dto.notes,
      },
      include: { customer: true, technician: true },
    });
  }

  async updateStatus(id: string, newStatus: WorkOrderStatus, companyId: string, userId: string) {
    const workOrder = await this.findById(id, companyId);

    const allowed = VALID_TRANSITIONS[workOrder.status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${workOrder.status} to ${newStatus}`,
      );
    }

    const updated = await this.prisma.workOrder.update({
      where: { id },
      data: {
        status: newStatus,
        completedAt: newStatus === 'COMPLETED' ? new Date() : undefined,
        trackingToken: newStatus === 'EN_ROUTE' ? randomUUID() : undefined,
        trackingExpiry: newStatus === 'EN_ROUTE'
          ? new Date(Date.now() + 24 * 60 * 60 * 1000)
          : undefined,
      },
    });

    await this.prisma.workOrderStatusHistory.create({
      data: {
        workOrderId: id,
        fromStatus: workOrder.status,
        toStatus: newStatus,
        changedBy: userId,
      },
    });

    return updated;
  }

  async assign(id: string, technicianId: string, companyId: string, userId: string) {
    const workOrder = await this.findById(id, companyId);

    if (workOrder.status !== 'UNASSIGNED') {
      throw new BadRequestException('Work order must be UNASSIGNED to assign');
    }

    const updated = await this.prisma.workOrder.update({
      where: { id },
      data: {
        technicianId,
        status: 'ASSIGNED',
      },
      include: { technician: { include: { user: true } } },
    });

    await this.prisma.workOrderStatusHistory.create({
      data: {
        workOrderId: id,
        fromStatus: 'UNASSIGNED',
        toStatus: 'ASSIGNED',
        changedBy: userId,
      },
    });

    return updated;
  }
}
