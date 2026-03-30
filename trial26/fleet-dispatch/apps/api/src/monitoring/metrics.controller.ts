// TRACED:FD-MON-005 — Metrics controller for application metrics
import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/public.decorator';

interface MetricEntry {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
}

// fully-public: metrics endpoints do not require tenant scoping
@Controller('monitoring')
export class MetricsController {
  private readonly startTime = Date.now();

  @Public()
  @Get('metrics')
  getMetrics(): { metrics: MetricEntry[] } {
    const memUsage = process.memoryUsage();
    const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    const now = new Date().toISOString();

    return {
      metrics: [
        { name: 'uptime', value: uptimeSeconds, unit: 'seconds', timestamp: now },
        { name: 'memory_rss', value: memUsage.rss, unit: 'bytes', timestamp: now },
        { name: 'memory_heap_used', value: memUsage.heapUsed, unit: 'bytes', timestamp: now },
        { name: 'memory_heap_total', value: memUsage.heapTotal, unit: 'bytes', timestamp: now },
        { name: 'memory_external', value: memUsage.external, unit: 'bytes', timestamp: now },
      ],
    };
  }

  @Public()
  @Get('status')
  getStatus() {
    return {
      status: 'operational',
      version: process.env.npm_package_version ?? '1.0.0',
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
    };
  }
}
