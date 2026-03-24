// TRACED:FD-INF-003 — root application module with global guards and providers
import { Module, type MiddlewareConsumer, type NestModule } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { DriverModule } from './driver/driver.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { DeliveryModule } from './delivery/delivery.module';
import { RouteModule } from './route/route.module';
import { TenantModule } from './tenant/tenant.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseTimeInterceptor } from './common/interceptors/response-time.interceptor';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { RequestLoggingMiddleware } from './common/middleware/request-logging.middleware';
import { PrismaService } from './common/services/prisma.service';
import { PinoLoggerService } from './common/services/pino-logger.service';
import { MetricsService } from './common/services/metrics.service';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    AuthModule,
    DriverModule,
    VehicleModule,
    DeliveryModule,
    RouteModule,
    TenantModule,
    AuditLogModule,
    MonitoringModule,
  ],
  providers: [
    PrismaService,
    PinoLoggerService,
    MetricsService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseTimeInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(CorrelationIdMiddleware, RequestLoggingMiddleware)
      .forRoutes('*');
  }
}
