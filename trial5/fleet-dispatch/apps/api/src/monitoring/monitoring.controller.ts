// TRACED:FD-MON-011 — monitoring controller with public health and metrics endpoints
import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { MetricsService } from '../common/services/metrics.service';
import { APP_VERSION } from '@fleet-dispatch/shared';

@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly metrics: MetricsService) {}

  @Public()
  @Get('health')
  health(): { status: string; version: string; timestamp: string } {
    return {
      status: 'ok',
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('metrics')
  getMetrics(): {
    requests: number;
    errors: number;
    avgResponseTimeMs: number;
    uptimeSeconds: number;
  } {
    return this.metrics.getMetrics();
  }
}
