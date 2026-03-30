import { Controller, Get, Req } from '@nestjs/common';
import { RequestWithUser } from '../common/auth-utils';

@Controller('dashboards')
export class DashboardController {
  @Get()
  findAll(@Req() req: RequestWithUser) {
    // Placeholder: will filter by tenant when dashboard entity is added
    void req.user.tenantId;
    return [];
  }
}
