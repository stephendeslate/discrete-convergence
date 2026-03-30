import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../infra/prisma.service';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '@repo/shared';

jest.mock('bcryptjs');

const mockPrisma = {
  user: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findFirst: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-token'),
  verify: jest.fn(),
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
    const dto = { email: 'test@example.com', password: 'Pass123!', name: 'Test', role: 'USER', tenantId: 't1' };

    it('should hash password and create user', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockPrisma.user.create.mockResolvedValue({ id: '1', email: dto.email, name: dto.name, role: 'USER' });

      const result = await service.register(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith('Pass123!', BCRYPT_SALT_ROUNDS);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ email: 'test@example.com', password: 'hashed', tenantId: 't1' }),
      });
      expect(result.id).toBe('1');
      expect(result.email).toBe('test@example.com');
    });

    it('should throw ConflictException on duplicate email', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({ where: { email: dto.email } });
    });
  });

  describe('login', () => {
    const dto = { email: 'test@example.com', password: 'Pass123!' };

    it('should return access and refresh tokens on valid credentials', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: '1', email: dto.email, password: 'hashed', tenantId: 't1', role: 'USER',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.login(dto);

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(bcrypt.compare).toHaveBeenCalledWith('Pass123!', 'hashed');
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({ where: { email: dto.email } });
    });

    it('should throw UnauthorizedException on invalid password', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: '1', email: dto.email, password: 'hashed' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(bcrypt.compare).toHaveBeenCalledWith('Pass123!', 'hashed');
    });
  });

  describe('refreshToken', () => {
    it('should return new access token on valid refresh token', async () => {
      mockJwtService.verify.mockReturnValue({ sub: '1', email: 'a@b.com', tenantId: 't1', role: 'USER' });
      mockPrisma.refreshToken.findFirst.mockResolvedValue({
        token: 'valid', userId: '1', expiresAt: new Date(Date.now() + 86400000),
      });

      const result = await service.refreshToken('valid');

      expect(mockJwtService.verify).toHaveBeenCalled();
      expect(result).toHaveProperty('access_token');
    });

    it('should throw UnauthorizedException on expired refresh token', async () => {
      mockJwtService.verify.mockReturnValue({ sub: '1', email: 'a@b.com', tenantId: 't1', role: 'USER' });
      mockPrisma.refreshToken.findFirst.mockResolvedValue({
        token: 'expired', userId: '1', expiresAt: new Date(Date.now() - 86400000),
      });

      await expect(service.refreshToken('expired')).rejects.toThrow(UnauthorizedException);
      expect(mockPrisma.refreshToken.findFirst).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when token not found', async () => {
      mockJwtService.verify.mockReturnValue({ sub: '1', email: 'a@b.com', tenantId: 't1', role: 'USER' });
      mockPrisma.refreshToken.findFirst.mockResolvedValue(null);

      await expect(service.refreshToken('missing')).rejects.toThrow(UnauthorizedException);
      expect(mockJwtService.verify).toHaveBeenCalled();
    });
  });
});
