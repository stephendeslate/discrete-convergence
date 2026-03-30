import { Test, TestingModule } from '@nestjs/testing';
import { SponsorController } from './sponsor.controller';
import { SponsorService } from './sponsor.service';

const mockService = { findAll: jest.fn(), findOne: jest.fn(), create: jest.fn(), update: jest.fn(), remove: jest.fn() };
const mockReq = { user: { userId: 'u1', email: 'a@b.com', tenantId: 't1', role: 'USER' } };

describe('SponsorController', () => {
  let controller: SponsorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SponsorController],
      providers: [{ provide: SponsorService, useValue: mockService }],
    }).compile();
    controller = module.get<SponsorController>(SponsorController);
    jest.clearAllMocks();
  });

  it('should call findAll', async () => {
    mockService.findAll.mockResolvedValue({ data: [], total: 0 });
    const result = await controller.findAll(mockReq as never, { page: 1, limit: 20 });
    expect(mockService.findAll).toHaveBeenCalledWith('t1', { page: 1, limit: 20 });
    expect(result.total).toBe(0);
  });

  it('should call create', async () => {
    mockService.create.mockResolvedValue({ id: '1' });
    const result = await controller.create(mockReq as never, { name: 'Acme', amount: 5000, contactEmail: 'a@b.com' });
    expect(mockService.create).toHaveBeenCalledWith('t1', { name: 'Acme', amount: 5000, contactEmail: 'a@b.com' });
    expect(result.id).toBe('1');
  });
});
