import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Header,
} from '@nestjs/common';
import { RouteStatus } from '@prisma/client';
import { RoutesService } from './routes.service';
import { CompanyId } from '../common/decorators/company-id.decorator';
import { PaginationParams, PaginationInput } from '../common/decorators/pagination-params.decorator';

@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post()
  async create(@CompanyId() companyId: string, @Body() dto: { date: string; technicianId: string; workOrderIds?: string[] }) {
    return this.routesService.create(companyId, dto);
  }

  @Get()
  @Header('Cache-Control', 'private, max-age=30')
  async findAll(@CompanyId() companyId: string, @PaginationParams() routePaging: PaginationInput) {
    return this.routesService.findAll(companyId, routePaging.page, routePaging.pageSize);
  }

  @Get(':id')
  async findOne(@CompanyId() companyId: string, @Param('id') routeId: string) {
    return this.routesService.findOne(companyId, routeId);
  }

  @Patch(':id/status')
  async updateStatus(@CompanyId() companyId: string, @Param('id') id: string, @Body('status') status: RouteStatus) {
    return this.routesService.updateStatus(companyId, id, status);
  }

  @Delete(':id')
  async delete(@CompanyId() companyId: string, @Param('id') routeId: string) {
    return this.routesService.delete(companyId, routeId);
  }
}
