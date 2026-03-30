import { Controller, Get, Post, Patch, Body, Param, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { RouteService } from './route.service';
import { OptimizeRouteDto } from './dto/optimize-route.dto';
import { ReorderStopsDto } from './dto/reorder-stops.dto';
import { Roles } from '../auth/roles.decorator';
import { getUser } from '../common/auth-utils';

/**
 * Route optimization and management endpoints.
 * TRACED: FD-ROUTE-002
 */
@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Roles('ADMIN', 'DISPATCHER')
  @Post('optimize')
  async optimize(@Req() req: Request, @Body() dto: OptimizeRouteDto) {
    const user = getUser(req);
    return this.routeService.optimize(user.tenantId, user.companyId, dto);
  }

  @Get(':date')
  async getByDate(@Req() req: Request, @Param('date') date: string) {
    const user = getUser(req);
    return this.routeService.getByDate(user.tenantId, date);
  }

  @Roles('ADMIN', 'DISPATCHER')
  @Patch(':id/reorder')
  async reorder(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: ReorderStopsDto,
  ) {
    const user = getUser(req);
    return this.routeService.reorder(user.tenantId, id, dto);
  }
}
