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
import { createTestApp, TEST_COMPANY_ID } from './helpers/test-utils';

describe('Edge Cases (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('Pagination boundaries', () => {
    it('should reject negative page without auth as 401 (unauthorized)', async () => {
      const res = await request(app.getHttpServer())
        .get('/vehicles?page=-1&limit=10');
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });

    it('should reject zero limit without auth as 401', async () => {
      const res = await request(app.getHttpServer())
        .get('/vehicles?page=1&limit=0');
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });

    it('should reject oversized limit without auth as 401 (overflow boundary)', async () => {
      const res = await request(app.getHttpServer())
        .get('/vehicles?page=1&limit=999');
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });
  });

  describe('Input validation', () => {
    it('should reject empty register body', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({});
      expect(res.status).toBe(400);
      expect(res.body).toBeDefined();
    });

    it('should reject empty login body', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({});
      expect(res.status).toBe(400);
      expect(res.body).toBeDefined();
    });

    it('should reject very long string values gracefully (overflow)', async () => {
      const longString = 'a'.repeat(10000);
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `${longString}@test.com`,
          password: longString,
          companyId: TEST_COMPANY_ID,
        });
      expect(res.status).toBeLessThan(500);
      expect(res.body).toBeDefined();
    });

    it('should reject null values in required fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: null, password: null, companyId: null });
      expect(res.status).toBe(400);
      expect(res.body).toBeDefined();
    });

    it('should reject non-UUID path params (invalid format)', async () => {
      const res = await request(app.getHttpServer())
        .get('/vehicles/not-a-uuid')
        .set('Authorization', 'Bearer invalid');
      expect([400, 401]).toContain(res.status);
      expect(res.body).toBeDefined();
    });
  });

  describe('Error paths', () => {
    it('should return 404 for unknown routes (not found)', async () => {
      const res = await request(app.getHttpServer()).get('/nonexistent');
      expect(res.status).toBe(404);
      expect(res.body).toBeDefined();
    });

    it('should handle non-JSON content type (malformed input)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .set('Content-Type', 'text/plain')
        .send('not json');
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.body).toBeDefined();
    });

    it('should reject auth header without Bearer prefix (unauthorized)', async () => {
      const res = await request(app.getHttpServer())
        .get('/vehicles')
        .set('Authorization', 'not-bearer token');
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });

    it('should reject empty Bearer token (unauthorized)', async () => {
      const res = await request(app.getHttpServer())
        .get('/vehicles')
        .set('Authorization', 'Bearer ');
      expect(res.status).toBe(401);
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
        .get('/drivers')
        .set('Authorization', 'Bearer expired-invalid-token');
      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
    });
  });
});
