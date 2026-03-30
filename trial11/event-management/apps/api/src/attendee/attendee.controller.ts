import { Controller, Get, Post, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { AttendeeService } from './attendee.service';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import { RequestWithUser } from '../common/request-with-user';
import { PaginatedQueryDto } from '../common/paginated-query';

// TRACED: EM-ATTEND-003
@Controller('attendees')
export class AttendeeController {
  constructor(private readonly attendeeService: AttendeeService) {}

  @Post()
  create(@Req() req: RequestWithUser, @Body() dto: CreateAttendeeDto) {
    return this.attendeeService.create(req.user.tenantId, dto);
  }

  @Get()
  findAll(@Req() req: RequestWithUser, @Query() query: PaginatedQueryDto) {
    return this.attendeeService.findAll(req.user.tenantId, query.page, query.pageSize);
  }

  @Get(':id')
  findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.attendeeService.findOne(req.user.tenantId, id);
  }

  @Delete(':id')
  remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.attendeeService.remove(req.user.tenantId, id);
  }
}
