// TRACED:EM-ARCH-001
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { EventModule } from './event/event.module';
import { VenueModule } from './venue/venue.module';
import { RegistrationModule } from './registration/registration.module';
import { CheckInModule } from './check-in/check-in.module';
import { NotificationModule } from './notification/notification.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { PrismaService } from './prisma.service';
import { GlobalExceptionFilter } from './infra/global-exception.filter';
import { ResponseTimeInterceptor } from './infra/response-time.interceptor';
import { PinoLoggerService } from './infra/logger.service';
import { RequestContextService } from './infra/request-context.service';
import { CorrelationIdMiddleware } from './infra/correlation-id.middleware';
import { RequestLoggingMiddleware } from './infra/request-logging.middleware';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60000, limit: 100 },
      { name: 'auth', ttl: 60000, limit: 5 },
    ]),
    AuthModule,
    EventModule,
    VenueModule,
    RegistrationModule,
    CheckInModule,
    NotificationModule,
    MonitoringModule,
  ],
  providers: [
    PrismaService,
    PinoLoggerService,
    RequestContextService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
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
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(CorrelationIdMiddleware, RequestLoggingMiddleware)
      .forRoutes('*');
  }
}
