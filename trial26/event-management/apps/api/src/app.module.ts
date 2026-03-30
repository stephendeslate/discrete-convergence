// TRACED:EM-SEC-003 TRACED:EM-INFRA-003 TRACED:EM-INFRA-004 TRACED:EM-INFRA-006 TRACED:EM-MON-006
import { Module } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { CORRELATION_ID_HEADER } from '@repo/shared';
import { PrismaModule } from './infra/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EventModule } from './event/event.module';
import { VenueModule } from './venue/venue.module';
import { TicketModule } from './ticket/ticket.module';
import { AttendeeModule } from './attendee/attendee.module';
import { SpeakerModule } from './speaker/speaker.module';
import { SessionModule } from './session/session.module';
import { SponsorModule } from './sponsor/sponsor.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { CorrelationInterceptor } from './common/correlation.interceptor';
import { ResponseTimeInterceptor } from './common/response-time.interceptor';
import { JwtAuthGuard } from './common/jwt-auth.guard';
import { RolesGuard } from './common/roles.guard';
import { IncomingMessage } from 'http';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100000 }]),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env['NODE_ENV'] !== 'production' ? { target: 'pino-pretty' } : undefined,
        genReqId: (req: IncomingMessage) => {
          const headers = req.headers;
          return (headers[CORRELATION_ID_HEADER] as string) ?? crypto.randomUUID();
        },
        serializers: {
          req: (req: IncomingMessage) => ({
            method: (req as unknown as Record<string, unknown>)['method'],
            url: (req as unknown as Record<string, unknown>)['url'],
          }),
        },
      },
    }),
    PrismaModule,
    AuthModule,
    EventModule,
    VenueModule,
    TicketModule,
    AttendeeModule,
    SpeakerModule,
    SessionModule,
    SponsorModule,
    MonitoringModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: CorrelationInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseTimeInterceptor },
  ],
})
export class AppModule {}
