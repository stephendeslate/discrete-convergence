import { Test } from '@nestjs/testing';
import { GeofenceController } from './geofence.controller';
import { GeofenceService } from './geofence.service';

describe('GeofenceController', () => {
  let controller: GeofenceController;
  let service: { findAll: jest.Mock; findOne: jest.Mock; create: jest.Mock; remove: jest.Mock };

  beforeEach(async () => {
    service = { findAll: jest.fn(), findOne: jest.fn(), create: jest.fn(), remove: jest.fn() };
    const module = await Test.createTestingModule({
      controllers: [GeofenceController],
      providers: [{ provide: GeofenceService, useValue: service }],
    }).compile();
    controller = module.get(GeofenceController);
  });

  it('should be defined', () => { expect(controller).toBeDefined(); });

  it('findAll passes tenantId', async () => {
    service.findAll.mockResolvedValue({ data: [], total: 0 });
    await controller.findAll({ user: { tenantId: 't1' } } as any, { page: 1, limit: 20 });
    expect(service.findAll).toHaveBeenCalledWith('t1', 1, 20);
  });
});
