import { Controller, Get } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { Public } from '../common/public.decorator';
import { SkipThrottle } from '@nestjs/throttler';

// TRACED: FD-MON-008
@Controller('health')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Public()
  @SkipThrottle()
  @Get()
  getHealth() {
    return this.monitoringService.getHealth();
  }

  @Public()
  @SkipThrottle()
  @Get('ready')
  getReady() {
    return this.monitoringService.getReadiness();
  }

  @Public()
  @SkipThrottle()
  @Get('metrics')
  getMetrics() {
    return this.monitoringService.getMetrics();
  }
}
