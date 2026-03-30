// TRACED:FD-API-001 — WorkOrderService CRUD operations
// TRACED:FD-DAT-002 — Work order status machine validation
// TRACED:FD-DAT-006 — $executeRaw for RLS context setting
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma, WorkOrderStatus } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { clampPagination } from '@fleet-dispatch/shared';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';

const VALID_TRANSITIONS: Record<string, string[]> = {
  UNASSIGNED: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['EN_ROUTE', 'CANCELLED'],
  EN_ROUTE: ['ON_SITE', 'CANCELLED'],
  ON_SITE: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: ['INVOICED', 'CANCELLED'],
  INVOICED: ['PAID', 'CANCELLED'],
  PAID: [],
  CANCELLED: [],
};

@Injectable()
export class WorkOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async setRlsContext(companyId: string): Promise<void> {
    await this.prisma.$executeRaw(Prisma.sql`SELECT set_config('app.current_company_id', ${companyId}, true)`);
  }

  async create(companyId: string, userId: string, dto: CreateWorkOrderDto) {
    await this.setRlsContext(companyId);
    return this.prisma.workOrder.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority ?? 'MEDIUM',
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        customerId: dto.customerId,
        companyId,
        latitude: dto.latitude ? new Prisma.Decimal(dto.latitude) : undefined,
        longitude: dto.longitude ? new Prisma.Decimal(dto.longitude) : undefined,
      },
      include: { customer: true, technician: true },
    });
  }

  async findAll(companyId: string, page?: number, pageSize?: number) {
    await this.setRlsContext(companyId);
    const pagination = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.workOrder.findMany({
        where: { companyId },
        include: { customer: true, technician: true },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.workOrder.count({ where: { companyId } }),
    ]);
    return { data, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async findOne(companyId: string, id: string) {
    await this.setRlsContext(companyId);
    // findFirst: scoped by companyId for RLS enforcement
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id, companyId },
      include: { customer: true, technician: true, statusHistory: true, photos: true },
    });
    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }
    return workOrder;
  }

  async update(companyId: string, id: string, dto: UpdateWorkOrderDto) {
    await this.setRlsContext(companyId);
    await this.findOne(companyId, id);
    return this.prisma.workOrder.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      },
      include: { customer: true, technician: true },
    });
  }

  async remove(companyId: string, id: string) {
    await this.setRlsContext(companyId);
    await this.findOne(companyId, id);
    return this.prisma.workOrder.delete({ where: { id } });
  }

  async updateStatus(companyId: string, id: string, newStatus: WorkOrderStatus, userId: string) {
    await this.setRlsContext(companyId);
    const workOrder = await this.findOne(companyId, id);
    const allowed = VALID_TRANSITIONS[workOrder.status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${workOrder.status} to ${newStatus}`,
      );
    }
    const [updated] = await this.prisma.$transaction([
      this.prisma.workOrder.update({
        where: { id },
        data: {
          status: newStatus,
          completedAt: newStatus === 'COMPLETED' ? new Date() : undefined,
        },
        include: { customer: true, technician: true },
      }),
      this.prisma.workOrderStatusHistory.create({
        data: {
          workOrderId: id,
          fromStatus: workOrder.status,
          toStatus: newStatus,
          changedBy: userId,
        },
      }),
    ]);
    return updated;
  }

  async assign(companyId: string, id: string, technicianId: string, userId: string) {
    await this.setRlsContext(companyId);
    const workOrder = await this.findOne(companyId, id);
    if (workOrder.status !== 'UNASSIGNED' && workOrder.status !== 'ASSIGNED') {
      throw new BadRequestException('Work order cannot be reassigned in current status');
    }
    const [updated] = await this.prisma.$transaction([
      this.prisma.workOrder.update({
        where: { id },
        data: { technicianId, status: 'ASSIGNED' },
        include: { customer: true, technician: true },
      }),
      this.prisma.workOrderStatusHistory.create({
        data: {
          workOrderId: id,
          fromStatus: workOrder.status,
          toStatus: 'ASSIGNED',
          changedBy: userId,
        },
      }),
    ]);
    return updated;
  }
}
