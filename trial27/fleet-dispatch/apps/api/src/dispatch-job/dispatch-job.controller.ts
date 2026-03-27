// TRACED: FD-API-004 — Dispatch job CRUD controller with assign, complete, cancel
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DispatchJobService } from './dispatch-job.service';
import { CreateDispatchJobDto } from './dto/create-dispatch-job.dto';
import { UpdateDispatchJobDto } from './dto/update-dispatch-job.dto';
import { AssignJobDto } from './dto/assign-job.dto';
import { TenantId } from '../common/tenant.decorator';
import { PaginatedQueryDto } from '../common/paginated-query';

@Controller('dispatch-jobs')
export class DispatchJobController {
  constructor(private readonly dispatchJobService: DispatchJobService) {}

  @Post()
  create(@TenantId() tenantId: string, @Body() dto: CreateDispatchJobDto) {
    return this.dispatchJobService.create(tenantId, dto);
  }

  @Get()
  findAll(@TenantId() tenantId: string, @Query() query: PaginatedQueryDto) {
    return this.dispatchJobService.findAll(tenantId, query.page, query.pageSize);
  }

  @Get(':id')
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.dispatchJobService.findOne(tenantId, id);
  }

  @Patch(':id')
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDispatchJobDto,
  ) {
    return this.dispatchJobService.update(tenantId, id, dto);
  }

  @Delete(':id')
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.dispatchJobService.remove(tenantId, id);
  }

  // TRACED: FD-API-005 — Assign vehicle and driver to job
  @Post(':id/assign')
  @HttpCode(HttpStatus.OK)
  assign(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: AssignJobDto,
  ) {
    return this.dispatchJobService.assign(tenantId, id, dto);
  }

  // TRACED: FD-API-006 — Complete a dispatch job
  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  complete(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.dispatchJobService.complete(tenantId, id);
  }

  // TRACED: FD-API-007 — Cancel a dispatch job
  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  cancel(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.dispatchJobService.cancel(tenantId, id);
  }
}
