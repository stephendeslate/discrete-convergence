import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './infra/prisma.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './common/roles.guard';
import { ResponseTimeInterceptor } from './infra/response-time.interceptor';
import { CorrelationIdMiddleware } from './infra/correlation-id.middleware';
import { EventModule } from './event/event.module';
import { SessionModule } from './session/session.module';
import { VenueModule } from './venue/venue.module';
import { TicketTypeModule } from './ticket-type/ticket-type.module';
import { RegistrationModule } from './registration/registration.module';
import { CheckInModule } from './check-in/check-in.module';
import { WaitlistModule } from './waitlist/waitlist.module';
import { NotificationModule } from './notification/notification.module';
import { OrganizationModule } from './organization/organization.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DataSourceModule } from './data-source/data-source.module';
import { PublicEventModule } from './public-event/public-event.module';

/** TRACED:EM-INF-007 — AppModule with global guards, throttler, interceptors */
@Module({
  imports: [
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 100 },
      { name: 'medium', ttl: 10000, limit: 500 },
      { name: 'long', ttl: 60000, limit: 2000 },
    ]),
    PrismaModule,
    AuthModule,
    EventModule,
    SessionModule,
    VenueModule,
    TicketTypeModule,
    RegistrationModule,
    CheckInModule,
    WaitlistModule,
    NotificationModule,
    OrganizationModule,
    AuditLogModule,
    HealthModule,
    MetricsModule,
    DashboardModule,
    DataSourceModule,
    PublicEventModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: ResponseTimeInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
