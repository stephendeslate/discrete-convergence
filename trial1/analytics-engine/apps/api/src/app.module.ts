// TRACED:AE-AUTH-004 — JwtAuthGuard registered as global APP_GUARD
// TRACED:AE-SEC-002 — ThrottlerModule with default and auth named configs
// TRACED:AE-CROSS-001 — Global provider chain: APP_GUARD, APP_FILTER, APP_INTERCEPTOR
import { Module } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { WidgetModule } from './widget/widget.module';
import { DataSourceModule } from './data-source/data-source.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { PrismaService } from './common/prisma.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { GlobalExceptionFilter } from './common/global-exception.filter';
import { ResponseTimeInterceptor } from './common/response-time.interceptor';
import { CorrelationIdMiddleware } from './common/correlation-id.middleware';
import { RequestLoggingMiddleware } from './common/request-logging.middleware';
import { RequestContextService } from './common/request-context.service';
import { MiddlewareConsumer, NestModule } from '@nestjs/common';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60000, limit: 100 },
      { name: 'auth', ttl: 60000, limit: 5 },
    ]),
    JwtModule.register({
      secret: process.env['JWT_SECRET'],
      signOptions: { expiresIn: '15m' },
    }),
    AuthModule,
    DashboardModule,
    WidgetModule,
    DataSourceModule,
    MonitoringModule,
  ],
  providers: [
    PrismaService,
    RequestContextService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseTimeInterceptor },
  ],
  exports: [PrismaService, RequestContextService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware, RequestLoggingMiddleware).forRoutes('*');
  }
}
