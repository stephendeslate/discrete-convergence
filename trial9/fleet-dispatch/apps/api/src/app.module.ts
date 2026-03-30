import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { DriverModule } from './driver/driver.module';
import { RouteModule } from './route/route.module';
import { DispatchModule } from './dispatch/dispatch.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { JwtAuthGuard } from './infra/jwt-auth.guard';
import { RolesGuard } from './infra/roles.guard';
import { GlobalExceptionFilter } from './infra/global-exception.filter';
import { ResponseTimeInterceptor } from './infra/response-time.interceptor';
import { CorrelationIdMiddleware } from './monitoring/correlation-id.middleware';
import { RequestLoggingMiddleware } from './monitoring/request-logging.middleware';
import { RequestContextService } from './monitoring/request-context.service';
import { PinoLoggerService } from './monitoring/pino-logger.service';
import {
  THROTTLE_DEFAULT_TTL,
  THROTTLE_DEFAULT_LIMIT,
  THROTTLE_AUTH_LIMIT,
} from '@fleet-dispatch/shared';

// TRACED: FD-ARCH-001
@Module({
  imports: [
    ThrottlerModule.forRoot([
      { name: 'default', ttl: THROTTLE_DEFAULT_TTL, limit: THROTTLE_DEFAULT_LIMIT },
      { name: 'auth', ttl: THROTTLE_DEFAULT_TTL, limit: THROTTLE_AUTH_LIMIT },
    ]),
    AuthModule,
    VehicleModule,
    DriverModule,
    RouteModule,
    DispatchModule,
    MaintenanceModule,
    MonitoringModule,
  ],
  providers: [
    RequestContextService,
    PinoLoggerService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTimeInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(CorrelationIdMiddleware, RequestLoggingMiddleware)
      .forRoutes('*');
  }
}
