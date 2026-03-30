import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { WorkOrderService } from './work-order.service';
import { Roles } from '../common/roles.decorator';
import { PaginatedQueryDto } from '../common/paginated-query';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { WorkOrderStatus } from '@repo/shared';

@Controller('work-orders')
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Roles('ADMIN', 'DISPATCHER')
  @Post()
  create(
    @Request() req: { user: { companyId: string } },
    @Body() dto: CreateWorkOrderDto,
  ) {
    return this.workOrderService.create(req.user.companyId, dto);
  }

  @Get()
  findAll(
    @Request() req: { user: { companyId: string } },
    @Query() query: PaginatedQueryDto,
  ) {
    return this.workOrderService.findAll(req.user.companyId, query.page, query.limit);
  }

  @Get(':id')
  findOne(
    @Request() req: { user: { companyId: string } },
    @Param('id') id: string,
  ) {
    return this.workOrderService.findOne(req.user.companyId, id);
  }

  @Roles('ADMIN', 'DISPATCHER')
  @Put(':id')
  update(
    @Request() req: { user: { companyId: string } },
    @Param('id') id: string,
    @Body() dto: UpdateWorkOrderDto,
  ) {
    return this.workOrderService.update(req.user.companyId, id, dto);
  }

  @Roles('ADMIN', 'DISPATCHER')
  @Patch(':id/status')
  updateStatus(
    @Request() req: { user: { companyId: string } },
    @Param('id') id: string,
    @Body('status') status: WorkOrderStatus,
  ) {
    return this.workOrderService.updateStatus(req.user.companyId, id, status);
  }

  @Roles('ADMIN', 'DISPATCHER')
  @Delete(':id')
  remove(
    @Request() req: { user: { companyId: string } },
    @Param('id') id: string,
  ) {
    return this.workOrderService.remove(req.user.companyId, id);
  }
}
