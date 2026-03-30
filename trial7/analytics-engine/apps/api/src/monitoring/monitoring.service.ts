import { Injectable } from '@nestjs/common';

// TRACED:AE-MON-007
@Injectable()
export class MonitoringService {
  private requestCount = 0;
  private errorCount = 0;
  private totalResponseTime = 0;

  recordRequest(duration: number): void {
    this.requestCount++;
    this.totalResponseTime += duration;
  }

  recordError(message: string): void {
    this.errorCount++;
    void message; // logged via logger service
  }

  getMetrics(): {
    requestCount: number;
    errorCount: number;
    avgResponseTime: number;
    uptime: number;
  } {
    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      avgResponseTime:
        this.requestCount > 0
          ? Math.round(this.totalResponseTime / this.requestCount)
          : 0,
      uptime: process.uptime(),
    };
  }
}
