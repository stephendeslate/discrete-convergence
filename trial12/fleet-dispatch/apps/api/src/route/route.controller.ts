// TRACED: FD-RTE-004
import { Controller, Get, Post, Put, Delete, Body, Param, Req, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { RouteService } from './route.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { RequestWithUser } from '../common/auth-utils';
import { PaginatedQuery } from '../common/paginated-query';

@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Post()
  create(@Req() req: RequestWithUser, @Body() dto: CreateRouteDto) {
    return this.routeService.create(req.user.tenantId, dto);
  }

  @Get()
  async findAll(
    @Req() req: RequestWithUser,
    @Query() query: PaginatedQuery,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('Cache-Control', 'private, max-age=30');
    return this.routeService.findAll(req.user.tenantId, query.page, query.limit);
  }

  @Get(':id')
  findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.routeService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateRouteDto,
  ) {
    return this.routeService.update(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.routeService.remove(req.user.tenantId, id);
  }
}
