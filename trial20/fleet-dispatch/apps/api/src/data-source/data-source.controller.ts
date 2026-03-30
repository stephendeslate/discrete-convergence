import { Controller, Get, Req } from '@nestjs/common';
import { RequestWithUser } from '../common/auth-utils';

// TRACED: FD-CROSS-002
@Controller('data-sources')
export class DataSourceController {
  @Get()
  findAll(@Req() req: RequestWithUser) {
    const _tenantId = req.user.tenantId;
    return [];
  }
}
