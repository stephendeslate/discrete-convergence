// TRACED: FD-MON-010
import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../common/public.decorator';
import { MonitoringService } from './monitoring.service';

@Public()
@SkipThrottle({ default: true, auth: true })
@Controller()
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Public()
  @SkipThrottle({ default: true, auth: true })
  @Get('health')
  getHealth() {
    return this.monitoringService.getHealth();
  }

  @Public()
  @SkipThrottle({ default: true, auth: true })
  @Get('health/ready')
  getReady() {
    return this.monitoringService.getReady();
  }

  @Public()
  @SkipThrottle({ default: true, auth: true })
  @Get('metrics')
  getMetrics() {
    return this.monitoringService.getMetrics();
  }
}
