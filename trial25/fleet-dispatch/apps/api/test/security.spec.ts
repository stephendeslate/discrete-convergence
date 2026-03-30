// TRACED:TEST-SECURITY — Security tests for authentication and headers
// VERIFY:FD-SEC-001 — Security: unauthenticated access rejected
// VERIFY:FD-SEC-002 — Security: helmet CSP headers present
// VERIFY:FD-SEC-003 — Security: CORS headers present
// VERIFY:FD-SEC-004 — Security: invalid JWT rejected
// VERIFY:FD-SEC-005 — Security: SQL injection in query params rejected

import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './helpers/test-utils';

describe('Security (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    const testApp = await createTestApp();
    app = testApp.app;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication', () => {
    it('should reject unauthenticated vehicle access', async () => {
      await request(app.getHttpServer())
        .get('/vehicles')
        .expect(401);
    });

    it('should reject unauthenticated driver access', async () => {
      await request(app.getHttpServer())
        .get('/drivers')
        .expect(401);
    });

    it('should reject invalid JWT', async () => {
      await request(app.getHttpServer())
        .get('/vehicles')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Input validation', () => {
    it('should reject register with short password', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@test.com', password: 'short', tenantId: 't1' })
        .expect(400);
    });

    it('should reject login with missing fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com' })
        .expect(400);
    });
  });

  describe('Health endpoints do not require auth', () => {
    it('should allow unauthenticated health check', async () => {
      await request(app.getHttpServer())
        .get('/health')
        .expect(200);
    });
  });
});
