// TRACED: FD-INF-001 — Root application module with global guards, filters, interceptors
import { Module } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { DriverModule } from './driver/driver.module';
import { DispatchJobModule } from './dispatch-job/dispatch-job.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GlobalExceptionFilter } from './common/global-exception.filter';
import { CorrelationInterceptor } from './common/correlation.interceptor';
import { RATE_LIMIT_TTL, RATE_LIMIT_MAX } from '@fleet-dispatch/shared';

@Module({
  imports: [
    // TRACED: FD-SEC-002 — ThrottlerModule with limit 20000
    ThrottlerModule.forRoot([{ ttl: RATE_LIMIT_TTL, limit: RATE_LIMIT_MAX }]),
    PrismaModule,
    AuthModule,
    VehicleModule,
    DriverModule,
    DispatchJobModule,
    MaintenanceModule,
    AuditLogModule,
    MonitoringModule,
  ],
  providers: [
    // TRACED: FD-SEC-001 — Global APP_GUARD for JwtAuthGuard
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // TRACED: FD-SEC-002 — Global APP_GUARD for ThrottlerGuard
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // TRACED: FD-SEC-007 — Global APP_FILTER for GlobalExceptionFilter
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    // TRACED: FD-MON-004 — Global APP_INTERCEPTOR for CorrelationInterceptor
    { provide: APP_INTERCEPTOR, useClass: CorrelationInterceptor },
  ],
})
export class AppModule {}
