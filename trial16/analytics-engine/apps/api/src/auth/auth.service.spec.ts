import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../infra/prisma.service';

jest.mock('bcryptjs');
jest.mock('@analytics-engine/shared', () => ({
  parsePagination: jest.fn().mockReturnValue({ skip: 0, take: 10, page: 1, pageSize: 10 }),
  BCRYPT_SALT_ROUNDS: 10,
  APP_VERSION: '1.0.0',
  ALLOWED_REGISTRATION_ROLES: ['user', 'admin'],
}));

const mockPrisma = {
  user: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  $executeRaw: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    const dto = { email: 'test@example.com', password: 'password123', role: 'user', tenantId: 'tenant-1' };

    it('should register a new user successfully', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: dto.email,
        role: dto.role,
        tenantId: dto.tenantId,
      });

      const result = await service.register(dto);

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: dto.email,
          passwordHash: 'hashed-password',
          role: dto.role,
          tenantId: dto.tenantId,
        },
      });
      expect(result).toEqual({ id: 'user-1', email: dto.email, role: dto.role, tenantId: dto.tenantId });
    });

    it('should throw ConflictException if email already registered', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'existing-user' });

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({ where: { email: dto.email } });
    });
  });

  describe('login', () => {
    const dto = { email: 'test@example.com', password: 'password123' };
    const mockUser = {
      id: 'user-1',
      email: dto.email,
      passwordHash: 'hashed-password',
      role: 'user',
      tenantId: 'tenant-1',
    };

    it('should login successfully and return access_token', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(dto);

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        tenantId: mockUser.tenantId,
      });
      expect(result).toEqual({
        access_token: 'jwt-token',
        user: { id: mockUser.id, email: mockUser.email, role: mockUser.role, tenantId: mockUser.tenantId },
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({ where: { email: dto.email } });
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({ where: { email: dto.email } });
    });
  });

  describe('setTenantContext', () => {
    it('should call $executeRaw with tenant id', async () => {
      mockPrisma.$executeRaw.mockResolvedValue(undefined);

      await service.setTenantContext('tenant-1');

      expect(mockPrisma.$executeRaw).toHaveBeenCalled();
    });
  });
});
