import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: { register: jest.Mock; login: jest.Mock };

  beforeEach(async () => {
    service = { register: jest.fn(), login: jest.fn() };
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: service }],
    }).compile();
    controller = module.get(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate register to service', async () => {
    service.register.mockResolvedValue({ id: '1' });
    const dto = { email: 'a@b.com', password: 'password1', name: 'A', role: 'USER', tenantId: 't1' };
    const result = await controller.register(dto);
    expect(service.register).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: '1' });
  });

  it('should delegate login to service', async () => {
    service.login.mockResolvedValue({ access_token: 'tok' });
    const dto = { email: 'a@b.com', password: 'password1' };
    const result = await controller.login(dto);
    expect(service.login).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ access_token: 'tok' });
  });
});
