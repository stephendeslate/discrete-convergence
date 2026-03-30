import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Header,
} from '@nestjs/common';
import { Request } from 'express';
import { RouteService } from './route.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import type { AuthenticatedUser } from '../common/auth-utils';

// TRACED:FD-ROUTE-002
@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateRouteDto) {
    const user = req.user as AuthenticatedUser;
    return this.routeService.create(user.companyId, dto);
  }

  @Get()
  @Header('Cache-Control', 'private, max-age=30')
  findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = req.user as AuthenticatedUser;
    return this.routeService.findAll(
      user.companyId,
      query.page,
      query.pageSize,
    );
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as AuthenticatedUser;
    return this.routeService.findOne(user.companyId, id);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as AuthenticatedUser;
    return this.routeService.remove(user.companyId, id);
  }
}
