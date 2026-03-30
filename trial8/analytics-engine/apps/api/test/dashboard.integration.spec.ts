import request from 'supertest';
import { useTestApp } from './helpers/create-app';

describe('Dashboard Integration', () => {
  const { getApp } = useTestApp({ validation: true });

  describe('GET /dashboards', () => {
    it('should require authentication', async () => {
      const res = await request(getApp().getHttpServer()).get('/dashboards');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('POST /dashboards', () => {
    it('should require authentication for creation', async () => {
      const res = await request(getApp().getHttpServer())
        .post('/dashboards')
        .send({ title: 'Test Dashboard' });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('DELETE /dashboards/:id', () => {
    it('should require authentication for deletion', async () => {
      const res = await request(getApp().getHttpServer())
        .delete('/dashboards/some-id');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message');
    });
  });
});
