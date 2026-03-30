import { Injectable } from '@nestjs/common';

// TRACED:FD-MON-007 — In-memory metrics: request/error counts, average response time, uptime
@Injectable()
export class MetricsService {
  private totalRequests = 0;
  private totalErrors = 0;
  private responseTimes: number[] = [];
  private readonly startTime = Date.now();

  recordRequest(): void {
    this.totalRequests++;
  }

  recordError(): void {
    this.totalErrors++;
  }

  recordResponseTime(ms: number): void {
    this.responseTimes.push(ms);
    if (this.responseTimes.length > 10000) {
      this.responseTimes = this.responseTimes.slice(-5000);
    }
  }

  getMetrics(): {
    totalRequests: number;
    totalErrors: number;
    averageResponseTime: number;
    uptime: number;
  } {
    const avg =
      this.responseTimes.length > 0
        ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
        : 0;

    return {
      totalRequests: this.totalRequests,
      totalErrors: this.totalErrors,
      averageResponseTime: Math.round(avg * 100) / 100,
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }
}
