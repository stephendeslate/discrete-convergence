import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('notifications/:eventId')
  async findByEvent(
    @Param('eventId') eventId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificationService.findByEvent(
      eventId,
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
    );
  }

  @Post('events/:eventId/notify')
  async broadcast(
    @Param('eventId') eventId: string,
    @Body() body: { subject: string; body: string },
  ) {
    return this.notificationService.broadcast(eventId, body.subject, body.body);
  }
}
