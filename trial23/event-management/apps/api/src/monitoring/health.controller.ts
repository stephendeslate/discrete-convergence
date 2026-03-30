// TRACED: EM-MON-003 — Health returns status, timestamp, uptime, version
import { Controller, Get } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { Public } from '../common/public.decorator';

@Controller('health')
export class HealthController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get()
  @Public()
  getHealth() {
    return this.monitoringService.getHealth();
  }

  @Get('ready')
  @Public()
  getReady() {
    return this.monitoringService.getReadiness();
  }
}
