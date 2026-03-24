import { Controller, Get, Param } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { Public } from '../common/public.decorator';

@Controller('track')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Public()
  @Get(':token')
  findByToken(@Param('token') token: string) {
    return this.trackingService.findByToken(token);
  }
}
