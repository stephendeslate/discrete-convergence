import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { WidgetModule } from './widget/widget.module';
import { DataSourceModule } from './data-source/data-source.module';
import { SyncHistoryModule } from './sync-history/sync-history.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { PrismaModule } from './infra/prisma.module';
import { GlobalExceptionFilter } from './common/global-exception.filter';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { CorrelationInterceptor } from './common/correlation.interceptor';
import { CacheHeaderInterceptor } from './common/cache-header.interceptor';
import { RolesGuard } from './auth/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 20000,
      },
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
    ]),
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
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: CorrelationInterceptor },
    { provide: APP_INTERCEPTOR, useClass: CacheHeaderInterceptor },
  ],
})
export class AppModule {}
