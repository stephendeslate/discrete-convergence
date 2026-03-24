// TRACED:EM-MON-010 — In-memory metrics for request/error tracking
import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricsService {
  private requestCount = 0;
  private errorCount = 0;
  private totalResponseTime = 0;

  recordRequest(responseTime: number) {
    this.requestCount++;
    this.totalResponseTime += responseTime;
  }

  recordError() {
    this.errorCount++;
  }

  getMetrics() {
    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      averageResponseTime:
        this.requestCount > 0 ? this.totalResponseTime / this.requestCount : 0,
    };
  }
}
