import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { EventModule } from './event/event.module';
import { VenueModule } from './venue/venue.module';
import { TicketModule } from './ticket/ticket.module';
import { AttendeeModule } from './attendee/attendee.module';
import { ScheduleModule } from './schedule/schedule.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { JwtAuthGuard } from './infra/jwt-auth.guard';
import { RolesGuard } from './infra/roles.guard';
import { GlobalExceptionFilter } from './infra/global-exception.filter';
import { ResponseTimeInterceptor } from './infra/response-time.interceptor';
import { CorrelationIdMiddleware } from './infra/correlation-id.middleware';
import { RequestLoggingMiddleware } from './infra/request-logging.middleware';

// TRACED: EM-INFRA-003
@Module({
  imports: [
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60000, limit: 100 },
      { name: 'auth', ttl: 60000, limit: 5 },
    ]),
    AuthModule,
    EventModule,
    VenueModule,
    TicketModule,
    AttendeeModule,
    ScheduleModule,
    MonitoringModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTimeInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIdMiddleware, RequestLoggingMiddleware)
      .forRoutes('*');
  }
}
