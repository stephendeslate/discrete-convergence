import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/common/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@fleet-dispatch/shared';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findUnique: jest.Mock; create: jest.Mock }; company: { findUnique: jest.Mock; create: jest.Mock } };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn(), create: jest.fn() },
      company: { findUnique: jest.fn(), create: jest.fn() },
    };
    jwtService = { sign: jest.fn().mockReturnValue('jwt-token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should use BCRYPT_SALT_ROUNDS from shared', () => {
    expect(BCRYPT_SALT_ROUNDS).toBe(12);
  });

  it('should throw ConflictException if email exists on register', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com' });
    await expect(
      service.register({ email: 'test@test.com', password: 'pass', role: 'DISPATCHER' }),
    ).rejects.toThrow(ConflictException);
  });

  it('should throw UnauthorizedException on login with wrong password', async () => {
    const hash = await bcrypt.hash('correct', BCRYPT_SALT_ROUNDS);
    prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com', passwordHash: hash, role: 'DISPATCHER', companyId: 'c1' });
    await expect(
      service.login({ email: 'test@test.com', password: 'wrong' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for non-existent user on login', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(
      service.login({ email: 'ghost@test.com', password: 'pass' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
