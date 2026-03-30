// TRACED:EM-API-006 — Notification endpoints (no @UseGuards)
import { Controller, Get, Post, Param, Body, Query, Req, Header } from '@nestjs/common';
import { Request } from 'express';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PaginatedQueryDto } from '../common/paginated-query';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('notifications')
  @Header('Cache-Control', 'public, max-age=10, stale-while-revalidate=30')
  async findAll(@Query() query: PaginatedQueryDto, @Req() req: Request) {
    const user = req.user as { organizationId: string };
    return this.notificationService.findAll(user.organizationId, query.page, query.pageSize);
  }

  @Post('events/:eventId/notify')
  async broadcast(
    @Param('eventId') eventId: string,
    @Body() dto: CreateNotificationDto,
    @Req() req: Request,
  ) {
    const user = req.user as { organizationId: string };
    return this.notificationService.broadcast(eventId, dto, user.organizationId);
  }
}
