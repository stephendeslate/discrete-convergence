// TRACED:EM-AUTH-004 — Global APP_GUARD chain (ThrottlerGuard + JwtAuthGuard)
// TRACED:EM-SEC-002 — ThrottlerModule with named rate limit configs
// TRACED:EM-CROSS-001 — Provider chain (APP_GUARD + APP_FILTER + APP_INTERCEPTOR)
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { EventModule } from './event/event.module';
import { VenueModule } from './venue/venue.module';
import { RegistrationModule } from './registration/registration.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { PrismaService } from './common/prisma.service';
import { RequestContextService } from './common/request-context.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { GlobalExceptionFilter } from './common/global-exception.filter';
import { ResponseTimeInterceptor } from './common/response-time.interceptor';
import { CorrelationIdMiddleware } from './common/correlation-id.middleware';
import { RequestLoggingMiddleware } from './common/request-logging.middleware';

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
    MonitoringModule,
  ],
  providers: [
    PrismaService,
    RequestContextService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseTimeInterceptor },
  ],
  exports: [PrismaService, RequestContextService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware, RequestLoggingMiddleware).forRoutes('*');
  }
}
