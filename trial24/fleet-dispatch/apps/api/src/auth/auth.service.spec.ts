// TRACED:API-AUTH-SERVICE-SPEC
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../infra/prisma.module';

jest.mock('bcryptjs');

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwt = {
  signAsync: jest.fn(),
  verify: jest.fn(),
};

const mockConfig = {
  get: jest.fn((key: string) => {
    const map: Record<string, string> = {
      JWT_SECRET: 'test-secret-at-least-32-characters',
      JWT_ACCESS_EXPIRY: '15m',
      JWT_REFRESH_EXPIRY: '7d',
    };
    return map[key];
  }),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('register', () => {
    it('creates a new user with VIEWER role', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockPrisma.user.create.mockResolvedValue({
        id: 'u1',
        email: 'test@test.com',
        role: 'VIEWER',
        companyId: 'c1',
        passwordHash: 'hashed',
      });
      mockJwt.signAsync.mockResolvedValue('token');

      const result = await service.register({
        email: 'test@test.com',
        password: 'password123',
        companyId: 'c1',
      });

      expect(result.user.role).toBe('VIEWER');
      expect(result.user.email).toBe('test@test.com');
      expect(result.accessToken).toBe('token');
    });

    it('throws ConflictException for duplicate email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({
          email: 'test@test.com',
          password: 'password123',
          companyId: 'c1',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('hashes password with BCRYPT_SALT_ROUNDS', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockPrisma.user.create.mockResolvedValue({
        id: 'u1',
        email: 'test@test.com',
        role: 'VIEWER',
        companyId: 'c1',
      });
      mockJwt.signAsync.mockResolvedValue('token');

      await service.register({
        email: 'test@test.com',
        password: 'mypassword',
        companyId: 'c1',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('mypassword', 12);
    });
  });

  describe('login', () => {
    it('returns tokens for valid credentials', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'u1',
        email: 'test@test.com',
        passwordHash: 'hashed',
        role: 'ADMIN',
        companyId: 'c1',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwt.signAsync.mockResolvedValue('token');

      const result = await service.login({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result.accessToken).toBe('token');
      expect(result.user.role).toBe('ADMIN');
    });

    it('throws UnauthorizedException for invalid password', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'u1',
        email: 'test@test.com',
        passwordHash: 'hashed',
        role: 'VIEWER',
        companyId: 'c1',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for nonexistent user', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@test.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('uses findUnique when companyId is provided', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'test@test.com',
        passwordHash: 'hashed',
        role: 'ADMIN',
        companyId: 'c1',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwt.signAsync.mockResolvedValue('token');

      const result = await service.login({
        email: 'test@test.com',
        password: 'password123',
        companyId: 'c1',
      });

      expect(result.accessToken).toBe('token');
      expect(mockPrisma.user.findUnique).toHaveBeenCalled();
      expect(mockPrisma.user.findFirst).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when user not found with companyId', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'test@test.com', password: 'pass', companyId: 'c1' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('returns new tokens for valid refresh token', async () => {
      mockJwt.verify.mockReturnValue({
        sub: 'u1',
        email: 'test@test.com',
        role: 'VIEWER',
        companyId: 'c1',
      });
      mockJwt.signAsync.mockResolvedValue('new-token');

      const result = await service.refresh('valid-refresh');

      expect(result.accessToken).toBe('new-token');
    });

    it('throws UnauthorizedException for invalid refresh token', async () => {
      mockJwt.verify.mockImplementation(() => {
        throw new Error('invalid');
      });

      await expect(service.refresh('bad-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
