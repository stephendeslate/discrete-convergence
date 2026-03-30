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
import { Request, Response } from 'express';
import { TicketService } from './ticket.service';
import { CreateTicketDto, UpdateTicketDto } from './ticket.dto';
import { PaginatedQueryDto } from '../common/paginated-query';

interface AuthenticatedUser {
  userId: string;
  tenantId: string;
  role: string;
}

// TRACED:EM-TKT-004
@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  async create(@Body() dto: CreateTicketDto, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.ticketService.create(dto, user.userId, user.tenantId);
  }

  @Get()
  async findAll(
    @Query() query: PaginatedQueryDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user as AuthenticatedUser;
    res.setHeader('Cache-Control', 'private, max-age=30');
    return this.ticketService.findAll(user.tenantId, query.page, query.pageSize);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.ticketService.findOne(id, user.tenantId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTicketDto,
    @Req() req: Request,
  ) {
    const user = req.user as AuthenticatedUser;
    return this.ticketService.update(id, dto, user.tenantId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.ticketService.remove(id, user.tenantId);
  }
}
