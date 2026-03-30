import { Controller, Get, Post, Delete, Body, Param, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { RouteService } from './route.service';
import { OptimizeRouteDto } from './dto/optimize-route.dto';
import { PaginatedQueryDto } from '../common/paginated-query';

@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Get()
  async findAll(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Query() query: PaginatedQueryDto) {
    const user = req.user as { companyId: string };
    res.setHeader('Cache-Control', 'private, max-age=30');
    return this.routeService.findAll(user.companyId, query.page, query.pageSize);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { companyId: string };
    return this.routeService.findOne(user.companyId, id);
  }

  @Post('optimize')
  async optimize(@Req() req: Request, @Body() dto: OptimizeRouteDto) {
    const user = req.user as { companyId: string };
    return this.routeService.optimize(user.companyId, dto.technicianId, dto.workOrderIds);
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { companyId: string };
    return this.routeService.remove(user.companyId, id);
  }
}
