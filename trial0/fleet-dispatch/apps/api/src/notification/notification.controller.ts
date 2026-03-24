import { Controller, Get, Query, Request } from '@nestjs/common';
import { NotificationService } from './notification.service';

interface AuthenticatedRequest {
  user: { sub: string; companyId: string };
}

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  findAll(
    @Request() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificationService.findAll(req.user.companyId, Number(page), Number(limit));
  }
}
