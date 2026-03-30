import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/infra/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@event-management/shared';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findFirst: jest.Mock; create: jest.Mock } };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };
    jwtService = { sign: jest.fn() };

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
    expect(BCRYPT_SALT_ROUNDS).toBe(12);
  });

  it('should throw ConflictException if email exists on register', async () => {
    prisma.user.findFirst.mockResolvedValue({ id: '1', email: 'test@test.com' });
    await expect(
      service.register({
        email: 'test@test.com',
        password: 'pass',
        name: 'Test',
        tenantId: 't1',
        role: 'VIEWER',
      }),
    ).rejects.toThrow(ConflictException);
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { email: 'test@test.com' },
    });
  });

  it('should create user on successful registration', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: '1',
      email: 'new@test.com',
      name: 'New User',
      role: 'VIEWER',
    });

    const result = await service.register({
      email: 'new@test.com',
      password: 'pass123',
      name: 'New User',
      tenantId: 't1',
      role: 'VIEWER',
    });
    expect(result.email).toBe('new@test.com');
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'new@test.com',
          name: 'New User',
          role: 'VIEWER',
          tenantId: 't1',
        }),
      }),
    );
  });

  it('should throw UnauthorizedException if user not found on login', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    await expect(
      service.login({ email: 'no@test.com', password: 'pass' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { email: 'no@test.com' },
    });
  });

  it('should throw UnauthorizedException for wrong password', async () => {
    const bcrypt = await import('bcryptjs');
    const hash = await bcrypt.hash('correct', 12);
    prisma.user.findFirst.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
      passwordHash: hash,
      role: 'VIEWER',
      tenantId: 't1',
    });
    await expect(
      service.login({ email: 'test@test.com', password: 'wrong' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(prisma.user.findFirst).toHaveBeenCalled();
  });

  it('should return access_token on successful login', async () => {
    const bcrypt = await import('bcryptjs');
    const hash = await bcrypt.hash('correct', 12);
    prisma.user.findFirst.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
      passwordHash: hash,
      role: 'VIEWER',
      tenantId: 't1',
    });
    jwtService.sign.mockReturnValue('mock-jwt-token');

    const result = await service.login({
      email: 'test@test.com',
      password: 'correct',
    });
    expect(result.access_token).toBe('mock-jwt-token');
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: '1',
      email: 'test@test.com',
      role: 'VIEWER',
      tenantId: 't1',
    });
  });
});
