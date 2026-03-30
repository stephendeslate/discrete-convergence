import * as request from 'supertest';
import { useTestApp } from './helpers/create-app';

describe('Dashboard Integration', () => {
  const { getApp } = useTestApp({ validation: true });

  describe('GET /dashboards', () => {
    it('should require authentication', async () => {
      await request(getApp().getHttpServer())
        .get('/dashboards')
        .expect(401);
    });
  });

  describe('POST /dashboards', () => {
    it('should require authentication', async () => {
      await request(getApp().getHttpServer())
        .post('/dashboards')
        .send({ title: 'Test Dashboard' })
        .expect(401);
    });

    it('should reject invalid body', async () => {
      await request(getApp().getHttpServer())
        .post('/dashboards')
        .send({})
        .expect(401);
    });
  });
});
