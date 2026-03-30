import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  user: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();
    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a new user and return tokens', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        role: 'VIEWER',
        tenantId: 'tenant-1',
      });

      const result = await service.register({
        email: 'test@test.com',
        password: 'password123',
        role: 'VIEWER',
        tenantId: 'tenant-1',
      });

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
      });
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ email: 'test@test.com', tenantId: 'tenant-1' }),
        }),
      );
      expect(result.access_token).toBeDefined();
      expect(result.refresh_token).toBeDefined();
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({
          email: 'test@test.com',
          password: 'password123',
          role: 'VIEWER',
          tenantId: 'tenant-1',
        }),
      ).rejects.toThrow(ConflictException);
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
      });
    });
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('password123', 10);
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        passwordHash: hash,
        role: 'VIEWER',
        tenantId: 'tenant-1',
      });

      const result = await service.login({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
      });
      expect(result.access_token).toBeDefined();
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@test.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'nobody@test.com' },
      });
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('correct', 10);
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        passwordHash: hash,
        role: 'VIEWER',
        tenantId: 'tenant-1',
      });

      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
      });
    });
  });
});
