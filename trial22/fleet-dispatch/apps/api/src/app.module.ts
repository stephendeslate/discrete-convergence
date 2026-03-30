import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { PrismaModule } from './infra/prisma.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './common/roles.guard';
import { GlobalExceptionFilter } from './common/global-exception.filter';
import { ResponseTimeInterceptor } from './common/response-time.interceptor';
import { CorrelationIdMiddleware } from './common/correlation-id.middleware';
import { HealthModule } from './health/health.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { DriverModule } from './driver/driver.module';
import { RouteModule } from './route/route.module';
import { TripModule } from './trip/trip.module';
import { StopModule } from './stop/stop.module';
import { DispatchModule } from './dispatch/dispatch.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { FuelModule } from './fuel/fuel.module';
import { GeofenceModule } from './geofence/geofence.module';
import { AlertModule } from './alert/alert.module';
import { NotificationModule } from './notification/notification.module';
import { AuditModule } from './audit/audit.module';

// TRACED: FD-INFRA-001
// TRACED: FD-MON-005
// TRACED: FD-SEC-002
@Module({
  imports: [
    ThrottlerModule.forRoot([{ name: 'short', ttl: 1000, limit: 100 }]),
    CacheModule.register({ ttl: 60, max: 100, isGlobal: true }),
    PrismaModule,
    AuthModule,
    HealthModule,
    VehicleModule,
    DriverModule,
    RouteModule,
    TripModule,
    StopModule,
    DispatchModule,
    MaintenanceModule,
    FuelModule,
    GeofenceModule,
    AlertModule,
    NotificationModule,
    AuditModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseTimeInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
