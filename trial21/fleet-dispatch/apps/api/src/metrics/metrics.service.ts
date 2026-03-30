import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';

/**
 * Application metrics for observability.
 * TRACED: FD-MON-005
 */
@Injectable()
export class MetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics(tenantId: string) {
    const [workOrders, technicians, customers, invoices] = await Promise.all([
      this.prisma.workOrder.count({ where: { tenantId } }),
      this.prisma.technician.count({ where: { tenantId } }),
      this.prisma.customer.count({ where: { tenantId } }),
      this.prisma.invoice.count({ where: { tenantId } }),
    ]);

    return {
      workOrders,
      technicians,
      customers,
      invoices,
      timestamp: new Date().toISOString(),
    };
  }
}
