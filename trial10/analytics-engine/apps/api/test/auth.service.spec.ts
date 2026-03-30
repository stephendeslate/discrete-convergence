import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/infra/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';
import * as bcrypt from 'bcryptjs';

// TRACED: AE-AUTH-009
describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockUser = {
    id: '550e8400-e29b-41d4-a716-446655440099',
    email: 'test@test.com',
    passwordHash: '',
    name: 'Test User',
    role: 'USER',
    tenantId: '550e8400-e29b-41d4-a716-446655440000',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(async () => {
    mockUser.passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should register a new user and return a token', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.register({
        email: 'new@test.com',
        password: 'password123',
        name: 'New User',
        role: 'USER',
        tenantId: '550e8400-e29b-41d4-a716-446655440000',
      });

      expect(result).toHaveProperty('access_token', 'mock-jwt-token');
      expect(prisma.user.findFirst).toHaveBeenCalledWith({ where: { email: 'new@test.com' } });
      expect(prisma.user.create).toHaveBeenCalled();
      expect(jwtService.signAsync).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: 'test@test.com',
          password: 'password123',
          name: 'Test',
          role: 'USER',
          tenantId: '550e8400-e29b-41d4-a716-446655440000',
        }),
      ).rejects.toThrow(ConflictException);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.login({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('access_token', 'mock-jwt-token');
      expect(prisma.user.findFirst).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@test.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({ where: { email: 'nobody@test.com' } });
    });
  });

  describe('validateUser', () => {
    it('should return user data for valid userId', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        tenantId: mockUser.tenantId,
      });

      const result = await service.validateUser(mockUser.id);
      expect(result).toHaveProperty('email', mockUser.email);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        select: { id: true, email: true, role: true, tenantId: true },
      });
    });

    it('should return null for non-existent userId', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.validateUser('nonexistent');
      expect(result).toBeNull();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'nonexistent' },
        select: { id: true, email: true, role: true, tenantId: true },
      });
    });
  });
});
