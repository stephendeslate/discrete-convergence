import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { createMockPrisma, MockPrisma } from '../../test/helpers/mock-prisma';
import { createTestUser, createTestCompany } from '../../test/helpers/factories';
import * as bcryptjs from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: MockPrisma;
  let jwtService: JwtService;

  beforeEach(() => {
    prisma = createMockPrisma();
    jwtService = {
      sign: jest.fn().mockReturnValue('mock-token'),
      verify: jest.fn(),
    } as unknown as JwtService;
    service = new AuthService(prisma as never, jwtService);
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const user = createTestUser();
      prisma.user.findFirst.mockResolvedValue(user);
      (bcryptjs.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: user.email,
        password: 'password123',
      });

      expect(result.access_token).toBe('mock-token');
      expect(result.refresh_token).toBe('mock-token');
    });

    it('should throw UnauthorizedException for unknown email', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ email: 'unknown@test.com', password: 'pass1234' }),
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      prisma.user.findFirst.mockResolvedValue(createTestUser());
      (bcryptjs.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@test.com', password: 'wrongpass' }),
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    it('should create user and company for valid registration', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      const company = createTestCompany();
      prisma.company.create.mockResolvedValue(company);
      prisma.user.create.mockResolvedValue(createTestUser());
      (bcryptjs.hash as jest.Mock).mockResolvedValue('hashed');

      const result = await service.register({
        email: 'new@test.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        companyName: 'New Co',
        role: 'ADMIN',
      });

      expect(result.access_token).toBeDefined();
      expect(prisma.company.create).toHaveBeenCalled();
    });

    it('should reject registration with invalid role', async () => {
      await expect(
        service.register({
          email: 'new@test.com',
          password: 'password123',
          firstName: 'New',
          lastName: 'User',
          companyName: 'Co',
          role: 'TECHNICIAN',
        }),
      ).rejects.toThrow('Role must be one of');
    });

    it('should reject duplicate email', async () => {
      prisma.user.findUnique.mockResolvedValue(createTestUser());

      await expect(
        service.register({
          email: 'existing@test.com',
          password: 'password123',
          firstName: 'Dup',
          lastName: 'User',
          companyName: 'Co',
          role: 'ADMIN',
        }),
      ).rejects.toThrow('Email already registered');
    });
  });

  describe('refresh', () => {
    it('should return new tokens for valid refresh token', async () => {
      (jwtService.verify as jest.Mock).mockReturnValue({
        sub: 'user-1',
        email: 'test@test.com',
        role: 'ADMIN',
        companyId: 'comp-1',
        tenantId: 'tenant-1',
      });

      const result = await service.refresh('valid-refresh');
      expect(result.access_token).toBeDefined();
    });

    it('should throw for invalid refresh token', async () => {
      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error('invalid');
      });

      await expect(service.refresh('bad-token')).rejects.toThrow(
        'Invalid refresh token',
      );
    });
  });
});
