// TRACED:FD-ROUTE-002 — route controller with RBAC and pagination
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { RouteService } from './route.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';

@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Post()
  @Roles('ADMIN', 'DISPATCHER')
  async create(@Body() dto: CreateRouteDto, @TenantId() tenantId: string) {
    return this.routeService.create(dto, tenantId);
  }

  @Get()
  async findAll(
    @TenantId() tenantId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.routeService.findAll(
      tenantId,
      page ? Number(page) : undefined,
      pageSize ? Number(pageSize) : undefined,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantId() tenantId: string,
  ) {
    return this.routeService.findOne(id, tenantId);
  }

  @Put(':id')
  @Roles('ADMIN', 'DISPATCHER')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRouteDto,
    @TenantId() tenantId: string,
  ) {
    return this.routeService.update(id, dto, tenantId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantId() tenantId: string,
  ) {
    return this.routeService.remove(id, tenantId);
  }
}
