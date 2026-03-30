// TRACED:APP-MODULE — Root module with guards, interceptors, filters
import { Module } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { WidgetModule } from './widget/widget.module';
import { DataSourceModule } from './data-source/data-source.module';
import { SyncHistoryModule } from './sync-history/sync-history.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { PrismaModule } from './infra/prisma.module';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { CorrelationInterceptor } from './common/correlation.interceptor';
import { ResponseTimeInterceptor } from './common/response-time.interceptor';
import { CORRELATION_ID_HEADER } from '@repo/shared';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100000 }]),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV === 'development'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
        customProps: () => ({ service: 'analytics-engine-api' }),
        redact: ['req.headers.authorization', 'req.headers.cookie'],
        genReqId: (req: unknown) => {
          const r = req as { headers?: Record<string, string | string[] | undefined> };
          const header = r.headers?.[CORRELATION_ID_HEADER];
          const value = Array.isArray(header) ? header[0] : header;
          return value ?? crypto.randomUUID();
        },
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
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: CorrelationInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseTimeInterceptor },
  ],
})
export class AppModule {}
