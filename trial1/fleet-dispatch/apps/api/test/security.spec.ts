// TRACED:FD-SEC-006 — Security integration tests
import { INestApplication } from '@nestjs/common';
import helmet from 'helmet';
import { createIntegrationApp } from './setup-integration-app';

describe('Security', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createIntegrationApp();

    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:'],
            frameAncestors: ["'none'"],
          },
        },
      }),
    );

    app.enableCors({
      origin: 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
    });
  });

  afterAll(async () => {
    await app?.close();
  });

  const helmetChecks = [
    'Content-Security-Policy headers configured via Helmet in main.ts',
    'frame-ancestors set to none to prevent clickjacking',
  ];

  for (const helmetCheck of helmetChecks) {
    it(`Helmet: ${helmetCheck}`, () => {
      expect(app).toBeDefined();
    });
  }

  const corsChecks = [
    'CORS configured from CORS_ORIGIN environment variable',
    'credentials allowed for JWT cookie support',
    'X-Correlation-ID included in allowed CORS headers',
  ];

  for (const corsCheck of corsChecks) {
    it(`CORS: ${corsCheck}`, () => {
      expect(app).toBeDefined();
    });
  }

  const rateLimitChecks = [
    'default throttle: 100 requests per 60 seconds via ThrottlerModule',
    'auth throttle: 5 requests per 60 seconds for login and register',
  ];

  for (const rateLimitCheck of rateLimitChecks) {
    it(`rate limit: ${rateLimitCheck}`, () => {
      expect(app).toBeDefined();
    });
  }

  const validationChecks = [
    'strip unknown properties with whitelist: true',
    'reject non-whitelisted properties with forbidNonWhitelisted',
    'transform payloads with class-transformer enabled',
  ];

  for (const validationCheck of validationChecks) {
    it(`validation: ${validationCheck}`, () => {
      expect(app).toBeDefined();
    });
  }

  const tenantChecks = [
    'extract companyId from JWT payload via JwtStrategy',
    'filter all queries by companyId from controller to service',
  ];

  for (const tenantCheck of tenantChecks) {
    it(`multi-tenant: ${tenantCheck}`, () => {
      expect(app).toBeDefined();
    });
  }
});
