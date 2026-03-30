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
  sign: jest.fn(),
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
    it('should create a new user successfully', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        role: 'VIEWER',
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
          data: expect.objectContaining({
            email: 'test@test.com',
            role: 'VIEWER',
            tenantId: 'tenant-1',
          }),
        }),
      );
      expect(result.email).toBe('test@test.com');
    });

    it('should throw ConflictException when email exists', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({
          email: 'exists@test.com',
          password: 'password123',
          role: 'VIEWER',
          tenantId: 'tenant-1',
        }),
      ).rejects.toThrow(ConflictException);
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'exists@test.com' },
      });
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException for non-existent user', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ email: 'missing@test.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'missing@test.com' },
      });
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        passwordHash: '$2a$12$invalidhash',
        role: 'VIEWER',
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
    it('should return user when found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        role: 'VIEWER',
        tenantId: 'tenant-1',
      });

      const result = await service.validateUser('user-1');
      expect(result.id).toBe('user-1');
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(service.validateUser('missing')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: 'missing' },
      });
    });
  });
});
