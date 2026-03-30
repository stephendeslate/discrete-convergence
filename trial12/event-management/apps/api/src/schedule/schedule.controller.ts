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
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { RequestWithUser } from '../common/request-with-user';
import { PaginatedQuery } from '../common/paginated-query';

// TRACED: EM-SCHED-004
@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  create(@Req() req: RequestWithUser, @Body() dto: CreateScheduleDto) {
    return this.scheduleService.create(req.user.tenantId, dto);
  }

  @Get()
  async findAll(
    @Req() req: RequestWithUser,
    @Query() query: PaginatedQuery,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('Cache-Control', 'private, max-age=30');
    return this.scheduleService.findAll(req.user.tenantId, query.page, query.pageSize);
  }

  @Get(':id')
  findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.scheduleService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateScheduleDto,
  ) {
    return this.scheduleService.update(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.scheduleService.remove(req.user.tenantId, id);
  }
}
