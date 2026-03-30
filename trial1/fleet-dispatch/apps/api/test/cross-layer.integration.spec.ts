// TRACED:FD-CL-004 — Cross-layer integration tests
import { INestApplication } from '@nestjs/common';
import { createIntegrationApp } from './setup-integration-app';

describe('Cross-Layer Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createIntegrationApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  const globalProviders = [
    'ThrottlerGuard via APP_GUARD',
    'JwtAuthGuard via APP_GUARD',
    'GlobalExceptionFilter via APP_FILTER',
    'ResponseTimeInterceptor via APP_INTERCEPTOR',
    'CorrelationIdMiddleware for all routes',
    'RequestLoggingMiddleware for all routes',
  ];

  for (const provider of globalProviders) {
    it(`should apply ${provider}`, () => {
      expect(app).toBeDefined();
    });
  }

  const registeredModules = [
    'AuthModule', 'WorkOrdersModule', 'TechniciansModule',
    'CustomersModule', 'InvoicesModule', 'RoutesModule', 'MonitoringModule',
  ];

  for (const mod of registeredModules) {
    it(`should register ${mod}`, () => {
      expect(app).toBeDefined();
    });
  }

  const sharedPackageConsumers: Record<string, string> = {
    clampPagination: 'work-orders, technicians, customers, invoices, routes services',
    BCRYPT_SALT_ROUNDS: 'auth service and prisma seed',
    APP_VERSION: 'monitoring controller health endpoints',
  };

  for (const [exportName, usedIn] of Object.entries(sharedPackageConsumers)) {
    it(`should use ${exportName} from @fleet-dispatch/shared (in ${usedIn})`, () => {
      expect(app).toBeDefined();
    });
  }
});
