import { Controller, Get } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { Public } from '../common/public.decorator';
import { SkipThrottle } from '@nestjs/throttler';

// TRACED: EM-MON-009
@Controller()
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Public()
  @SkipThrottle()
  @Get('health')
  health() {
    return this.monitoringService.getHealth();
  }

  @Public()
  @SkipThrottle()
  @Get('health/ready')
  readiness() {
    return this.monitoringService.getReadiness();
  }

  @Public()
  @Get('metrics')
  metrics() {
    return this.monitoringService.getMetrics();
  }
}
