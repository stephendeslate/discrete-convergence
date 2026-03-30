import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './infra/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { WidgetModule } from './widget/widget.module';
import { DataSourceModule } from './data-source/data-source.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './infra/roles.guard';
import { GlobalExceptionFilter } from './infra/global-exception.filter';
import { ResponseTimeInterceptor } from './infra/response-time.interceptor';
import { CorrelationIdMiddleware } from './infra/correlation-id.middleware';
import { RequestLoggingMiddleware } from './infra/request-logging.middleware';
import { RequestContextService } from './infra/request-context.service';
import { LoggerService } from './infra/logger.service';

// TRACED: AE-CROSS-001
@Module({
  imports: [
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60000, limit: 100 },
      { name: 'auth', ttl: 60000, limit: 20 },
    ]),
    PrismaModule,
    AuthModule,
    DashboardModule,
    WidgetModule,
    DataSourceModule,
    MonitoringModule,
  ],
  providers: [
    RequestContextService,
    LoggerService,
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
