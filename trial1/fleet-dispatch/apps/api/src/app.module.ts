import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { WorkOrdersModule } from './work-orders/work-orders.module';
import { TechniciansModule } from './technicians/technicians.module';
import { CustomersModule } from './customers/customers.module';
import { InvoicesModule } from './invoices/invoices.module';
import { RoutesModule } from './routes/routes.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { PrismaService } from './common/services/prisma.service';
import { PinoLoggerService } from './common/services/pino-logger.service';
import { RequestContextService } from './common/services/request-context.service';
import { MetricsService } from './common/services/metrics.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseTimeInterceptor } from './common/interceptors/response-time.interceptor';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { RequestLoggingMiddleware } from './common/middleware/request-logging.middleware';

// TRACED:FD-CL-003 — AppModule with APP_GUARD, APP_FILTER, APP_INTERCEPTOR
// TRACED:FD-SEC-002 — ThrottlerModule with named configs (default + auth)
@Module({
  imports: [
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60000, limit: 100 },
      { name: 'auth', ttl: 60000, limit: 5 },
    ]),
    AuthModule,
    WorkOrdersModule,
    TechniciansModule,
    CustomersModule,
    InvoicesModule,
    RoutesModule,
    MonitoringModule,
  ],
  providers: [
    PrismaService,
    PinoLoggerService,
    RequestContextService,
    MetricsService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseTimeInterceptor },
  ],
  exports: [PrismaService, PinoLoggerService, RequestContextService, MetricsService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(CorrelationIdMiddleware, RequestLoggingMiddleware)
      .forRoutes('*');
  }
}
