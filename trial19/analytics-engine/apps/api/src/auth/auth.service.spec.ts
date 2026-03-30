import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
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
    it('should create a user and return tokens', async () => {
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
        tenantId: 'tenant-1',
        role: 'USER',
      });

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ email: 'test@example.com', tenantId: 'tenant-1' }),
        }),
      );
      expect(result.access_token).toBeDefined();
      expect(result.refresh_token).toBeDefined();
    });

    it('should throw ConflictException for duplicate email', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(service.register({
        email: 'taken@example.com',
        password: 'password123',
        name: 'Test User',
        tenantId: 'tenant-1',
        role: 'USER',
      })).rejects.toThrow(ConflictException);

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'taken@example.com' },
      });
    });
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('password123', 10);
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: hash,
        role: 'USER',
        tenantId: 'tenant-1',
      });

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result.access_token).toBeDefined();
    });

    it('should throw UnauthorizedException for unknown email', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(service.login({
        email: 'unknown@example.com',
        password: 'password123',
      })).rejects.toThrow(UnauthorizedException);

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'unknown@example.com' },
      });
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('correct-password', 10);
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: hash,
        role: 'USER',
        tenantId: 'tenant-1',
      });

      await expect(service.login({
        email: 'test@example.com',
        password: 'wrong-password',
      })).rejects.toThrow(UnauthorizedException);

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });
  });
});
