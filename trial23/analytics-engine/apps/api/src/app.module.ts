// TRACED:AE-AUTH-004 — JwtAuthGuard registered as global APP_GUARD
// TRACED:AE-SEC-002 — ThrottlerModule with short, medium, long named configs
// TRACED:AE-CROSS-001 — Global provider chain: APP_GUARD, APP_FILTER, APP_INTERCEPTOR
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { WidgetModule } from './widget/widget.module';
import { DataSourceModule } from './data-source/data-source.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { PrismaModule } from './infra/prisma.module';
import { JwtAuthGuard } from './common/jwt-auth.guard';
import { RolesGuard } from './common/roles.guard';
import { GlobalExceptionFilter } from './common/global-exception.filter';
import { ResponseTimeInterceptor } from './common/response-time.interceptor';
import { CorrelationIdMiddleware } from './common/correlation-id.middleware';
import { RequestLoggingMiddleware } from './common/request-logging.middleware';
import { RequestContextService } from './common/request-context.service';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 20000 },
      { name: 'medium', ttl: 10000, limit: 100000 },
      { name: 'long', ttl: 60000, limit: 500000 },
    ]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env['JWT_SECRET'],
        signOptions: { expiresIn: '1h' },
      }),
    }),
    AuthModule,
    DashboardModule,
    WidgetModule,
    DataSourceModule,
    MonitoringModule,
    PrismaModule,
  ],
  providers: [
    RequestContextService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseTimeInterceptor },
  ],
  exports: [RequestContextService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware, RequestLoggingMiddleware).forRoutes('*');
  }
}
