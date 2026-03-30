// TRACED: FD-MON-003 — GET /health with @Public() but NO @SkipThrottle()
import { Controller, Get } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { Public } from '../common/public.decorator';

@Controller('health')
export class HealthController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Public()
  @Get()
  getHealth() {
    return this.monitoringService.getHealth();
  }
}
