import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DataSourceModule } from './data-source/data-source.module';
import { WidgetModule } from './widget/widget.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { PrismaService } from './common/prisma.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { GlobalExceptionFilter } from './common/global-exception.filter';
import { ResponseTimeInterceptor } from './common/response-time.interceptor';
import { RequestContextService } from './common/request-context.service';

// TRACED: AE-ARCH-001
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // TRACED: AE-SEC-008
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60000, limit: 100 },
      { name: 'auth', ttl: 60000, limit: 5 },
    ]),
    AuthModule,
    DashboardModule,
    DataSourceModule,
    WidgetModule,
    MonitoringModule,
  ],
  providers: [
    PrismaService,
    RequestContextService,
    // TRACED: AE-ARCH-002
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    // TRACED: AE-ARCH-003
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    // TRACED: AE-ARCH-004
    { provide: APP_INTERCEPTOR, useClass: ResponseTimeInterceptor },
  ],
  exports: [PrismaService],
})
export class AppModule {}
