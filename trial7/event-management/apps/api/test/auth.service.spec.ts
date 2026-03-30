import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/infra/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@event-management/shared';

describe('AuthService', () => {
  let service: AuthService;

  const mockPrisma = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('test-token'),
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

  it('should use shared BCRYPT_SALT_ROUNDS', () => {
    expect(BCRYPT_SALT_ROUNDS).toBe(12);
  });

  describe('register', () => {
    it('should throw ConflictException when email exists', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: '1', email: 'test@test.com' });
      await expect(
        service.register({
          email: 'test@test.com',
          password: 'password123',
          name: 'Test',
          tenantId: 'tenant-1',
          role: 'USER',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should return token on successful registration', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'new@test.com',
        role: 'USER',
        tenantId: 'tenant-1',
      });
      const result = await service.register({
        email: 'new@test.com',
        password: 'password123',
        name: 'New User',
        tenantId: 'tenant-1',
        role: 'USER',
      });
      expect(result).toHaveProperty('accessToken');
      expect(mockJwtService.sign).toHaveBeenCalled();
    });
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
        id: 'user-1',
        email: 'test@test.com',
        passwordHash: '$2b$12$invalidhashvalue',
        role: 'USER',
        tenantId: 'tenant-1',
      });
      await expect(
        service.login({ email: 'test@test.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
