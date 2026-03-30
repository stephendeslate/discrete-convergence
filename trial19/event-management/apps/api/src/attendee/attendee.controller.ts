import { Controller, Get, Post, Put, Delete, Body, Param, Req, Query } from '@nestjs/common';
import { AttendeeService } from './attendee.service';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import { UpdateAttendeeDto } from './dto/update-attendee.dto';
import { RequestWithUser } from '../common/auth-utils';
import { PaginatedQueryDto } from '../common/paginated-query';

// TRACED: EM-ATTENDEE-002
@Controller('attendees')
export class AttendeeController {
  constructor(private readonly attendeeService: AttendeeService) {}

  @Get()
  findAll(@Req() req: RequestWithUser, @Query() query: PaginatedQueryDto) {
    const res = req.res;
    if (res) {
      res.setHeader('Cache-Control', 'public, max-age=60');
    }
    return this.attendeeService.findAll(req.user.tenantId, query.page, query.pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.attendeeService.findOne(id, req.user.tenantId);
  }

  @Post()
  create(@Body() dto: CreateAttendeeDto, @Req() req: RequestWithUser) {
    return this.attendeeService.create(dto, req.user.tenantId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAttendeeDto, @Req() req: RequestWithUser) {
    return this.attendeeService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.attendeeService.remove(id, req.user.tenantId);
  }
}
