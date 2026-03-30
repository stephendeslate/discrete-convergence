// TRACED:AE-APP-001 — Root application module
// TRACED:API-GLOBAL-PROVIDERS — ThrottlerGuard, RolesGuard, GlobalExceptionFilter, CorrelationInterceptor, ResponseTimeInterceptor (VERIFY:API-GLOBAL-PROVIDERS)
import { Module } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { CORRELATION_ID_HEADER } from '@repo/shared';
import { PrismaModule } from './infra/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { WidgetModule } from './widget/widget.module';
import { DataSourceModule } from './data-source/data-source.module';
import { SyncHistoryModule } from './sync-history/sync-history.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { GlobalExceptionFilter } from './common/http-exception.filter';
import { CorrelationInterceptor } from './common/correlation.interceptor';
import { ResponseTimeInterceptor } from './common/response-time.interceptor';
import { RolesGuard } from './common/roles.guard';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100000 }]),
    LoggerModule.forRoot({
      pinoHttp: {
        genReqId: (req: { headers: Record<string, string | string[] | undefined> }) => {
          const existing = req.headers[CORRELATION_ID_HEADER];
          if (existing) {
            return Array.isArray(existing) ? existing[0] : existing;
          }
          return crypto.randomUUID();
        },
        transport: process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
      },
    }),
    PrismaModule,
    AuthModule,
    DashboardModule,
    WidgetModule,
    DataSourceModule,
    SyncHistoryModule,
    AuditLogModule,
    MonitoringModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: CorrelationInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseTimeInterceptor },
  ],
})
export class AppModule {}
