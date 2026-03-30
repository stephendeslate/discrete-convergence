import request from 'supertest';
import { createTestApp, getMockPrisma } from './helpers/test-setup';
import { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// TRACED: EM-TEST-005 — Security tests (VERIFY: EM-SEC-001 through EM-SEC-006)

describe('Security', () => {
  let app: INestApplication;
  const tenantId = '00000000-0000-0000-0000-000000000099';
  let mockPrisma: ReturnType<typeof getMockPrisma>;

  beforeAll(async () => {
    app = await createTestApp();
    mockPrisma = getMockPrisma();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // VERIFY: EM-SEC-001 — Protected endpoints require authentication
  it('should return 401 for unauthenticated request to events', async () => {
    const res = await request(app.getHttpServer()).get('/events');
    expect(res.status).toBe(401);
  });

  // VERIFY: EM-SEC-001 — Protected endpoints require authentication
  it('should return 401 for unauthenticated request to tickets', async () => {
    const res = await request(app.getHttpServer()).get('/tickets');
    expect(res.status).toBe(401);
  });

  // VERIFY: EM-SEC-002 — Invalid token format returns 401
  it('should return 401 for invalid token format', async () => {
    const res = await request(app.getHttpServer())
      .get('/events')
      .set('Authorization', 'Bearer invalid-token-format');

    expect(res.status).toBe(401);
  });

  // VERIFY: EM-SEC-005 — Expired token is rejected
  it('should return 401 for expired/forged token', async () => {
    // Use a properly formatted but invalid JWT
    const fakeToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwicm9sZSI6IkFETUlOIiwidGVuYW50SWQiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDEiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTUxNjIzOTAyMn0.invalid';

    const res = await request(app.getHttpServer())
      .get('/events')
      .set('Authorization', `Bearer ${fakeToken}`);

    expect(res.status).toBe(401);
  });

  // VERIFY: EM-API-010 — Health endpoint is public
  it('should allow unauthenticated access to health', async () => {
    const res = await request(app.getHttpServer()).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('version');
    expect(res.body).toHaveProperty('timestamp');
  });

  // VERIFY: EM-SEC-003 — Role guard blocks insufficient role on POST /events
  it('should return 403 when user role is insufficient for event creation', async () => {
    const email = 'sec-user@test.com';
    const userId = 'sec-user-id';
    const passwordHash = await bcrypt.hash('TestPassword123!', 10);

    // Mock register
    mockPrisma.user.findFirst.mockImplementation(({ where }: any) => {
      if (where?.email === email) {
        // For register check: no existing user, then for login: return user
        return Promise.resolve({ id: userId, email, passwordHash, role: 'USER', tenantId });
      }
      if (where?.id === userId) {
        return Promise.resolve({ id: userId, email, role: 'USER', tenantId });
      }
      return Promise.resolve(null);
    });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'TestPassword123!' });

    const token = loginRes.body.access_token;

    const res = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Blocked Event',
        startDate: '2025-12-01T09:00:00Z',
        endDate: '2025-12-01T17:00:00Z',
      });

    expect(res.status).toBe(403);
  });

  // VERIFY: EM-SEC-006 — Validation pipeline rejects extra fields
  it('should reject request with non-whitelisted fields', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'extra@test.com',
        password: 'TestPassword123!',
        name: 'Extra Fields User',
        role: 'USER',
        tenantId,
        isAdmin: true,
        hackField: 'malicious',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  // VERIFY: EM-MON-005 — Correlation ID is returned in response headers
  it('should return correlation-id in response headers', async () => {
    const res = await request(app.getHttpServer()).get('/health');

    expect(res.status).toBe(200);
    expect(res.headers['x-correlation-id']).toBeDefined();
    expect(typeof res.headers['x-correlation-id']).toBe('string');
  });

  // VERIFY: EM-MON-005 — Custom correlation ID is echoed back
  it('should echo custom correlation-id', async () => {
    const customId = 'custom-corr-12345';
    const res = await request(app.getHttpServer())
      .get('/health')
      .set('x-correlation-id', customId);

    expect(res.status).toBe(200);
    expect(res.headers['x-correlation-id']).toBe(customId);
  });
});
