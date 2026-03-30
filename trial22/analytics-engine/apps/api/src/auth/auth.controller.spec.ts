import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  refreshToken: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();
    controller = module.get(AuthController);
    jest.clearAllMocks();
  });

  it('should call register with dto', async () => {
    const dto = { email: 'a@b.com', password: 'Test1234!', name: 'Test', role: 'USER', tenantId: 't1' };
    mockAuthService.register.mockResolvedValue({ id: '1', email: dto.email });

    const result = await controller.register(dto);

    expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    expect(result).toHaveProperty('id');
  });

  it('should call login with dto', async () => {
    const dto = { email: 'a@b.com', password: 'Test1234!' };
    mockAuthService.login.mockResolvedValue({ access_token: 'tok' });

    const result = await controller.login(dto);

    expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    expect(result).toHaveProperty('access_token');
  });

  it('should call refreshToken', async () => {
    mockAuthService.refreshToken.mockResolvedValue({ access_token: 'new-tok' });

    const result = await controller.refresh('old-token');

    expect(mockAuthService.refreshToken).toHaveBeenCalledWith('old-token');
    expect(result).toHaveProperty('access_token');
  });
});
