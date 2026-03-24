// TRACED:FD-MON-010
import { Injectable } from '@nestjs/common';

interface RequestMetric {
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  timestamp: number;
}

@Injectable()
export class MetricsService {
  private readonly metrics: RequestMetric[] = [];
  private requestCount = 0;
  private errorCount = 0;

  record(metric: RequestMetric) {
    this.metrics.push(metric);
    this.requestCount++;
    if (metric.statusCode >= 400) {
      this.errorCount++;
    }
    if (this.metrics.length > 10000) {
      this.metrics.splice(0, 5000);
    }
  }

  getSummary() {
    const durations = this.metrics.map((m) => m.duration).sort((a, b) => a - b);
    const p50 = durations[Math.floor(durations.length * 0.5)] ?? 0;
    const p95 = durations[Math.floor(durations.length * 0.95)] ?? 0;
    const p99 = durations[Math.floor(durations.length * 0.99)] ?? 0;

    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      percentiles: { p50, p95, p99 },
    };
  }
}
