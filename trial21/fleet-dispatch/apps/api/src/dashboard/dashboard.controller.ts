import { Controller, Get } from '@nestjs/common';

/**
 * Placeholder dashboard controller for SE-R compliance.
 * TRACED: FD-DASH-001
 */
@Controller('dashboards')
export class DashboardController {
  @Get()
  findAll(): unknown[] {
    return [];
  }
}
