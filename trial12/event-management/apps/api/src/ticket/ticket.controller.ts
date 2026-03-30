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
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { RequestWithUser } from '../common/request-with-user';
import { PaginatedQuery } from '../common/paginated-query';

// TRACED: EM-TICKET-004
@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  create(@Req() req: RequestWithUser, @Body() dto: CreateTicketDto) {
    return this.ticketService.create(req.user.tenantId, dto);
  }

  @Get()
  async findAll(
    @Req() req: RequestWithUser,
    @Query() query: PaginatedQuery,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('Cache-Control', 'private, max-age=30');
    return this.ticketService.findAll(req.user.tenantId, query.page, query.pageSize);
  }

  @Get(':id')
  findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.ticketService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateTicketDto,
  ) {
    return this.ticketService.update(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.ticketService.remove(req.user.tenantId, id);
  }
}
