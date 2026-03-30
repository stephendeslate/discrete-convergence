import { Injectable } from '@nestjs/common';

interface TenantMetrics {
  requestCount: number;
  errorCount: number;
  totalResponseTime: number;
}

@Injectable()
export class MonitoringService {
  private readonly metrics = new Map<string, TenantMetrics>();
  private readonly startTime = Date.now();

  recordRequest(tenantId: string, responseTimeMs: number): void {
    const existing = this.metrics.get(tenantId) ?? {
      requestCount: 0,
      errorCount: 0,
      totalResponseTime: 0,
    };

    existing.requestCount += 1;
    existing.totalResponseTime += responseTimeMs;
    this.metrics.set(tenantId, existing);
  }

  recordError(tenantId: string): void {
    const existing = this.metrics.get(tenantId) ?? {
      requestCount: 0,
      errorCount: 0,
      totalResponseTime: 0,
    };

    existing.errorCount += 1;
    this.metrics.set(tenantId, existing);
  }

  getMetrics(tenantId: string) {
    const tenantMetrics = this.metrics.get(tenantId) ?? {
      requestCount: 0,
      errorCount: 0,
      totalResponseTime: 0,
    };

    const avgResponseTime =
      tenantMetrics.requestCount > 0
        ? tenantMetrics.totalResponseTime / tenantMetrics.requestCount
        : 0;

    return {
      requestCount: tenantMetrics.requestCount,
      errorCount: tenantMetrics.errorCount,
      avgResponseTimeMs: Math.round(avgResponseTime * 100) / 100,
      uptimeMs: Date.now() - this.startTime,
    };
  }

  getUptime(): number {
    return Date.now() - this.startTime;
  }
}
