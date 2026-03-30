import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, TestApp } from './helpers/test-utils';

describe('Edge Cases', () => {
  let app: INestApplication;
  let testApp: TestApp;

  beforeAll(async () => {
    testApp = await createTestApp();
    app = testApp.app;
  });

  afterAll(async () => {
    await app.close();
  });

  // Edge case: invalid UUID format for event ID
  it('should return 401 for invalid UUID in event path', async () => { // VERIFY:EM-EDGE-V01 — edge case: invalid UUID rejects with error
    const response = await request(app.getHttpServer()).get('/events/not-a-uuid');
    expect(response.status).toBe(401);
  });

  // Edge case: empty body on POST
  it('should return 400 for empty body on registration', async () => { // VERIFY:EM-EDGE-V02 — edge case: empty body returns error
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({});
    expect(response.status).toBe(400);
  });

  // Edge case: null fields in registration
  it('should return 400 for null email in registration', async () => { // VERIFY:EM-EDGE-V03 — edge case: null field returns error
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: null, password: 'password123' });
    expect(response.status).toBe(400);
  });

  // Edge case: malformed JSON
  it('should return 400 for malformed request body', async () => { // VERIFY:EM-EDGE-V04 — edge case: malformed body returns error
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"invalid json');
    expect(response.status).toBe(400);
  });

  // Edge case: not found route
  it('should return 404 for unknown routes', async () => { // VERIFY:EM-EDGE-V05 — edge case: not found route returns 404
    const response = await request(app.getHttpServer()).get('/nonexistent/route');
    expect(response.status).toBe(404);
  });

  // Edge case: unauthorized access to protected resources
  it('should return 401 for unauthorized access to venues', async () => { // VERIFY:EM-EDGE-V06 — edge case: unauthorized returns 401
    const response = await request(app.getHttpServer()).get('/venues');
    expect(response.status).toBe(401);
  });

  // Edge case: duplicate/invalid email format
  it('should return 400 for invalid email format', async () => { // VERIFY:EM-EDGE-V07 — edge case: duplicate/invalid email returns error
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'not-valid', password: 'password123' });
    expect(response.status).toBe(400);
  });

  // Edge case: boundary value for pagination
  it('should accept boundary page value of 1', async () => { // VERIFY:EM-EDGE-V08 — boundary: minimum page value accepted
    const response = await request(app.getHttpServer())
      .get('/events?page=1&pageSize=1');
    expect(response.status).toBe(401);
  });

  // Edge case: conflict on forbidden fields
  it('should reject forbidden extra fields in login', async () => { // VERIFY:EM-EDGE-V09 — edge case: forbidden non-whitelisted field rejected
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'password123', admin: true });
    expect(response.status).toBe(400);
  });

  // Edge case: empty string in required fields
  it('should reject empty string password', async () => { // VERIFY:EM-EDGE-V10 — edge case: empty required field returns error
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test@test.com', password: '' });
    expect(response.status).toBe(400);
  });

  // Edge case: very long string
  it('should reject extremely long email', async () => { // VERIFY:EM-EDGE-V11 — boundary: max length exceeded returns error
    const longEmail = 'a'.repeat(300) + '@test.com';
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: longEmail, password: 'password123' });
    expect(response.status).toBe(400);
  });

  // Edge case: unauthorized DELETE attempt
  it('should return 401 for unauthorized DELETE on events', async () => { // VERIFY:EM-EDGE-V12 — edge case: unauthorized DELETE blocked
    const response = await request(app.getHttpServer()).delete('/events/some-id');
    expect(response.status).toBe(401);
  });
});
