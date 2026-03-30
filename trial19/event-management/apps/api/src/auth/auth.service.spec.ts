import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../infra/prisma.service';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

const mockPrisma = {
  user: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('signed-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();
    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    const dto = { email: 'new@test.com', password: 'password123', role: 'VIEWER', tenantId: 'tenant-1' };

    it('should register a new user successfully', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pw');
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1', email: dto.email, role: 'VIEWER', tenantId: 'tenant-1', passwordHash: 'hashed-pw',
      });

      const result = await service.register(dto);
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ email: dto.email, tenantId: 'tenant-1' }),
      });
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
    });

    it('should throw ConflictException when email exists', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'existing-user' });
      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({ where: { email: dto.email } });
    });
  });

  describe('login', () => {
    const dto = { email: 'test@test.com', password: 'password123' };

    it('should login with valid credentials', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1', email: dto.email, passwordHash: 'hashed', role: 'VIEWER', tenantId: 'tenant-1',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(dto);
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(result).toHaveProperty('access_token');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({ where: { email: dto.email } });
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1', email: dto.email, passwordHash: 'hashed', role: 'VIEWER', tenantId: 'tenant-1',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(bcrypt.compare).toHaveBeenCalledWith(dto.password, 'hashed');
    });
  });
});
