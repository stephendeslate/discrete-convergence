import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../infra/prisma.service';
import * as authUtils from '../common/auth-utils';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findUnique: jest.Mock; create: jest.Mock; findUniqueOrThrow: jest.Mock } };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findUniqueOrThrow: jest.fn(),
      },
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('signed-token'),
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

  it('should register a new user', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      role: 'DISPATCHER',
    });
    jest.spyOn(authUtils, 'hashPassword').mockResolvedValue('hashed');

    const result = await service.register({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'DISPATCHER',
      companyId: 'comp-1',
    });

    expect(result.email).toBe('test@example.com');
    expect(prisma.user.create).toHaveBeenCalled();
  });

  it('should throw 409 on duplicate email', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'existing' });

    await expect(
      service.register({
        email: 'dup@example.com',
        password: 'password123',
        name: 'Dup',
        role: 'DISPATCHER',
        companyId: 'comp-1',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should login with valid credentials', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      password: 'hashed',
      role: 'DISPATCHER',
      companyId: 'comp-1',
    });
    jest.spyOn(authUtils, 'comparePassword').mockResolvedValue(true);

    const result = await service.login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result.access_token).toBe('signed-token');
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: 'user-1',
      email: 'test@example.com',
      role: 'DISPATCHER',
      companyId: 'comp-1',
    });
  });

  it('should throw 401 on wrong password', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      password: 'hashed',
      role: 'DISPATCHER',
      companyId: 'comp-1',
    });
    jest.spyOn(authUtils, 'comparePassword').mockResolvedValue(false);

    await expect(
      service.login({
        email: 'test@example.com',
        password: 'wrongpassword',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw 401 when user not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'noone@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
