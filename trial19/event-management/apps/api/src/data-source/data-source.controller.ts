import { Controller, Get, Req } from '@nestjs/common';
import { RequestWithUser } from '../common/auth-utils';

@Controller('data-sources')
export class DataSourceController {
  @Get()
  findAll(@Req() req: RequestWithUser) {
    // Placeholder: will filter by tenant when data-source entity is added
    void req.user.tenantId;
    return [];
  }
}
