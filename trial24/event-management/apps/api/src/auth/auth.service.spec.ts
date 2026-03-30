// TRACED:AUTH-SERVICE-SPEC
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../infra/prisma.module';

process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'test-refresh-secret';

jest.mock('bcryptjs');

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwt = {
  sign: jest.fn().mockReturnValue('mock-token'),
  verify: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    const orgId = '00000000-0000-0000-0000-000000000001';

    it('should register a new user with VIEWER role', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pw');
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1', email: 'test@test.com', role: 'VIEWER', organizationId: orgId,
      });

      const result = await service.register('test@test.com', 'Password1', orgId);
      expect(result.role).toBe('VIEWER');
      expect(bcrypt.hash).toHaveBeenCalledWith('Password1', 12);
    });

    it('should throw ConflictException if email exists in org', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing' });
      await expect(service.register('test@test.com', 'Password1', orgId))
        .rejects.toThrow(ConflictException);
    });

    it('should hash password with salt rounds 12', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockPrisma.user.create.mockResolvedValue({ id: 'u1', email: 'a@b.com', role: 'VIEWER', organizationId: orgId });

      await service.register('a@b.com', 'Secure123', orgId);
      expect(bcrypt.hash).toHaveBeenCalledWith('Secure123', 12);
    });
  });

  describe('login', () => {
    it('should return tokens on valid credentials', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1', email: 'test@test.com', passwordHash: 'hashed',
        role: 'ADMIN', organizationId: 'org-1',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login('test@test.com', 'Password1');
      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1', email: 'test@test.com', passwordHash: 'hashed',
        role: 'VIEWER', organizationId: 'org-1',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login('test@test.com', 'wrong'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for nonexistent user', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      await expect(service.login('no@user.com', 'pass'))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should return new access token for valid refresh token', async () => {
      mockJwt.verify.mockReturnValue({
        sub: 'user-1', email: 'test@test.com', role: 'VIEWER', organizationId: 'org-1',
      });

      const result = await service.refresh('valid-refresh-token');
      expect(result.accessToken).toBe('mock-token');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      mockJwt.verify.mockImplementation(() => { throw new Error('invalid'); });
      await expect(service.refresh('bad-token'))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return user profile without passwordHash', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1', email: 'test@test.com', role: 'VIEWER', organizationId: 'org-1',
      });

      const result = await service.getProfile('user-1');
      expect(result.email).toBe('test@test.com');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.getProfile('missing'))
        .rejects.toThrow(UnauthorizedException);
    });
  });
});
