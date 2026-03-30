import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma.service';
import { mockPrismaService } from './helpers/mock-prisma';

describe('Performance Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).overrideProvider(PrismaService).useValue(mockPrismaService).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should include X-Response-Time header on health endpoint', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
    expect(res.headers['x-response-time']).toBeDefined();
    expect(res.headers['x-response-time']).toMatch(/ms$/);
  });

  it('should include X-Response-Time header on metrics endpoint', async () => {
    const res = await request(app.getHttpServer()).get('/health/metrics');
    expect(res.status).toBe(200);
    expect(res.headers['x-response-time']).toBeDefined();
  });
});
