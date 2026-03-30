import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../src/infra/prisma.service';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('Auth Integration (Controller → Service → Prisma)', () => {
  let controller: AuthController;
  let prisma: {
    user: { findFirst: jest.Mock; create: jest.Mock };
    tenant: { create: jest.Mock };
  };
  let jwtService: { sign: jest.Mock; verify: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: { findFirst: jest.fn(), create: jest.fn() },
      tenant: { create: jest.fn() },
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('test-secret') } },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('login flow', () => {
    it('should return tokens when credentials are valid', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'alice@example.com',
        passwordHash: 'hashed-pw',
        role: 'USER',
        tenantId: 'tenant-1',
        tenant: { id: 'tenant-1' },
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await controller.login({ email: 'alice@example.com', password: 'validpass1' });

      expect(result).toHaveProperty('access_token', 'mock-jwt-token');
      expect(result).toHaveProperty('refresh_token', 'mock-jwt-token');
      expect(prisma.user.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { email: 'alice@example.com' } }),
      );
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: 'user-1', email: 'alice@example.com', role: 'USER', tenantId: 'tenant-1' }),
        expect.objectContaining({ expiresIn: '1h' }),
      );
    });

    it('should throw UnauthorizedException for nonexistent user', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        controller.login({ email: 'nobody@example.com', password: 'anything' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'alice@example.com',
        passwordHash: 'hashed-pw',
        role: 'USER',
        tenantId: 'tenant-1',
        tenant: { id: 'tenant-1' },
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        controller.login({ email: 'alice@example.com', password: 'wrongpass' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register flow', () => {
    const registerDto = {
      email: 'newuser@example.com',
      password: 'securepass1',
      name: 'New User',
      tenantName: 'Acme Corp',
      role: 'USER',
    };

    it('should create tenant and user, then return tokens', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      prisma.tenant.create.mockResolvedValue({ id: 'tenant-new' });
      prisma.user.create.mockResolvedValue({
        id: 'user-new',
        email: 'newuser@example.com',
        role: 'USER',
        tenantId: 'tenant-new',
      });

      const result = await controller.register(registerDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(prisma.tenant.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: { name: 'Acme Corp' } }),
      );
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'newuser@example.com',
            passwordHash: 'hashed-password',
            role: 'USER',
            tenantId: 'tenant-new',
          }),
        }),
      );
    });

    it('should throw ConflictException for duplicate email', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'existing-user' });

      await expect(controller.register(registerDto)).rejects.toThrow(ConflictException);
      expect(prisma.tenant.create).not.toHaveBeenCalled();
    });

    it('should hash the password with bcryptjs and BCRYPT_SALT_ROUNDS', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      prisma.tenant.create.mockResolvedValue({ id: 't1' });
      prisma.user.create.mockResolvedValue({ id: 'u1', email: 'a@b.com', role: 'USER', tenantId: 't1' });

      await controller.register(registerDto);
      expect(bcrypt.hash).toHaveBeenCalledWith('securepass1', 12);
    });
  });

  describe('refresh flow', () => {
    it('should return new tokens when refresh token is valid', async () => {
      jwtService.verify.mockReturnValue({
        sub: 'user-1',
        email: 'alice@example.com',
        role: 'USER',
        tenantId: 'tenant-1',
      });

      const result = await controller.refresh({ refreshToken: 'valid-refresh-token' });

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(jwtService.verify).toHaveBeenCalledWith('valid-refresh-token', expect.objectContaining({ secret: 'test-secret' }));
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('invalid token');
      });

      await expect(
        controller.refresh({ refreshToken: 'expired-or-invalid' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should generate access token with 1h expiry', async () => {
      jwtService.verify.mockReturnValue({
        sub: 'user-1',
        email: 'a@b.com',
        role: 'USER',
        tenantId: 't1',
      });

      await controller.refresh({ refreshToken: 'valid' });

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: 'user-1' }),
        expect.objectContaining({ expiresIn: '1h' }),
      );
    });
  });
});
