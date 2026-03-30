import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { MonitoringService } from './monitoring.service';
import { Public } from '../common/public.decorator';

// TRACED: AE-MON-006
// TRACED: AE-INFRA-002
@Controller()
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Public()
  @SkipThrottle()
  @Get('health')
  getHealth() {
    return this.monitoringService.getHealth();
  }

  @Public()
  @SkipThrottle()
  @Get('health/ready')
  getReadiness() {
    return this.monitoringService.getReadiness();
  }

  @Public()
  @SkipThrottle()
  @Get('metrics')
  getMetrics() {
    return this.monitoringService.getMetrics();
  }
}
