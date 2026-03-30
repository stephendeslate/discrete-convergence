import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/infra/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@event-management/shared';

const mockPrisma = {
  user: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
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
    it('should create a new user successfully', async () => {
      const dto = { email: 'test@test.com', password: 'password123', name: 'Test', tenantId: 'tenant-1', role: 'VIEWER' };
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: '1', email: 'test@test.com', role: 'VIEWER' });

      const result = await service.register(dto);

      expect(result.email).toBe('test@test.com');
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ email: 'test@test.com', tenantId: 'tenant-1' }) }),
      );
    });

    it('should throw ConflictException for duplicate email', async () => {
      const dto = { email: 'existing@test.com', password: 'password123', name: 'Dup', tenantId: 'tenant-1', role: 'VIEWER' };
      mockPrisma.user.findFirst.mockResolvedValue({ id: '1', email: 'existing@test.com' });

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({ where: { email: 'existing@test.com' } });
    });

    it('should use BCRYPT_SALT_ROUNDS from shared', () => {
      expect(BCRYPT_SALT_ROUNDS).toBe(12);
      expect(typeof BCRYPT_SALT_ROUNDS).toBe('number');
    });
  });

  describe('login', () => {
    it('should return access token for valid credentials', async () => {
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('password123', 10);
      mockPrisma.user.findFirst.mockResolvedValue({ id: '1', email: 'test@test.com', passwordHash: hash, role: 'VIEWER', tenantId: 'tenant-1' });
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login({ email: 'test@test.com', password: 'password123' });

      expect(result.access_token).toBe('jwt-token');
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: '1', email: 'test@test.com', role: 'VIEWER', tenantId: 'tenant-1' }),
      );
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('correctpassword', 10);
      mockPrisma.user.findFirst.mockResolvedValue({ id: '1', email: 'test@test.com', passwordHash: hash, role: 'VIEWER', tenantId: 'tenant-1' });

      await expect(service.login({ email: 'test@test.com', password: 'wrongpassword' })).rejects.toThrow(UnauthorizedException);
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(service.login({ email: 'noone@test.com', password: 'password123' })).rejects.toThrow(UnauthorizedException);
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({ where: { email: 'noone@test.com' } });
    });
  });
});
