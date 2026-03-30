import { Controller, Get, Req } from '@nestjs/common';
import { RequestWithUser } from '../common/auth-utils';

// TRACED: EM-CROSS-002
@Controller('data-sources')
export class DataSourceController {
  @Get()
  findAll(@Req() req: RequestWithUser) {
    return { tenantId: req.user.tenantId, dataSources: [] };
  }
}
