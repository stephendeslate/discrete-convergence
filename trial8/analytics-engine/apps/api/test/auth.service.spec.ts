import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/common/prisma.service';
import { createMockPrismaModel } from './helpers/mock-prisma';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: Record<string, any>;
  let jwtService: { sign: jest.Mock; verify: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: createMockPrismaModel(),
      $executeRaw: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('mock-token'),
      verify: jest.fn().mockReturnValue({ sub: 'u1', email: 'a@b.com', role: 'USER', tenantId: 't1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should create a user with hashed password and return safe fields', async () => {
      prisma.user.create.mockResolvedValue({
        id: 'u1',
        email: 'test@example.com',
        role: 'USER',
        tenantId: 't1',
        passwordHash: 'hashed',
      });

      const result = await service.register({
        email: 'test@example.com',
        password: 'StrongPass1!',
        role: 'USER',
        tenantId: 't1',
      });

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ email: 'test@example.com', tenantId: 't1' }),
        }),
      );
      expect(result).toHaveProperty('id', 'u1');
      expect(result).not.toHaveProperty('passwordHash');
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException for unknown email', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.login('unknown@example.com', 'wrong')).rejects.toThrow(UnauthorizedException);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 'u1',
        email: 'test@example.com',
        passwordHash: '$2b$12$invalidhashvaluexxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        role: 'USER',
        tenantId: 't1',
      });

      await expect(service.login('test@example.com', 'wrongpassword')).rejects.toThrow(UnauthorizedException);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('should return new tokens from valid refresh token', async () => {
      const result = await service.refresh('valid-refresh-token');

      expect(jwtService.verify).toHaveBeenCalledWith('valid-refresh-token');
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
    });

    it('should throw when refresh token is invalid', async () => {
      jwtService.verify.mockImplementation(() => { throw new Error('invalid'); });

      await expect(service.refresh('bad-token')).rejects.toThrow();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });
});
