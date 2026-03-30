import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { RouteService } from './route.service';
import { CreateRouteDto, UpdateRouteDto } from './route.dto';
import { PaginatedQuery } from '../common/paginated-query';
import { Roles } from '../common/roles.decorator';

@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Get()
  async findAll(@Query() query: PaginatedQuery, @Req() req: Request) {
    const tenantId = (req as unknown as { user: { tenantId: string } }).user.tenantId;
    const result = await this.routeService.findAll(tenantId, query);
    req.res?.setHeader('Cache-Control', 'private, max-age=30');
    return result;
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const tenantId = (req as unknown as { user: { tenantId: string } }).user.tenantId;
    return this.routeService.findOne(id, tenantId);
  }

  @Roles('ADMIN', 'DISPATCHER')
  @Post()
  async create(@Body() dto: CreateRouteDto, @Req() req: Request) {
    const tenantId = (req as unknown as { user: { tenantId: string } }).user.tenantId;
    return this.routeService.create(dto, tenantId);
  }

  @Roles('ADMIN', 'DISPATCHER')
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateRouteDto, @Req() req: Request) {
    const tenantId = (req as unknown as { user: { tenantId: string } }).user.tenantId;
    return this.routeService.update(id, dto, tenantId);
  }

  @Roles('ADMIN')
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: Request) {
    const tenantId = (req as unknown as { user: { tenantId: string } }).user.tenantId;
    return this.routeService.delete(id, tenantId);
  }
}
