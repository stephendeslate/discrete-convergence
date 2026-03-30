import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, HttpCode, HttpStatus, Header } from '@nestjs/common';
import { AttendeeService } from './attendee.service';
import { CreateAttendeeDto, UpdateAttendeeDto } from './dto/create-attendee.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { RequestWithUser } from '../common/auth-utils';

// TRACED: EM-ATTEND-002
@Controller('attendees')
export class AttendeeController {
  constructor(private readonly attendeeService: AttendeeService) {}

  @Post()
  create(@Body() dto: CreateAttendeeDto, @Req() req: RequestWithUser) {
    return this.attendeeService.create(dto, req.user.tenantId);
  }

  @Get()
  @Header('Cache-Control', 'max-age=30, public')
  findAll(@Query() query: PaginatedQueryDto, @Req() req: RequestWithUser) {
    return this.attendeeService.findAll(req.user.tenantId, query.page, query.limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.attendeeService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAttendeeDto, @Req() req: RequestWithUser) {
    return this.attendeeService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.attendeeService.remove(id, req.user.tenantId);
  }
}
