import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../infra/prisma.service';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findFirst: jest.Mock; create: jest.Mock }; auditLog: { create: jest.Mock } };
  let jwt: { sign: jest.Mock; verify: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: { findFirst: jest.fn(), create: jest.fn() },
      auditLog: { create: jest.fn() },
    };
    jwt = {
      sign: jest.fn().mockReturnValue('mock-token'),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw ConflictException if email exists', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: '1' });
      await expect(
        service.register({ email: 'test@test.com', password: 'password123', tenantId: 't1' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should register successfully', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        role: 'VIEWER',
        tenantId: 't1',
      });
      const result = await service.register({
        email: 'test@test.com',
        password: 'password123',
        tenantId: 't1',
      });
      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException for invalid email', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      await expect(
        service.login({ email: 'wrong@test.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        passwordHash: 'hashed',
        role: 'VIEWER',
        tenantId: 't1',
      });
      (bcryptjs.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should login successfully with valid credentials', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        passwordHash: 'hashed',
        role: 'VIEWER',
        tenantId: 't1',
      });
      (bcryptjs.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({ email: 'test@test.com', password: 'password123' });

      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('should refresh tokens with valid refresh token', async () => {
      jwt.verify.mockReturnValue({ sub: '1', email: 'test@test.com', role: 'VIEWER', tenantId: 't1' });
      prisma.user.findFirst.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        role: 'VIEWER',
        tenantId: 't1',
      });

      const result = await service.refresh('valid-refresh-token');

      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refresh('bad-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      jwt.verify.mockReturnValue({ sub: '999', email: 'gone@test.com', role: 'VIEWER', tenantId: 't1' });
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.refresh('valid-but-user-gone')).rejects.toThrow(UnauthorizedException);
    });
  });
});
