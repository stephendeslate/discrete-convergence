import { Controller, Get } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { Roles } from '../common/auth-utils';

/**
 * VERIFY: AE-MON-005 — metrics endpoint restricted to ADMIN role
 */
@Controller('metrics')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Roles('ADMIN') // TRACED: AE-MON-005
  @Get()
  async getMetrics() {
    return this.monitoringService.getMetrics();
  }
}
