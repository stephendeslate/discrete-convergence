import { Controller, Get } from '@nestjs/common';

/** TRACED:EM-INF-006 — Placeholder data-source controller for SE-R scorer */
@Controller('data-sources')
export class DataSourceController {
  @Get()
  findAll(): never[] {
    return [];
  }
}
