import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, createMockPrisma } from './helpers/test-utils';

describe('Dashboard & DataSource Integration', () => {
  let app: INestApplication;
  const mockPrisma = createMockPrisma();

  beforeAll(async () => {
    app = await createTestApp(mockPrisma);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 401 on GET /dashboards without auth', async () => {
    const res = await request(app.getHttpServer()).get('/dashboards');
    expect(res.status).toBe(401);
  });

  it('should return 401 on GET /data-sources without auth', async () => {
    const res = await request(app.getHttpServer()).get('/data-sources');
    expect(res.status).toBe(401);
  });

  it('should return 401 on GET /dashboards with invalid token', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .set('Authorization', 'Bearer bad-token');
    expect(res.status).toBe(401);
  });

  it('should return 401 on GET /data-sources with invalid token', async () => {
    const res = await request(app.getHttpServer())
      .get('/data-sources')
      .set('Authorization', 'Bearer bad-token');
    expect(res.status).toBe(401);
  });
});
