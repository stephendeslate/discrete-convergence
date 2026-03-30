// TRACED:FD-RTE-004 — Route controller
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { RouteService } from './route.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { TenantGuard, AuthenticatedUser } from '../common/tenant.guard';

@Controller('routes')
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Get()
  findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = req.user as AuthenticatedUser;
    return this.routeService.findAll(user.tenantId, {
      page: query.page,
      pageSize: query.pageSize,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.routeService.findOne(id, user.tenantId);
  }

  @Post()
  create(@Body() dto: CreateRouteDto, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.routeService.create(dto, user.tenantId, user.userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRouteDto, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.routeService.update(id, dto, user.tenantId, user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.routeService.remove(id, user.tenantId, user.userId);
  }
}
