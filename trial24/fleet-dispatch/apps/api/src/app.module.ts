// TRACED:API-APP-MODULE
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from './infra/prisma.module';
import { AuthModule } from './auth/auth.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { DriverModule } from './driver/driver.module';
import { RouteModule } from './route/route.module';
import { DispatchModule } from './dispatch/dispatch.module';
import { TripModule } from './trip/trip.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { ZoneModule } from './zone/zone.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { CorrelationInterceptor } from './common/correlation.interceptor';
import { ResponseTimeInterceptor } from './common/response-time.interceptor';
import { CORRELATION_ID_HEADER } from '@fleet-dispatch/shared';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
        level: process.env.LOG_LEVEL ?? 'info',
        autoLogging: true,
        redact: ['req.headers.authorization', 'req.headers.cookie'],
        genReqId: (req: unknown) => {
          const r = req as { headers?: Record<string, string | string[] | undefined> };
          const header = r.headers?.[CORRELATION_ID_HEADER];
          const value = Array.isArray(header) ? header[0] : header;
          return value ?? crypto.randomUUID();
        },
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100000,
      },
    ]),
    PrismaModule,
    AuthModule,
    VehicleModule,
    DriverModule,
    RouteModule,
    DispatchModule,
    TripModule,
    MaintenanceModule,
    ZoneModule,
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
