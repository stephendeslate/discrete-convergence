import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseInterceptors } from '@nestjs/common';
import { TicketTypeService } from './ticket-type.service';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { RequestWithUser } from '../common/request-with-user';
import { CacheControlInterceptor } from '../common/cache-control.interceptor';

@Controller('ticket-types')
export class TicketTypeController {
  constructor(private readonly ticketTypeService: TicketTypeService) {}

  @Get()
  @UseInterceptors(CacheControlInterceptor)
  findAll(@Req() req: RequestWithUser, @Query() query: PaginatedQueryDto) {
    return this.ticketTypeService.findAll(req.user.tenantId, query);
  }

  @Get(':id')
  findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.ticketTypeService.findOne(id, req.user.tenantId);
  }

  @Post()
  create(@Req() req: RequestWithUser, @Body() dto: CreateTicketTypeDto) {
    return this.ticketTypeService.create(req.user.tenantId, dto);
  }

  @Put(':id')
  update(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: UpdateTicketTypeDto) {
    return this.ticketTypeService.update(id, req.user.tenantId, dto);
  }

  @Delete(':id')
  remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.ticketTypeService.remove(id, req.user.tenantId);
  }
}
