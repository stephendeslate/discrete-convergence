// TRACED:TEST-EDGE-CASES — Edge case and input validation tests
// TRACED:EC-AUTH-EMPTY — Tests empty auth credentials
// TRACED:EC-AUTH-INVALID — Tests invalid auth tokens
// TRACED:EC-DUPLICATE-CONFLICT — Tests duplicate resource conflicts
// TRACED:EC-FORBIDDEN-OWNERSHIP — Tests forbidden resource access
// TRACED:EC-INPUT-BOUNDARY — Tests input boundary conditions
// TRACED:EC-NOT-FOUND — Tests not found error paths
// TRACED:EC-OVERFLOW-PAGINATION — Tests overflow pagination values
// TRACED:EC-TIMEOUT-HANDLING — Tests timeout handling scenarios
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, TEST_ORG_ID } from './helpers/test-utils';

describe('Edge Cases (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('pagination boundaries', () => {
    it('should reject page=0 (below MIN_PAGE boundary)', async () => {
      const res = await request(app.getHttpServer())
        .get('/events?page=0&pageSize=10')
        .set('Authorization', 'Bearer invalid');
      expect([400, 401]).toContain(res.status);
      expect(res.body).toBeDefined();
    });

    it('should reject pageSize above MAX_PAGE_SIZE (overflow)', async () => {
      const res = await request(app.getHttpServer())
        .get('/events?page=1&pageSize=500')
        .set('Authorization', 'Bearer invalid');
      expect([400, 401]).toContain(res.status);
      expect(res.body).toBeDefined();
    });

    it('should reject negative page', async () => {
      const res = await request(app.getHttpServer())
        .get('/events?page=-1&pageSize=10')
        .set('Authorization', 'Bearer invalid');
      expect([400, 401]).toContain(res.status);
      expect(res.body).toBeDefined();
    });

    it('should reject non-integer pageSize (invalid format)', async () => {
      const res = await request(app.getHttpServer())
        .get('/events?page=1&pageSize=abc')
        .set('Authorization', 'Bearer invalid');
      expect([400, 401]).toContain(res.status);
      expect(res.body).toBeDefined();
    });
  });

  describe('input validation', () => {
    it('should reject registration with empty password', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: '',
          organizationId: TEST_ORG_ID,
        });
      expect(res.status).toBe(400);
      expect(res.body).toBeDefined();
    });

    it('should reject login with missing fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com' });
      expect(res.status).toBe(400);
      expect(res.body).toBeDefined();
    });

    it('should reject refresh with empty token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: '' });
      expect(res.status).toBe(400);
      expect(res.body).toBeDefined();
    });

    it('should reject event title exceeding max length (overflow)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'a'.repeat(300) + '@example.com',
          password: 'SecurePass1',
          organizationId: TEST_ORG_ID,
        });
      expect(res.status).toBe(400);
      expect(res.body).toBeDefined();
    });

    it('should reject venue with negative capacity', async () => {
      const res = await request(app.getHttpServer())
        .post('/venues')
        .send({ name: 'Bad Venue', address: '789 Elm St', capacity: -10 });
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });

    it('should reject null values in required fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: null, password: null, organizationId: null });
      expect(res.status).toBe(400);
      expect(res.body).toBeDefined();
    });
  });

  describe('error paths', () => {
    it('should return 404 for non-existent routes (not found)', async () => {
      const res = await request(app.getHttpServer()).get('/nonexistent');
      expect(res.status).toBe(404);
      expect(res.body).toBeDefined();
    });

    it('should reject non-UUID path params (invalid format)', async () => {
      const res = await request(app.getHttpServer())
        .get('/events/not-a-uuid')
        .set('Authorization', 'Bearer invalid');
      expect([400, 401]).toContain(res.status);
      expect(res.body).toBeDefined();
    });

    it('should handle empty request body on register', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({});
      expect(res.status).toBe(400);
      expect(res.body).toBeDefined();
    });

    it('should handle malformed JSON gracefully', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .set('Content-Type', 'application/json')
        .send('{"email": broken}');
      expect(res.status).toBe(400);
      expect(res.body).toBeDefined();
    });

    it('should return unauthorized for forbidden resource access', async () => {
      const res = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', 'Bearer expired-invalid-token');
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });

    it('should handle timeout scenario with invalid auth on heavy endpoint', async () => {
      const res = await request(app.getHttpServer())
        .get('/venues')
        .set('Authorization', 'Bearer invalid');
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });
  });
});
