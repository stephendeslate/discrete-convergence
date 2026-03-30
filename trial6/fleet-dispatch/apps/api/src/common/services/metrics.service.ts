// TRACED:FD-MON-007 — in-memory metrics tracking for /metrics endpoint
import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricsService {
  private requestCount = 0;
  private errorCount = 0;
  private totalResponseTime = 0;
  private readonly startTime = Date.now();

  recordRequest(durationMs: number): void {
    this.requestCount++;
    this.totalResponseTime += durationMs;
  }

  recordError(): void {
    this.errorCount++;
  }

  getMetrics(): {
    requests: number;
    errors: number;
    avgResponseTimeMs: number;
    uptimeSeconds: number;
  } {
    return {
      requests: this.requestCount,
      errors: this.errorCount,
      avgResponseTimeMs:
        this.requestCount > 0
          ? Math.round(this.totalResponseTime / this.requestCount)
          : 0,
      uptimeSeconds: Math.round((Date.now() - this.startTime) / 1000),
    };
  }
}
