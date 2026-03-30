import { Module } from '@nestjs/common';
import { RouteController } from './route.controller';
import { RouteService } from './route.service';
import { PrismaService } from '../infra/prisma.service';
import { LoggerService } from '../infra/logger.service';

@Module({
  controllers: [RouteController],
  providers: [RouteService, PrismaService, LoggerService],
})
export class RouteModule {}
