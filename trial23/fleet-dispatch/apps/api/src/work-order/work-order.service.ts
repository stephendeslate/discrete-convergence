// TRACED: FD-API-001 — CRUD with tenant scoping (companyId)
// TRACED: FD-EDGE-003 — 404 for non-existent work order within tenant
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { paginate, clampPagination, PaginatedResult } from '../common/pagination.utils';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { WORK_ORDER_STATUSES, WorkOrderStatus } from '@repo/shared';

const STATUS_TRANSITIONS: Record<string, string[]> = {
  UNASSIGNED: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['EN_ROUTE', 'CANCELLED'],
  EN_ROUTE: ['ON_SITE', 'CANCELLED'],
  ON_SITE: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: ['INVOICED', 'CANCELLED'],
  INVOICED: ['PAID', 'CANCELLED'],
  PAID: ['CANCELLED'],
  CANCELLED: [],
};

@Injectable()
export class WorkOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateWorkOrderDto) {
    await this.prisma.setTenantContext(companyId);
    return this.prisma.workOrder.create({
      data: {
        ...dto,
        status: dto.status ?? 'UNASSIGNED',
        companyId,
      },
    });
  }

  async findAll(companyId: string, page?: number, limit?: number): Promise<PaginatedResult<unknown>> {
    await this.prisma.setTenantContext(companyId);
    const clamped = clampPagination(page, limit);

    const [data, total] = await Promise.all([
      this.prisma.workOrder.findMany({
        where: { companyId },
        skip: clamped.offset,
        take: clamped.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.workOrder.count({ where: { companyId } }),
    ]);

    return paginate(data, total, page, limit);
  }

  async findOne(companyId: string, id: string) {
    await this.prisma.setTenantContext(companyId);
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id, companyId },
    });

    if (!workOrder) {
      throw new NotFoundException(`Work order ${id} not found`);
    }

    return workOrder;
  }

  async update(companyId: string, id: string, dto: UpdateWorkOrderDto) {
    await this.findOne(companyId, id);
    await this.prisma.setTenantContext(companyId);
    return this.prisma.workOrder.update({
      where: { id },
      data: dto,
    });
  }

  async updateStatus(companyId: string, id: string, newStatus: WorkOrderStatus) {
    const workOrder = await this.findOne(companyId, id);
    const currentStatus = workOrder.status as string;

    if (!WORK_ORDER_STATUSES.includes(newStatus)) {
      throw new BadRequestException(`Invalid status: ${newStatus}`);
    }

    const allowed = STATUS_TRANSITIONS[currentStatus];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }

    await this.prisma.setTenantContext(companyId);
    return this.prisma.workOrder.update({
      where: { id },
      data: { status: newStatus },
    });
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    await this.prisma.setTenantContext(companyId);
    return this.prisma.workOrder.delete({ where: { id } });
  }
}
