// TRACED:AE-APP-001 — Root module with APP_GUARD, APP_FILTER, APP_INTERCEPTOR via DI
import { Module } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DataSourceModule } from './data-source/data-source.module';
import { WidgetModule } from './widget/widget.module';
import { EmbedModule } from './embed/embed.module';
import { ApiKeyModule } from './api-key/api-key.module';
import { AuditModule } from './audit/audit.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { PrismaModule } from './common/prisma.module';
import { GlobalExceptionFilter } from './common/global-exception.filter';
import { ResponseTimeInterceptor } from './common/response-time.interceptor';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { CorrelationIdMiddleware } from './common/correlation-id.middleware';
import { RequestLoggingMiddleware } from './common/request-logging.middleware';
import { RequestContextModule } from './common/request-context.module';
import { LoggerModule } from './common/logger.module';
import { MiddlewareConsumer, NestModule } from '@nestjs/common';

@Module({
  imports: [
    // TRACED:AE-SEC-004 — ThrottlerModule with both named configs
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60000, limit: 100 },
      { name: 'auth', ttl: 60000, limit: 5 },
    ]),
    PrismaModule,
    RequestContextModule,
    LoggerModule,
    AuthModule,
    DashboardModule,
    DataSourceModule,
    WidgetModule,
    EmbedModule,
    ApiKeyModule,
    AuditModule,
    MonitoringModule,
  ],
  providers: [
    // TRACED:AE-GUARD-001 — ThrottlerGuard as APP_GUARD
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // TRACED:AE-GUARD-002 — JwtAuthGuard as APP_GUARD (global, @Public() exempts)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // TRACED:AE-FILTER-001 — GlobalExceptionFilter as APP_FILTER
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    // TRACED:AE-PERF-001 — ResponseTimeInterceptor as APP_INTERCEPTOR
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
