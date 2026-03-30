import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../infra/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findFirst: jest.Mock; create: jest.Mock } };
  let jwt: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = { user: { findFirst: jest.fn(), create: jest.fn() } };
    jwt = { sign: jest.fn().mockReturnValue('token-abc') };
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should hash password and create user', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({ id: '1', email: 'a@b.com', name: 'A', role: 'USER', tenantId: 't1' });

      const result = await service.register({ email: 'a@b.com', password: 'password1', name: 'A', role: 'USER', tenantId: 't1' });

      expect(bcrypt.hash).toHaveBeenCalledWith('password1', expect.any(Number));
      expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ email: 'a@b.com', tenantId: 't1' }),
      }));
      expect(result).toHaveProperty('id');
    });

    it('should throw ConflictException if email exists', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: '1' });

      await expect(service.register({ email: 'a@b.com', password: 'password1', name: 'A', role: 'USER', tenantId: 't1' }))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return access_token on valid credentials', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: '1', email: 'a@b.com', password: 'hashed', role: 'USER', tenantId: 't1' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({ email: 'a@b.com', password: 'password1' });

      expect(jwt.sign).toHaveBeenCalledWith(expect.objectContaining({ sub: '1', email: 'a@b.com' }));
      expect(result).toHaveProperty('access_token');
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.login({ email: 'a@b.com', password: 'password1' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });
});
