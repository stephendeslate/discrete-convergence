import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { RouteService } from './route.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { PaginatedQueryDto } from '../common/paginated-query';

// TRACED:FD-RTE-004
@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Post()
  async create(@Body() dto: CreateRouteDto) {
    return this.routeService.create(dto);
  }

  @Get()
  async findAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query() query: PaginatedQueryDto,
  ) {
    const user = req.user as { tenantId: string };
    res.setHeader('Cache-Control', 'private, max-age=30');
    return this.routeService.findAll(
      user.tenantId,
      query.page ? parseInt(query.page, 10) : undefined,
      query.pageSize ? parseInt(query.pageSize, 10) : undefined,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { tenantId: string };
    return this.routeService.findOne(id, user.tenantId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRouteDto,
    @Req() req: Request,
  ) {
    const user = req.user as { tenantId: string };
    return this.routeService.update(id, user.tenantId, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { tenantId: string };
    return this.routeService.remove(id, user.tenantId);
  }
}
