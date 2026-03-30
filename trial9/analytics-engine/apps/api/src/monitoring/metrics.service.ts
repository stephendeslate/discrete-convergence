import { Injectable } from '@nestjs/common';

interface MetricsData {
  requestCount: number;
  errorCount: number;
  totalResponseTime: number;
  startTime: number;
}

// TRACED: AE-MON-009
@Injectable()
export class MetricsService {
  private readonly data: MetricsData = {
    requestCount: 0,
    errorCount: 0,
    totalResponseTime: 0,
    startTime: Date.now(),
  };

  recordRequest(duration: number, isError: boolean) {
    this.data.requestCount++;
    this.data.totalResponseTime += duration;
    if (isError) {
      this.data.errorCount++;
    }
  }

  getMetrics() {
    const avgResponseTime =
      this.data.requestCount > 0
        ? this.data.totalResponseTime / this.data.requestCount
        : 0;
    return {
      requestCount: this.data.requestCount,
      errorCount: this.data.errorCount,
      averageResponseTime: Math.round(avgResponseTime * 100) / 100,
      uptime: Math.floor((Date.now() - this.data.startTime) / 1000),
    };
  }
}
