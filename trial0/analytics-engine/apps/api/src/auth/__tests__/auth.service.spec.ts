// TRACED:AE-TEST-007 — Auth service unit tests with mocked Prisma
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';
import * as bcrypt from 'bcrypt';

const mockPrisma = {
  user: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
};

const mockJwtService = {
  sign: vi.fn().mockReturnValue('mock-jwt-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthService(
      mockPrisma as never,
      mockJwtService as unknown as JwtService,
    );
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        role: 'USER',
        tenantId: 'tenant-1',
      });

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'USER',
        tenantId: 'tenant-1',
      });

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should throw ConflictException for duplicate email', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({
          email: 'existing@example.com',
          password: 'password123',
          name: 'Test',
          role: 'USER',
          tenantId: 'tenant-1',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException for non-existent user', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ email: 'none@example.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const hash = await bcrypt.hash('correct-password', BCRYPT_SALT_ROUNDS);
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: hash,
        role: 'USER',
        tenantId: 'tenant-1',
      });

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(service.refresh('nonexistent-id')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return new token for valid user', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        role: 'USER',
        tenantId: 'tenant-1',
      });

      const result = await service.refresh('user-1');
      expect(result.accessToken).toBe('mock-jwt-token');
    });
  });
});
