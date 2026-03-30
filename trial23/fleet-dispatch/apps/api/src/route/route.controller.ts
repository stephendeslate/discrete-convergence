import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { RouteService } from './route.service';
import { Roles } from '../common/roles.decorator';
import { PaginatedQueryDto } from '../common/paginated-query';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';

@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Roles('ADMIN', 'DISPATCHER')
  @Post()
  create(
    @Request() req: { user: { companyId: string } },
    @Body() dto: CreateRouteDto,
  ) {
    return this.routeService.create(req.user.companyId, dto);
  }

  @Get()
  findAll(
    @Request() req: { user: { companyId: string } },
    @Query() query: PaginatedQueryDto,
  ) {
    return this.routeService.findAll(req.user.companyId, query.page, query.limit);
  }

  @Get(':id')
  findOne(
    @Request() req: { user: { companyId: string } },
    @Param('id') id: string,
  ) {
    return this.routeService.findOne(req.user.companyId, id);
  }

  @Roles('ADMIN', 'DISPATCHER')
  @Put(':id')
  update(
    @Request() req: { user: { companyId: string } },
    @Param('id') id: string,
    @Body() dto: UpdateRouteDto,
  ) {
    return this.routeService.update(req.user.companyId, id, dto);
  }

  @Roles('ADMIN', 'DISPATCHER')
  @Post(':id/stops')
  addStop(
    @Request() req: { user: { companyId: string } },
    @Param('id') routeId: string,
    @Body() body: { workOrderId: string; order: number },
  ) {
    return this.routeService.addStop(
      req.user.companyId,
      routeId,
      body.workOrderId,
      body.order,
    );
  }

  @Roles('ADMIN', 'DISPATCHER')
  @Delete(':id/stops/:stopId')
  removeStop(
    @Request() req: { user: { companyId: string } },
    @Param('id') routeId: string,
    @Param('stopId') stopId: string,
  ) {
    return this.routeService.removeStop(req.user.companyId, routeId, stopId);
  }
}
