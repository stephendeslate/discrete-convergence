import { Injectable } from '@nestjs/common';
import { APP_VERSION } from '@analytics-engine/shared';

// TRACED: AE-MON-001
@Injectable()
export class MonitoringService {
  private requestCount = 0;
  private errorCount = 0;
  private totalResponseTime = 0;

  recordRequest(duration: number, isError: boolean) {
    this.requestCount++;
    this.totalResponseTime += duration;
    if (isError) {
      this.errorCount++;
    }
  }

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: APP_VERSION,
    };
  }

  getMetrics() {
    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      averageResponseTime: this.requestCount > 0
        ? Math.round(this.totalResponseTime / this.requestCount)
        : 0,
      uptime: process.uptime(),
      version: APP_VERSION,
    };
  }
}
