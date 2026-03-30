// TRACED:EM-MON-008 — Health, readiness, and metrics endpoints exempt from auth and rate limiting
import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { MonitoringService } from './monitoring.service';
import { Public } from '../common/public.decorator';

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
  async ready() {
    return this.monitoringService.getReadiness();
  }

  @Public()
  @SkipThrottle()
  @Get('metrics')
  async metrics() {
    return this.monitoringService.getMetrics();
  }
}
