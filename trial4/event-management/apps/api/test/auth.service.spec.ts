// TRACED:EM-TEST-003 — auth service unit test with mocked Prisma
import { AuthService } from '../src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../src/common/prisma.service';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { BCRYPT_SALT_ROUNDS } from '@event-management/shared';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findFirst: jest.Mock; create: jest.Mock } };
  let jwtService: { sign: jest.Mock; verify: jest.Mock };

  beforeEach(() => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('test-token'),
      verify: jest.fn(),
    };
    service = new AuthService(
      prisma as unknown as PrismaService,
      jwtService as unknown as JwtService,
    );
  });

  describe('login', () => {
    it('should throw UnauthorizedException for non-existent user', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      await expect(
        service.login({ email: 'nobody@test.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const hash = await bcrypt.hash('correct', BCRYPT_SALT_ROUNDS);
      prisma.user.findFirst.mockResolvedValue({
        id: '1',
        email: 'user@test.com',
        passwordHash: hash,
        role: 'ATTENDEE',
        organizationId: 'org1',
      });
      await expect(
        service.login({ email: 'user@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens for valid credentials', async () => {
      const hash = await bcrypt.hash('correct', BCRYPT_SALT_ROUNDS);
      prisma.user.findFirst.mockResolvedValue({
        id: '1',
        email: 'user@test.com',
        passwordHash: hash,
        role: 'ATTENDEE',
        organizationId: 'org1',
      });
      const result = await service.login({ email: 'user@test.com', password: 'correct' });
      expect(result.accessToken).toBe('test-token');
      expect(result.refreshToken).toBe('test-token');
    });
  });

  describe('register', () => {
    it('should reject ADMIN role', async () => {
      await expect(
        service.register({
          email: 'admin@test.com',
          password: 'pass',
          firstName: 'A',
          lastName: 'B',
          role: 'ADMIN',
          organizationId: 'org1',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should reject duplicate email in same org', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: '1' });
      await expect(
        service.register({
          email: 'dup@test.com',
          password: 'pass',
          firstName: 'A',
          lastName: 'B',
          role: 'ATTENDEE',
          organizationId: 'org1',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
