import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/infra/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';
import * as bcrypt from 'bcryptjs';

const mockPrisma = {
  user: {
    create: jest.fn(),
    findFirst: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

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

  describe('register', () => {
    it('should hash password and create user', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@test.com',
        role: 'USER',
        tenantId: 'tenant-1',
      };
      mockPrisma.user.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register({
        email: 'test@test.com',
        password: 'password123',
        name: 'Test',
        role: 'USER',
        tenantId: 'tenant-1',
      });

      expect(result).toEqual({ access_token: 'jwt-token' });
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'test@test.com',
          name: 'Test',
          role: 'USER',
          tenantId: 'tenant-1',
        }),
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'test@test.com',
        role: 'USER',
        tenantId: 'tenant-1',
      });
    });

    it('should use BCRYPT_SALT_ROUNDS from shared', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@test.com',
        role: 'USER',
        tenantId: 'tenant-1',
      };
      mockPrisma.user.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('jwt-token');

      await service.register({
        email: 'test@test.com',
        password: 'password123',
        name: 'Test',
        role: 'USER',
        tenantId: 'tenant-1',
      });

      const createdPassword = mockPrisma.user.create.mock.calls[0][0].data.password;
      const isValid = await bcrypt.compare('password123', createdPassword);
      expect(isValid).toBe(true);
      expect(BCRYPT_SALT_ROUNDS).toBe(12);
    });
  });

  describe('login', () => {
    it('should return token for valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        password: hashedPassword,
        role: 'USER',
        tenantId: 'tenant-1',
      });
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result).toEqual({ access_token: 'jwt-token' });
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
      });
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nouser@test.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'nouser@test.com' },
      });
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const hashedPassword = await bcrypt.hash('correctpass', BCRYPT_SALT_ROUNDS);
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        password: hashedPassword,
        role: 'USER',
        tenantId: 'tenant-1',
      });

      await expect(
        service.login({ email: 'test@test.com', password: 'wrongpass' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
      });
    });
  });

  describe('validateUser', () => {
    it('should return user data for valid userId', async () => {
      const mockUser = { id: 'user-1', email: 'test@test.com', role: 'USER', tenantId: 'tenant-1' };
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.validateUser('user-1');

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: { id: true, email: true, role: true, tenantId: true },
      });
    });

    it('should return null for non-existent userId', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      const result = await service.validateUser('bad-id');

      expect(result).toBeNull();
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: 'bad-id' },
        select: { id: true, email: true, role: true, tenantId: true },
      });
    });
  });
});
