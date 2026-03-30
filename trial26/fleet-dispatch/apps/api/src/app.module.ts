// TRACED:FD-APP-001 — Root application module
import { Module } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGlobalGuard } from './common/jwt-auth.guard';
import { LoggerModule } from 'nestjs-pino';
import { CORRELATION_ID_HEADER } from '@repo/shared';
import { PrismaModule } from './infra/prisma.module';
import { AuthModule } from './auth/auth.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { DriverModule } from './driver/driver.module';
import { RouteModule } from './route/route.module';
import { DispatchModule } from './dispatch/dispatch.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { TripModule } from './trip/trip.module';
import { ZoneModule } from './zone/zone.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { CorrelationInterceptor } from './common/correlation.interceptor';
import { ResponseTimeInterceptor } from './common/response-time.interceptor';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Module({
  imports: [
    // TRACED:FD-APP-002 — ThrottlerModule with high limit to avoid load test failures
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60000, limit: 100000 },
    ]),
    LoggerModule.forRoot({
      pinoHttp: {
        genReqId: (req: Request) =>
          (req.headers[CORRELATION_ID_HEADER] as string) ?? uuidv4(),
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty' }
            : undefined,
      },
    }),
    PrismaModule,
    AuthModule,
    VehicleModule,
    DriverModule,
    RouteModule,
    DispatchModule,
    MaintenanceModule,
    TripModule,
    ZoneModule,
    MonitoringModule,
  ],
  providers: [
    // TRACED:FD-APP-003 — Global guards, filters, interceptors
    { provide: APP_GUARD, useClass: JwtAuthGlobalGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: CorrelationInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseTimeInterceptor },
  ],
})
export class AppModule {}
