// TRACED:AE-CROSS-001 — AppModule wiring all domain modules with global guards and middleware
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DataSourceModule } from './data-source/data-source.module';
import { WidgetModule } from './widget/widget.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './common/roles.guard';
import { GlobalExceptionFilter } from './common/global-exception.filter';
import { ResponseTimeInterceptor } from './common/response-time.interceptor';
import { CorrelationIdMiddleware } from './common/correlation-id.middleware';
import { RequestLoggingMiddleware } from './common/request-logging.middleware';
import { RequestContextService } from './common/request-context.service';
import { PrismaService } from './common/prisma.service';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    AuthModule,
    DashboardModule,
    DataSourceModule,
    WidgetModule,
    MonitoringModule,
  ],
  providers: [
    PrismaService,
    RequestContextService,
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
