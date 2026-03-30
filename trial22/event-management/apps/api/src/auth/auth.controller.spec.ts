import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  getProfile: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('should call register with dto', async () => {
    const dto = { email: 'a@b.com', password: 'Test1234!', name: 'Test' };
    mockAuthService.register.mockResolvedValue({ id: '1', email: dto.email });

    const result = await controller.register(dto);

    expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    expect(result).toHaveProperty('id');
    expect(result.email).toBe('a@b.com');
  });

  it('should call login with dto', async () => {
    const dto = { email: 'a@b.com', password: 'Test1234!' };
    mockAuthService.login.mockResolvedValue({ access_token: 'tok' });

    const result = await controller.login(dto);

    expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    expect(result.access_token).toBe('tok');
  });

  it('should call getProfile with userId from request', async () => {
    const req = { user: { userId: 'u1', email: 'a@b.com', tenantId: 't1', role: 'USER' } };
    mockAuthService.getProfile.mockResolvedValue({ id: 'u1', name: 'Test' });

    const result = await controller.getProfile(req as never);

    expect(mockAuthService.getProfile).toHaveBeenCalledWith('u1');
    expect(result.id).toBe('u1');
  });
});
