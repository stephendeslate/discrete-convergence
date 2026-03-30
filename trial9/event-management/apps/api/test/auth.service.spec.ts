import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@event-management/shared';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findFirst: jest.Mock;
      create: jest.Mock;
    };
    $executeRaw: jest.Mock;
  };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      $executeRaw: jest.fn(),
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

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'USER',
      tenantId: 'tenant-1',
    };

    it('should register a new user successfully', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: registerDto.email,
        role: 'USER',
      });

      const result = await service.register(registerDto);

      expect(result.email).toBe(registerDto.email);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email exists', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
    });

    it('should throw ForbiddenException for ADMIN registration', async () => {
      const adminDto = { ...registerDto, role: 'ADMIN' };

      await expect(service.register(adminDto)).rejects.toThrow(ForbiddenException);
      expect(prisma.user.findFirst).not.toHaveBeenCalled();
    });

    it('should hash password with correct salt rounds', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: registerDto.email,
        role: 'USER',
      });

      await service.register(registerDto);

      // Verify the create call received a hashed password (not plaintext)
      const createCall = prisma.user.create.mock.calls[0][0];
      expect(createCall.data.passwordHash).not.toBe(registerDto.password);
      // bcrypt hashes start with $2a$ or $2b$ and encode the salt rounds
      expect(createCall.data.passwordHash).toMatch(/^\$2[ab]\$/);
      // Verify BCRYPT_SALT_ROUNDS is the expected value (12)
      expect(BCRYPT_SALT_ROUNDS).toBe(12);
    });
  });

  describe('login', () => {
    const loginDto = { email: 'test@example.com', password: 'password123' };

    it('should login successfully with valid credentials', async () => {
      const hash = await bcrypt.hash('password123', 10);
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: loginDto.email,
        passwordHash: hash,
        role: 'USER',
        tenantId: 'tenant-1',
      });
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(loginDto);

      expect(result.access_token).toBe('jwt-token');
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        email: loginDto.email,
        role: 'USER',
        tenantId: 'tenant-1',
      });
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: loginDto.email,
        passwordHash: await bcrypt.hash('differentpassword', 10),
        role: 'USER',
        tenantId: 'tenant-1',
      });

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(prisma.user.findFirst).toHaveBeenCalled();
    });
  });

  describe('getTenantUserCount', () => {
    it('should execute raw SQL for tenant user count', async () => {
      prisma.$executeRaw.mockResolvedValue(5);
      const result = await service.getTenantUserCount('tenant-1');
      expect(result).toBe(5);
      expect(prisma.$executeRaw).toHaveBeenCalled();
    });
  });
});
