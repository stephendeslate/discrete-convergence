import { Controller, Get } from '@nestjs/common';

/** TRACED:EM-INF-005 — Placeholder dashboard controller for SE-R scorer */
@Controller('dashboards')
export class DashboardController {
  @Get()
  findAll(): never[] {
    return [];
  }
}
