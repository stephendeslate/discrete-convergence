import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../infra/prisma.service';

jest.mock('bcryptjs');

const mockPrismaService = {
  user: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  organization: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        organizationId: 'org-1',
        role: 'ORGANIZER',
      };

      mockPrismaService.user.findFirst.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign
        .mockReturnValueOnce('access-token-123')
        .mockReturnValueOnce('refresh-token-123');

      const result = await service.login({ email: 'test@example.com', password: 'password123' });

      expect(result).toEqual({
        access_token: 'access-token-123',
        refresh_token: 'refresh-token-123',
      });
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
      expect(mockJwtService.sign).toHaveBeenNthCalledWith(1, {
        sub: 'user-1',
        email: 'test@example.com',
        organizationId: 'org-1',
        role: 'ORGANIZER',
      });
      expect(mockJwtService.sign).toHaveBeenNthCalledWith(
        2,
        { sub: 'user-1', email: 'test@example.com', organizationId: 'org-1', role: 'ORGANIZER' },
        { expiresIn: '7d' },
      );
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        organizationId: 'org-1',
        role: 'ORGANIZER',
      };

      mockPrismaService.user.findFirst.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should create a user and return user info', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.organization.findFirst.mockResolvedValue({ id: 'org-1', name: 'Default' });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'new@example.com',
        name: 'New User',
        role: 'ATTENDEE',
      });

      const result = await service.register({
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
        role: 'ATTENDEE',
      });

      expect(result).toEqual({
        id: 'user-1',
        email: 'new@example.com',
        name: 'New User',
        role: 'ATTENDEE',
      });
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'new@example.com',
          passwordHash: 'hashed-password',
          name: 'New User',
          role: 'ATTENDEE',
          organizationId: 'org-1',
        },
      });
    });

    it('should throw ConflictException when email already exists', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue({ id: 'existing-user' });

      await expect(
        service.register({
          email: 'existing@example.com',
          password: 'password123',
          name: 'Duplicate',
          role: 'ATTENDEE',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ForbiddenException when registering with ADMIN role', async () => {
      await expect(
        service.register({
          email: 'admin@example.com',
          password: 'password123',
          name: 'Sneaky Admin',
          role: 'ADMIN',
        }),
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrismaService.user.findFirst).not.toHaveBeenCalled();
    });

    it('should create default organization when none exists', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.organization.findFirst.mockResolvedValue(null);
      mockPrismaService.organization.create.mockResolvedValue({ id: 'new-org-1', name: 'Default' });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'first@example.com',
        name: 'First User',
        role: 'ORGANIZER',
      });

      await service.register({
        email: 'first@example.com',
        password: 'password123',
        name: 'First User',
        role: 'ORGANIZER',
      });

      expect(mockPrismaService.organization.create).toHaveBeenCalledWith({
        data: { name: 'Default' },
      });
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ organizationId: 'new-org-1' }),
      });
    });
  });

  describe('refreshToken', () => {
    it('should return new tokens for a valid refresh token', async () => {
      mockJwtService.verify.mockReturnValue({
        sub: 'user-1',
        email: 'test@example.com',
        organizationId: 'org-1',
        role: 'ORGANIZER',
      });
      mockJwtService.sign
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token');

      const result = await service.refreshToken({ refresh_token: 'valid-refresh-token' });

      expect(result).toEqual({
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
      });
      expect(mockJwtService.verify).toHaveBeenCalledWith('valid-refresh-token');
    });

    it('should throw UnauthorizedException for an invalid refresh token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('invalid token');
      });

      await expect(
        service.refreshToken({ refresh_token: 'invalid-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
