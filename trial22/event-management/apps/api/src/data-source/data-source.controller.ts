import { Controller, Get, Req, UseInterceptors } from '@nestjs/common';
import { RequestWithUser } from '../common/request-with-user';
import { CacheControlInterceptor } from '../common/cache-control.interceptor';

@Controller('data-sources')
export class DataSourceController {
  @Get()
  @UseInterceptors(CacheControlInterceptor)
  findAll(@Req() req: RequestWithUser) {
    return { data: [], tenantId: req.user.tenantId };
  }
}
