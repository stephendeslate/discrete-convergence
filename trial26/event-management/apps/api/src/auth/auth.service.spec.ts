// Unit tests
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../infra/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findFirst: jest.Mock; create: jest.Mock }; auditLog: { create: jest.Mock } };
  let jwtService: { sign: jest.Mock; verify: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: { findFirst: jest.fn(), create: jest.fn() },
      auditLog: { create: jest.fn() },
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('mock-token'),
      verify: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a new user and return tokens', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: '1', email: 'test@test.com', tenantId: 't1', role: 'VIEWER',
      });

      const result = await service.register({ email: 'test@test.com', password: 'password123' });
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
    });

    it('should throw ConflictException for duplicate email', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: '1' });
      await expect(service.register({ email: 'test@test.com', password: 'password123' }))
        .rejects.toThrow(ConflictException);
    });

    it('should hash the password before storing', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: '1', email: 'test@test.com', tenantId: 't1', role: 'VIEWER',
      });
      await service.register({ email: 'test@test.com', password: 'password123' });
      const createCall = prisma.user.create.mock.calls[0][0];
      expect(createCall.data.passwordHash).toBeDefined();
      expect(createCall.data.passwordHash).not.toBe('password123');
      expect(createCall.data.email).toBe('test@test.com');
    });

    it('should call jwtService.sign twice (access + refresh)', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: '1', email: 'test@test.com', tenantId: 't1', role: 'VIEWER',
      });
      await service.register({ email: 'test@test.com', password: 'password123' });
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException for non-existent user', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      await expect(service.login({ email: 'none@test.com', password: 'pass' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const hash = await bcryptjs.hash('correct-password', 10);
      prisma.user.findFirst.mockResolvedValue({
        id: '1', email: 'test@test.com', passwordHash: hash, tenantId: 't1', role: 'VIEWER',
      });
      await expect(service.login({ email: 'test@test.com', password: 'wrong-password' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens for valid credentials', async () => {
      const hash = await bcryptjs.hash('correct-password', 10);
      prisma.user.findFirst.mockResolvedValue({
        id: '1', email: 'test@test.com', passwordHash: hash, tenantId: 't1', role: 'VIEWER',
      });
      prisma.auditLog.create.mockResolvedValue({});
      const result = await service.login({ email: 'test@test.com', password: 'correct-password' });
      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ action: 'LOGIN' }) }),
      );
    });
  });

  describe('refresh', () => {
    it('should throw UnauthorizedException for invalid token', async () => {
      jwtService.verify.mockImplementation(() => { throw new Error('invalid'); });
      await expect(service.refresh('bad-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      jwtService.verify.mockReturnValue({ sub: 'missing-user', email: 'x@x.com', tenantId: 't1', role: 'VIEWER' });
      prisma.user.findFirst.mockResolvedValue(null);
      await expect(service.refresh('valid-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should return new tokens for valid refresh token', async () => {
      jwtService.verify.mockReturnValue({ sub: '1', email: 'test@test.com', tenantId: 't1', role: 'VIEWER' });
      prisma.user.findFirst.mockResolvedValue({
        id: '1', email: 'test@test.com', tenantId: 't1', role: 'VIEWER',
      });
      const result = await service.refresh('valid-refresh-token');
      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
    });
  });
});
