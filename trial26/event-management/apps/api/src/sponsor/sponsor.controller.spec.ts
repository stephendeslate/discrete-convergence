// Unit tests
import { Test } from '@nestjs/testing';
import { SponsorController } from './sponsor.controller';
import { SponsorService } from './sponsor.service';

describe('SponsorController', () => {
  let controller: SponsorController;
  let sponsorService: Record<string, jest.Mock>;

  beforeEach(async () => {
    sponsorService = {
      findAll: jest.fn().mockResolvedValue({ data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } }),
      findOne: jest.fn().mockResolvedValue({ id: '1' }),
      create: jest.fn().mockResolvedValue({ id: '1' }),
      update: jest.fn().mockResolvedValue({ id: '1' }),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    const module = await Test.createTestingModule({
      controllers: [SponsorController],
      providers: [{ provide: SponsorService, useValue: sponsorService }],
    }).compile();

    controller = module.get<SponsorController>(SponsorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call findAll', async () => {
    const req = { user: { userId: 'u1', tenantId: 't1', role: 'ADMIN', email: 'a@a.com' } } as never;
    await controller.findAll(req, {});
    expect(sponsorService['findAll']).toHaveBeenCalledWith('t1', {});
  });
});
