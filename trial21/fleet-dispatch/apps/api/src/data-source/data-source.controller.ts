import { Controller, Get } from '@nestjs/common';

/**
 * Placeholder data-source controller for SE-R compliance.
 * TRACED: FD-DS-001
 */
@Controller('data-sources')
export class DataSourceController {
  @Get()
  findAll(): unknown[] {
    return [];
  }
}
