// TRACED:EM-API-008 — AttendeeController with RBAC guards
import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query,
} from '@nestjs/common';
import { AttendeeService } from './attendee.service';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import { UpdateAttendeeDto } from './dto/update-attendee.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Roles } from '../common/roles.decorator';

@Controller('attendees')
export class AttendeeController {
  constructor(private readonly attendeeService: AttendeeService) {}

  @Post()
  @Roles('ADMIN', 'ORGANIZER')
  async create(@Body() dto: CreateAttendeeDto) {
    return this.attendeeService.create(dto);
  }

  @Get()
  async findAll(
    @Query('eventId') eventId: string,
    @Query() query: PaginatedQueryDto,
  ) {
    return this.attendeeService.findAll(eventId, query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.attendeeService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'ORGANIZER')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAttendeeDto,
  ) {
    return this.attendeeService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    return this.attendeeService.remove(id);
  }
}
