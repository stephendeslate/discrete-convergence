import { Controller, Get, Param } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { Public } from '../auth/public.decorator';

/**
 * Public tracking endpoint — no auth required.
 * TRACED: FD-TRACK-002
 */
@Controller('track')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Public()
  @Get(':token')
  async getByToken(@Param('token') token: string) {
    return this.trackingService.getByToken(token);
  }
}
