import { Injectable } from '@nestjs/common';

// TRACED: FD-MON-009
@Injectable()
export class MetricsService {
  private requestCount = 0;
  private errorCount = 0;
  private totalResponseTime = 0;
  private readonly startTime = Date.now();

  incrementRequests(): void {
    this.requestCount++;
  }

  incrementErrors(): void {
    this.errorCount++;
  }

  addResponseTime(ms: number): void {
    this.totalResponseTime += ms;
  }

  getMetrics(): Record<string, unknown> {
    const avgResponseTime =
      this.requestCount > 0
        ? this.totalResponseTime / this.requestCount
        : 0;

    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      averageResponseTime: Math.round(avgResponseTime * 100) / 100,
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }
}
