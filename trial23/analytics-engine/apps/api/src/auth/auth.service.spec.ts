import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../infra/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@repo/shared';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findFirst: jest.Mock; create: jest.Mock } };
  let jwtService: { sign: jest.Mock; verify: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };

    jwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should create user with hashed password', async () => {
      const dto = { email: 'test@example.com', password: 'password123', name: 'Test User', role: 'user' };
      const hashedPassword = '$2a$12$hashedpassword';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: dto.email,
        name: dto.name,
        role: dto.role,
      });

      const result = await service.register(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, BCRYPT_SALT_ROUNDS);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: dto.email,
          passwordHash: hashedPassword,
          name: dto.name,
          role: dto.role,
        },
      });
      expect(result).toEqual({ id: 'user-1', email: dto.email, name: dto.name, role: dto.role });
    });

    it('should throw ConflictException on duplicate email', async () => {
      const dto = { email: 'existing@example.com', password: 'password123', name: 'Test', role: 'user' };
      prisma.user.findFirst.mockResolvedValue({ id: 'existing-user', email: dto.email });

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({ where: { email: dto.email } });
    });

    it('should throw ForbiddenException for disallowed role', async () => {
      const dto = { email: 'test@example.com', password: 'password123', name: 'Test', role: 'admin' };

      await expect(service.register(dto)).rejects.toThrow(ForbiddenException);
      expect(prisma.user.findFirst).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const dto = { email: 'test@example.com', password: 'password123' };
      const user = {
        id: 'user-1',
        email: dto.email,
        passwordHash: '$2a$12$hashedpassword',
        tenantId: 'tenant-1',
        role: 'user',
      };
      prisma.user.findFirst.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');

      const result = await service.login(dto);

      expect(bcrypt.compare).toHaveBeenCalledWith(dto.password, user.passwordHash);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        tenantId: user.tenantId,
        role: user.role,
      });
      expect(result).toEqual({ access_token: 'access-token', refresh_token: 'refresh-token' });
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const dto = { email: 'test@example.com', password: 'wrongpassword' };
      const user = {
        id: 'user-1',
        email: dto.email,
        passwordHash: '$2a$12$hashedpassword',
        tenantId: 'tenant-1',
        role: 'user',
      };
      prisma.user.findFirst.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(bcrypt.compare).toHaveBeenCalledWith(dto.password, user.passwordHash);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      const dto = { email: 'nobody@example.com', password: 'password123' };
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({ where: { email: dto.email } });
    });
  });

  describe('refreshToken', () => {
    it('should return new token pair for valid refresh token', async () => {
      const dto = { refresh_token: 'valid-refresh-token' };
      const payload = { sub: 'user-1', email: 'test@example.com', tenantId: 'tenant-1', role: 'user' };
      jwtService.verify.mockReturnValue(payload);
      jwtService.sign.mockReturnValueOnce('new-access-token').mockReturnValueOnce('new-refresh-token');

      const result = await service.refreshToken(dto);

      expect(jwtService.verify).toHaveBeenCalledWith(dto.refresh_token);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: payload.sub,
        email: payload.email,
        tenantId: payload.tenantId,
        role: payload.role,
      });
      expect(result).toEqual({ access_token: 'new-access-token', refresh_token: 'new-refresh-token' });
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const dto = { refresh_token: 'invalid-token' };
      jwtService.verify.mockImplementation(() => {
        throw new Error('invalid token');
      });

      await expect(service.refreshToken(dto)).rejects.toThrow(UnauthorizedException);
      expect(jwtService.verify).toHaveBeenCalledWith(dto.refresh_token);
    });
  });
});
