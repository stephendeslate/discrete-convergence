import { Controller, Get } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { Public } from '../common/public.decorator';
import { SkipThrottle } from '@nestjs/throttler';

// TRACED: AE-MON-009
@Controller('monitoring')
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
  @Get('metrics')
  async metrics() {
    return this.monitoringService.getMetrics();
  }
}
