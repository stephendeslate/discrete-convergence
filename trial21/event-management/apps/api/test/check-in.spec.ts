import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CheckInController } from '../src/check-in/check-in.controller';
import { CheckInService } from '../src/check-in/check-in.service';
import { Reflector } from '@nestjs/core';

const mockUser = { id: 'u1', email: 'a@b.com', role: 'ADMIN', organizationId: 'org1' };

const mockCheckInService = {
  checkIn: jest.fn(),
  getStats: jest.fn(),
};

describe('CheckInController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [CheckInController],
      providers: [
        { provide: CheckInService, useValue: mockCheckInService },
        Reflector,
      ],
    }).compile();
    app = module.createNestApplication();
    app.use((req: Record<string, unknown>, _res: unknown, next: () => void) => {
      req['user'] = mockUser;
      next();
    });
    await app.init();
  });

  afterAll(async () => { await app.close(); });
  beforeEach(() => jest.clearAllMocks());

  it('POST /check-in/:registrationId should check in', async () => {
    mockCheckInService.checkIn.mockResolvedValue({ status: 'checked_in', checkedInAt: new Date() });
    const res = await request(app.getHttpServer()).post('/check-in/r1').expect(201);
    expect(res.body.status).toBe('checked_in');
  });

  it('POST /check-in/:registrationId should handle idempotent scan', async () => {
    mockCheckInService.checkIn.mockResolvedValue({ status: 'already_checked_in', checkedInAt: new Date() });
    const res = await request(app.getHttpServer()).post('/check-in/r1').expect(201);
    expect(res.body.status).toBe('already_checked_in');
  });

  it('GET /check-in/stats should return stats', async () => {
    mockCheckInService.getStats.mockResolvedValue({ total: 100, checkedIn: 60, pending: 40 });
    const res = await request(app.getHttpServer()).get('/check-in/stats?eventId=e1').expect(200);
    expect(res.body.total).toBe(100);
    expect(res.body.checkedIn).toBe(60);
  });
});
