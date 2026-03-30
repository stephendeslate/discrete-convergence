import { Injectable } from '@nestjs/common';
import { APP_VERSION } from '@repo/shared';

interface RequestMetrics {
  totalRequests: number;
  totalErrors: number;
  requestsByMethod: Record<string, number>;
  errorsByStatus: Record<number, number>;
}

@Injectable()
export class MonitoringService {
  private readonly startTime = Date.now();
  private readonly metrics: RequestMetrics = {
    totalRequests: 0,
    totalErrors: 0,
    requestsByMethod: {},
    errorsByStatus: {},
  };

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: APP_VERSION,
    };
  }

  getReadiness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: APP_VERSION,
    };
  }

  recordRequest(method: string): void {
    this.metrics.totalRequests += 1;
    this.metrics.requestsByMethod[method] =
      (this.metrics.requestsByMethod[method] ?? 0) + 1;
  }

  recordError(statusCode: number): void {
    this.metrics.totalErrors += 1;
    this.metrics.errorsByStatus[statusCode] =
      (this.metrics.errorsByStatus[statusCode] ?? 0) + 1;
  }

  getMetrics() {
    const errorRate =
      this.metrics.totalRequests > 0
        ? this.metrics.totalErrors / this.metrics.totalRequests
        : 0;

    return {
      totalRequests: this.metrics.totalRequests,
      totalErrors: this.metrics.totalErrors,
      errorRate,
      requestsByMethod: { ...this.metrics.requestsByMethod },
      errorsByStatus: { ...this.metrics.errorsByStatus },
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: APP_VERSION,
    };
  }
}
