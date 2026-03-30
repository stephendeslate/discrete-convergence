import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../common/public.decorator';
import { MonitoringService } from './monitoring.service';

// TRACED:AE-MON-001 — Monitoring controller with @Public() and @SkipThrottle() on health endpoints
@Controller()
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Public()
  @SkipThrottle()
  @Get('health')
  async health() {
    return this.monitoringService.getHealth();
  }

  @Public()
  @SkipThrottle()
  @Get('health/ready')
  async healthReady() {
    return this.monitoringService.getReadiness();
  }

  @Public()
  @SkipThrottle()
  @Get('metrics')
  async metrics() {
    return this.monitoringService.getMetrics();
  }
}
