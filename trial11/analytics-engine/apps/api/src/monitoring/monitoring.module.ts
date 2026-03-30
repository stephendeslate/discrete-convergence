import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';
import { PrismaService } from '../common/prisma.service';
import { CorrelationIdMiddleware } from '../common/correlation-id.middleware';
import { RequestLoggingMiddleware } from '../common/request-logging.middleware';

@Module({
  controllers: [MonitoringController],
  providers: [MonitoringService, PrismaService],
  exports: [MonitoringService],
})
export class MonitoringModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIdMiddleware, RequestLoggingMiddleware)
      .forRoutes('*');
  }
}
