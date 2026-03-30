import { Module } from '@nestjs/common';
import { RouteController } from './route.controller';
import { RouteService } from './route.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [RouteController],
  providers: [RouteService, PrismaService],
})
export class RouteModule {}
