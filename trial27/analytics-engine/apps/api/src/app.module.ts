import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { RATE_LIMIT_TTL, RATE_LIMIT_MAX } from '@analytics-engine/shared';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { WidgetModule } from './widget/widget.module';
import { DataSourceModule } from './data-source/data-source.module';
import { SyncHistoryModule } from './sync-history/sync-history.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { InfraModule } from './infra/infra.module';
import { GlobalExceptionFilter } from './common/global-exception.filter';
import { CorrelationInterceptor } from './common/correlation.interceptor';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

// TRACED: AE-SEC-004 — Rate limiting
// TRACED: AE-SEC-006 — Helmet CSP
// TRACED: AE-INFRA-006 — GitHub Actions

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: RATE_LIMIT_TTL,
        limit: RATE_LIMIT_MAX,
      },
    ]),
    InfraModule,
    AuthModule,
    DashboardModule,
    WidgetModule,
    DataSourceModule,
    SyncHistoryModule,
    AuditLogModule,
    MonitoringModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CorrelationInterceptor,
    },
  ],
})
export class AppModule {}
