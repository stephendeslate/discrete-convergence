import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from './infra/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CompanyModule } from './company/company.module';
import { WorkOrderModule } from './work-order/work-order.module';
import { TechnicianModule } from './technician/technician.module';
import { CustomerModule } from './customer/customer.module';
import { RouteModule } from './route/route.module';
import { InvoiceModule } from './invoice/invoice.module';
import { PhotoModule } from './photo/photo.module';
import { NotificationModule } from './notification/notification.module';
import { TrackingModule } from './tracking/tracking.module';
import { AuditModule } from './audit/audit.module';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DataSourceModule } from './data-source/data-source.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ResponseTimeInterceptor } from './infra/response-time.interceptor';
import { CorrelationIdMiddleware } from './infra/correlation-id.middleware';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 100 },
      { name: 'medium', ttl: 10000, limit: 500 },
      { name: 'long', ttl: 60000, limit: 2000 },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env['JWT_SECRET'] ?? 'dev-secret',
      signOptions: { expiresIn: '1h' },
    }),
    PrismaModule,
    AuthModule,
    CompanyModule,
    WorkOrderModule,
    TechnicianModule,
    CustomerModule,
    RouteModule,
    InvoiceModule,
    PhotoModule,
    NotificationModule,
    TrackingModule,
    AuditModule,
    HealthModule,
    MetricsModule,
    DashboardModule,
    DataSourceModule,
    MonitoringModule,
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
