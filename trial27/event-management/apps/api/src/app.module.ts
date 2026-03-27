// TRACED: EM-INFRA-001 — Root application module
// TRACED: EM-INFRA-005 — ESLint 9 flat config enforces @typescript-eslint/no-explicit-any
// TRACED: EM-SEC-001 — Global guards (JWT + Throttler)
// TRACED: EM-SEC-006 — Global exception filter
// TRACED: EM-MON-002 — Correlation interceptor

import { Module } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { EventModule } from './event/event.module';
import { VenueModule } from './venue/venue.module';
import { TicketTypeModule } from './ticket-type/ticket-type.module';
import { RegistrationModule } from './registration/registration.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { PrismaModule } from './prisma/prisma.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './common/roles.guard';
import { GlobalExceptionFilter } from './common/global-exception.filter';
import { CorrelationInterceptor } from './common/correlation.interceptor';
import { RATE_LIMIT_TTL, RATE_LIMIT_MAX } from '@event-management/shared';

@Module({
  imports: [
    // TRACED: EM-SEC-007 — Rate limiting with high limit for load tests
    ThrottlerModule.forRoot([{ ttl: RATE_LIMIT_TTL, limit: RATE_LIMIT_MAX }]),
    PrismaModule,
    AuthModule,
    EventModule,
    VenueModule,
    TicketTypeModule,
    RegistrationModule,
    AuditLogModule,
    MonitoringModule,
  ],
  providers: [
    // TRACED: EM-SEC-001 — JWT auth guard globally applied
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // TRACED: EM-SEC-005 — RBAC roles guard globally applied
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // TRACED: EM-SEC-007 — Throttler guard globally applied
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // TRACED: EM-SEC-006 — Global exception filter
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    // TRACED: EM-MON-002 — Correlation ID interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: CorrelationInterceptor,
    },
  ],
})
export class AppModule {}
