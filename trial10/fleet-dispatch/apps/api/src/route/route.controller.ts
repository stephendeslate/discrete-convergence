// TRACED:FD-API-003 — Route CRUD controller with full endpoints
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { RouteService } from './route.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { getTenantId } from '../common/auth-utils';
import { parsePaginationParams } from '../common/pagination.utils';

@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateRouteDto) {
    return this.routeService.create(getTenantId(req), dto);
  }

  @Get()
  async findAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    res.setHeader('Cache-Control', 'private, no-cache');
    const params = parsePaginationParams(page, limit);
    return this.routeService.findAll(getTenantId(req), params.page, params.limit);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    return this.routeService.findOne(getTenantId(req), id);
  }

  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateRouteDto,
  ) {
    return this.routeService.update(getTenantId(req), id, dto);
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    return this.routeService.remove(getTenantId(req), id);
  }
}
