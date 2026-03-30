import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { Public } from '../auth/public.decorator';

/**
 * Health check endpoints for container orchestration.
 * TRACED: FD-INFRA-003
 */
@Controller('health')
@Public()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  getHealth() {
    return this.healthService.getHealth();
  }

  @Get('ready')
  async getReady() {
    return this.healthService.getReady();
  }
}
