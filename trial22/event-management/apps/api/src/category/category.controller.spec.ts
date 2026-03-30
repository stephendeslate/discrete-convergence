import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

const mockService = { findAll: jest.fn(), findOne: jest.fn(), create: jest.fn(), update: jest.fn(), remove: jest.fn() };
const mockReq = { user: { userId: 'u1', email: 'a@b.com', tenantId: 't1', role: 'USER' } };

describe('CategoryController', () => {
  let controller: CategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [{ provide: CategoryService, useValue: mockService }],
    }).compile();
    controller = module.get<CategoryController>(CategoryController);
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
    const result = await controller.create(mockReq as never, { name: 'Tech', slug: 'tech' });
    expect(mockService.create).toHaveBeenCalledWith('t1', { name: 'Tech', slug: 'tech' });
    expect(result.id).toBe('1');
  });
});
