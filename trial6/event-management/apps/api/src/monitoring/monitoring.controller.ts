// TRACED:EM-MON-005 — MonitoringController with @Public() health and readiness endpoints
import { Controller, Get } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { Public } from '../common/public.decorator';

@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Public()
  @Get('health')
  async health() {
    return this.monitoringService.getHealth();
  }

  @Public()
  @Get('ready')
  async readiness() {
    return this.monitoringService.getReadiness();
  }
}
