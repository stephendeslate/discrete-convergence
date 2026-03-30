import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { AttendeeService } from './attendee.service';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import { UpdateAttendeeDto } from './dto/update-attendee.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Request } from 'express';
import { JwtPayload } from '@event-management/shared';

// TRACED: EM-ATTENDEE-002
@Controller('attendees')
export class AttendeeController {
  constructor(private readonly attendeeService: AttendeeService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateAttendeeDto) {
    const user = req.user as JwtPayload;
    return this.attendeeService.create(user.tenantId, dto);
  }

  @Get()
  findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = req.user as JwtPayload;
    return this.attendeeService.findAll(user.tenantId, query.page, query.limit);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as JwtPayload;
    return this.attendeeService.findOne(user.tenantId, id);
  }

  @Put(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateAttendeeDto) {
    const user = req.user as JwtPayload;
    return this.attendeeService.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as JwtPayload;
    return this.attendeeService.remove(user.tenantId, id);
  }
}
