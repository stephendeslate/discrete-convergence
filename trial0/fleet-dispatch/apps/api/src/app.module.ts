// TRACED:FD-APP-001
// TRACED:FD-SEC-004
// TRACED:FD-GUARD-001
// TRACED:FD-GUARD-002
// TRACED:FD-FILTER-001
// TRACED:FD-PERF-001
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './common/prisma.module';
import { LoggerModule } from './common/logger.module';
import { RequestContextModule } from './common/request-context.module';
import { GlobalExceptionFilter } from './common/global-exception.filter';
import { ResponseTimeInterceptor } from './common/response-time.interceptor';
import { CorrelationIdMiddleware } from './common/correlation-id.middleware';
import { RequestLoggingMiddleware } from './common/request-logging.middleware';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AuthModule } from './auth/auth.module';
import { WorkOrderModule } from './work-order/work-order.module';
import { TechnicianModule } from './technician/technician.module';
import { CustomerModule } from './customer/customer.module';
import { RouteModule } from './route/route.module';
import { GpsModule } from './gps/gps.module';
import { InvoiceModule } from './invoice/invoice.module';
import { TrackingModule } from './tracking/tracking.module';
import { PhotoModule } from './photo/photo.module';
import { NotificationModule } from './notification/notification.module';
import { AuditModule } from './audit/audit.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { DispatchModule } from './dispatch/dispatch.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    LoggerModule,
    RequestContextModule,
    AuthModule,
    WorkOrderModule,
    TechnicianModule,
    CustomerModule,
    RouteModule,
    GpsModule,
    InvoiceModule,
    TrackingModule,
    PhotoModule,
    NotificationModule,
    AuditModule,
    MonitoringModule,
    DispatchModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseTimeInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIdMiddleware, RequestLoggingMiddleware)
      .forRoutes('*');
  }
}
