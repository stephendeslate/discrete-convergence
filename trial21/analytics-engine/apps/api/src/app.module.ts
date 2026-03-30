import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './infra/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { WidgetModule } from './widget/widget.module';
import { DataSourceModule } from './data-source/data-source.module';
import { DataModule } from './data/data.module';
import { EmbedModule } from './embed/embed.module';
import { ApiKeyModule } from './api-key/api-key.module';
import { AuditModule } from './audit/audit.module';
import { HealthModule } from './health/health.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './common/roles.guard';
import { ResponseTimeInterceptor } from './common/response-time.interceptor';
import { CorrelationIdMiddleware } from './common/correlation-id.middleware';

/**
 * Root application module.
 * VERIFY: AE-SEC-005 — global guards: JwtAuthGuard and ThrottlerGuard
 * VERIFY: AE-SEC-006 — throttler configuration with short/medium/long windows
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([ // TRACED: AE-SEC-006
      { name: 'short', ttl: 1000, limit: 100 },
      { name: 'medium', ttl: 10000, limit: 500 },
      { name: 'long', ttl: 60000, limit: 2000 },
    ]),
    PrismaModule,
    AuthModule,
    DashboardModule,
    WidgetModule,
    DataSourceModule,
    DataModule,
    EmbedModule,
    ApiKeyModule,
    AuditModule,
    HealthModule,
    MonitoringModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard }, // TRACED: AE-SEC-005 // TRACED: AE-SEC-012
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: ResponseTimeInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
