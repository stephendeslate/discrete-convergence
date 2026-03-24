// TRACED:FD-TEST-007
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

vi.mock('bcrypt', () => ({
  hash: vi.fn().mockResolvedValue('hashed-password'),
  compare: vi.fn(),
}));

const mockPrisma = {
  user: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
};

const mockJwt = {
  sign: vi.fn().mockReturnValue('jwt-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthService(mockPrisma as never, mockJwt as never);
  });

  describe('register', () => {
    it('creates user and returns token', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: '1', email: 'a@b.com', role: 'ADMIN', companyId: 'c1',
      });

      const result = await service.register(
        { name: 'Test', email: 'a@b.com', password: 'password123', role: 'ADMIN' },
        'c1',
      );

      expect(result.accessToken).toBe('jwt-token');
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });

    it('throws on duplicate email', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: '1' });

      await expect(
        service.register({ name: 'Test', email: 'a@b.com', password: 'pw', role: 'ADMIN' }, 'c1'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('returns token on valid credentials', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: '1', email: 'a@b.com', password: 'hashed', role: 'ADMIN', companyId: 'c1',
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await service.login({ email: 'a@b.com', password: 'password123' });
      expect(result.accessToken).toBe('jwt-token');
    });

    it('throws on invalid email', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ email: 'bad@b.com', password: 'pw' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws on invalid password', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: '1', email: 'a@b.com', password: 'hashed', role: 'ADMIN', companyId: 'c1',
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        service.login({ email: 'a@b.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('returns new token for valid user', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: '1', email: 'a@b.com', role: 'ADMIN', companyId: 'c1',
      });

      const result = await service.refresh('1');
      expect(result.accessToken).toBe('jwt-token');
    });
  });
});
