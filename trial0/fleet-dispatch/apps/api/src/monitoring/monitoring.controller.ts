// TRACED:FD-MON-011
// TRACED:FD-FE-001
import { Controller, Get } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { MetricsService } from './metrics.service';
import { Public } from '../common/public.decorator';

@Controller('monitoring')
export class MonitoringController {
  constructor(
    private readonly monitoringService: MonitoringService,
    private readonly metricsService: MetricsService,
  ) {}

  @Public()
  @Get('health')
  getHealth() {
    return this.monitoringService.getHealth();
  }

  @Get('metrics')
  getMetrics() {
    return this.monitoringService.getMetrics();
  }

  @Get('request-metrics')
  getRequestMetrics() {
    return this.metricsService.getSummary();
  }
}
