// TRACED:EM-APP-001 — Root module with APP_GUARD, APP_FILTER, APP_INTERCEPTOR via DI
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './common/prisma.module';
import { RequestContextModule } from './common/request-context.module';
import { LoggerModule } from './common/logger.module';
import { AuthModule } from './auth/auth.module';
import { EventModule } from './event/event.module';
import { VenueModule } from './venue/venue.module';
import { RegistrationModule } from './registration/registration.module';
import { CheckInModule } from './check-in/check-in.module';
import { NotificationModule } from './notification/notification.module';
import { AuditModule } from './audit/audit.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { GlobalExceptionFilter } from './common/global-exception.filter';
import { ResponseTimeInterceptor } from './common/response-time.interceptor';
import { CorrelationIdMiddleware } from './common/correlation-id.middleware';
import { RequestLoggingMiddleware } from './common/request-logging.middleware';

@Module({
  imports: [
    // TRACED:EM-SEC-004 — ThrottlerModule with both named configs
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60000, limit: 100 },
      { name: 'auth', ttl: 60000, limit: 5 },
    ]),
    PrismaModule,
    RequestContextModule,
    LoggerModule,
    AuthModule,
    EventModule,
    VenueModule,
    RegistrationModule,
    CheckInModule,
    NotificationModule,
    AuditModule,
    MonitoringModule,
  ],
  providers: [
    // TRACED:EM-GUARD-001 — ThrottlerGuard as APP_GUARD
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // TRACED:EM-GUARD-002 — JwtAuthGuard as APP_GUARD (global, @Public() exempts)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // TRACED:EM-FILTER-001 — GlobalExceptionFilter as APP_FILTER
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    // TRACED:EM-PERF-001 — ResponseTimeInterceptor as APP_INTERCEPTOR
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTimeInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware, RequestLoggingMiddleware).forRoutes('*');
  }
}
