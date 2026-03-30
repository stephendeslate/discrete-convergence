import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { RouteService } from './route.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Roles } from '../common/roles.decorator';
import { Request } from 'express';
import { JwtPayload } from '@fleet-dispatch/shared';

// TRACED: FD-ROUTE-002
@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Post()
  @Roles('admin', 'dispatcher')
  create(@Req() req: Request, @Body() dto: CreateRouteDto) {
    const user = req.user as JwtPayload;
    return this.routeService.create(user.tenantId, dto);
  }

  @Get()
  findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = req.user as JwtPayload;
    return this.routeService.findAll(user.tenantId, query.page, query.pageSize);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as JwtPayload;
    return this.routeService.findOne(user.tenantId, id);
  }

  @Put(':id')
  @Roles('admin', 'dispatcher')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateRouteDto,
  ) {
    const user = req.user as JwtPayload;
    return this.routeService.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as JwtPayload;
    return this.routeService.remove(user.tenantId, id);
  }
}
