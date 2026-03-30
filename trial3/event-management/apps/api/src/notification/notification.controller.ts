// TRACED:EM-NOT-002
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  Header,
} from '@nestjs/common';
import { Request } from 'express';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { AuthenticatedUser } from '../common/auth-utils';
import { PaginatedResult } from '../common/pagination.utils';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('notifications')
  @Header('Cache-Control', 'private, max-age=10')
  async findAll(
    @Query() query: PaginatedQueryDto,
    @Req() req: Request,
  ): Promise<PaginatedResult<Record<string, unknown>>> {
    const user = req.user as AuthenticatedUser;
    return this.notificationService.findAll(user.organizationId, query);
  }

  @Post('events/:eventId/notify')
  async broadcast(
    @Param('eventId') eventId: string,
    @Body() dto: CreateNotificationDto,
    @Req() req: Request,
  ): Promise<Record<string, unknown>> {
    const user = req.user as AuthenticatedUser;
    return this.notificationService.broadcast(
      eventId,
      dto,
      user.organizationId,
    );
  }
}
