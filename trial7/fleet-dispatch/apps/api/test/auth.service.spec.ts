import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/infra/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@fleet-dispatch/shared';

describe('AuthService', () => {
  let service: AuthService;
  const mockPrisma = {
    user: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  };
  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mock-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should use shared BCRYPT_SALT_ROUNDS constant', () => {
    expect(BCRYPT_SALT_ROUNDS).toBe(12);
  });

  describe('login', () => {
    it('should throw UnauthorizedException for non-existent user', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      await expect(
        service.login({ email: 'none@test.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'u1',
        email: 'test@test.com',
        passwordHash: '$2b$12$invalidhashvalue',
        role: 'VIEWER',
        tenantId: 'tenant-1',
      });
      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should create user and return token', async () => {
      mockPrisma.user.create.mockResolvedValue({
        id: 'u1',
        email: 'new@test.com',
        role: 'DISPATCHER',
        tenantId: 'tenant-1',
      });

      const result = await service.register({
        email: 'new@test.com',
        password: 'TestPass123!',
        name: 'New User',
        tenantId: 'tenant-1',
        role: 'DISPATCHER',
      });

      expect(result).toHaveProperty('accessToken');
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });
  });
});
