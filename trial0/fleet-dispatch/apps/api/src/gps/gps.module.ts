import { Module } from '@nestjs/common';
import { GpsGateway } from './gps.gateway';

@Module({
  providers: [GpsGateway],
})
export class GpsModule {}
