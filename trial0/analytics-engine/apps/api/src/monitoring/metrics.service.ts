// TRACED:AE-MON-010 — In-memory metrics for request/error tracking
import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricsService {
  private requestCount = 0;
  private errorCount = 0;
  private totalResponseTime = 0;
  private readonly startTime = Date.now();

  recordRequest(duration: number): void {
    this.requestCount++;
    this.totalResponseTime += duration;
  }

  recordError(): void {
    this.errorCount++;
  }

  getMetrics() {
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
